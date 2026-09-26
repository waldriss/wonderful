"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin,
  CreditCard,
  Banknote,
  Tag,
  ChevronLeft,
  CheckCircle,
  Package,
  Calendar,
  Loader2,
  ShoppingBag,
  Truck,
  AlertCircle,
  User,
  Phone,
  Mail,
  Gift,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { useActiveDeliveryZones } from "@/lib/api/delivery-zones/queries";
import { useCreateOrder } from "@/lib/api/orders/mutations";
import { authClient } from "@/lib/auth";
import type { CreateOrderDto } from "@/lib/api/orders/types";
import type { DeliveryZone } from "@/lib/api/delivery-zones/types";
import { useMyRewards } from "@/lib/api/gamification/queries";
import type { UserReward } from "@/lib/api/gamification/types";
import { resolveAppImage } from "@/lib/resolve-image";
import { validatePromoCode, type ValidatePromoCodeResponse } from "@/lib/api/promo-codes/clientRequests";

// ============================================
// CONSTANTS
// ============================================

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
];

// ============================================
// FORM SCHEMA
// ============================================

const guestSchema = z.object({
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().min(8, "Numéro de téléphone requis"),
});

const checkoutSchema = z.object({
  deliveryZoneId: z.string().min(1, "Veuillez sélectionner une zone de livraison"),
  deliveryAddress: z.string().min(5, "Adresse de livraison requise (min. 5 caractères)"),
  deliveryPostalCode: z.string().min(4, "Code postal requis"),
  deliveryDate: z.string().optional(),
  deliveryTimeSlot: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(["CARD", "CASH"]),
  promoCode: z.string().optional(),
  // Guest fields (only validated on submit when not authenticated)
  guestName: z.string().optional(),
  guestEmail: z.string().optional(),
  guestPhone: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ============================================
// HELPERS
// ============================================

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ============================================
// SUCCESS VIEW
// ============================================

function OrderSuccess({ orderNumber, onClose, isGuest }: { orderNumber: string; onClose: () => void; isGuest?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-b from-primary-200 to-primary-100 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-xl text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-sans text-secondary-850">
            Commande confirmée !
          </h1>
          <p className="text-secondary-850/60 font-sans">
            Votre commande a été passée avec succès. Nous vous contacterons pour la livraison.
          </p>
        </div>

        <div className="bg-primary-100 rounded-2xl p-4 border-2 border-secondary/10">
          <p className="text-xs font-sans text-secondary-850/60 uppercase tracking-wider mb-1">
            Numéro de commande
          </p>
          <p className="text-xl font-bold font-sans text-secondary tracking-wide">
            {orderNumber}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isGuest && (
            <Link href="/dashboard/user/orders" className="flex-1">
              <Button className="w-full" variant="default">
                <Package className="w-4 h-4 mr-2" />
                Mes commandes
              </Button>
            </Link>
          )}
          <Link href="/boutique" className={isGuest ? "w-full" : "flex-1"}>
            <Button className="w-full" variant={isGuest ? "default" : "outline"} onClick={onClose}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Button>
          </Link>
          {isGuest && (
            <Link href="/auth" className="w-full">
              <Button className="w-full" variant="outline">
                Créer un compte
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// CHECKOUT PAGE
// ============================================

function computeGamificationDiscount(reward: UserReward, subtotal: number, deliveryFee: number): number {
  if (reward.type === "DISCOUNT_PERCENTAGE") return Math.round(subtotal * reward.value / 100);
  if (reward.type === "DISCOUNT_FIXED") return Math.min(reward.value, subtotal);
  if (reward.type === "FREE_DELIVERY") return deliveryFee;
  return 0;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isClientReady, setIsClientReady] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoValidation, setPromoValidation] = useState<ValidatePromoCodeResponse | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const { data: zones = [], isLoading: zonesLoading, isError: zonesError } = useActiveDeliveryZones();
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { data: myRewards = [] } = useMyRewards(isAuthenticated);
  const applicableRewards = myRewards.filter((r) => r.type !== "POINTS");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH",
      deliveryDate: getTomorrowDate(),
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady) return;
    if (items.length === 0 && !successOrderNumber) {
      router.replace("/boutique");
    }
  }, [isClientReady, items.length, router, successOrderNumber]);

  // Auto-fill postal code when zone is selected
  const selectedZoneId = watch("deliveryZoneId");
  const selectedZone: DeliveryZone | undefined = zones.find((z) => z.id === selectedZoneId);

  useEffect(() => {
    if (selectedZone?.postalCodes && selectedZone.postalCodes.length > 0) {
      setValue("deliveryPostalCode", selectedZone.postalCodes[0]);
    }
  }, [selectedZone, setValue]);

  const subtotal = getTotalPrice();
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const selectedReward = applicableRewards.find((r) => r.id === selectedRewardId) ?? null;
  const promoDiscount = promoValidation?.valid ? promoValidation.discount : 0;
  const gamificationDiscount = selectedReward
    ? computeGamificationDiscount(selectedReward, subtotal, deliveryFee)
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - promoDiscount - gamificationDiscount);

  useEffect(() => {
    setPromoValidation(null);
    setValue("promoCode", undefined);
  }, [subtotal, deliveryFee, selectedZoneId, setValue]);

  const handleApplyPromoCode = async () => {
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      toast.error("Veuillez saisir un code promo");
      return;
    }

    setIsValidatingPromo(true);
    try {
      const result = await validatePromoCode({
        code,
        subtotal,
        deliveryFee,
      });

      setPromoValidation(result);

      if (!result.valid) {
        setValue("promoCode", undefined);
        toast.error(result.message);
        return;
      }

      setValue("promoCode", code);
      setSelectedRewardId(null);
      toast.success(result.message);
    } catch (error) {
      setPromoValidation(null);
      setValue("promoCode", undefined);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la validation du code promo");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const onSubmit = (values: CheckoutFormValues) => {
    // Validate guest fields client-side if not authenticated
    if (!isAuthenticated) {
      const result = guestSchema.safeParse({
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
      });
      if (!result.success) {
        result.error.errors.forEach((e) => {
          const field = e.path[0] as keyof CheckoutFormValues;
          setError(field, { message: e.message });
        });
        return;
      }
    }

    const dto: CreateOrderDto = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        supplements: (item.supplements ?? []).map((s) => ({
          supplementId: s.id,
          quantity: s.quantity,
        })),
      })),
      deliveryZoneId: values.deliveryZoneId,
      deliveryAddress: values.deliveryAddress,
      deliveryCity: selectedZone?.name ?? "",
      deliveryPostalCode: values.deliveryPostalCode,
      deliveryDate: values.deliveryDate || undefined,
      deliveryTimeSlot: values.deliveryTimeSlot || undefined,
      deliveryNotes: values.deliveryNotes || undefined,
      paymentMethod: values.paymentMethod as "CARD" | "CASH",
      // promoCode and userRewardId are mutually exclusive
      ...(selectedRewardId
        ? { userRewardId: selectedRewardId }
        : { promoCode: values.promoCode || undefined }),
      ...(!isAuthenticated && {
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
      }),
    };

    createOrder(dto, {
      onSuccess: (order) => {
        clearCart(true);
        setSuccessOrderNumber(order.orderNumber);
      },
    });
  };

  if (successOrderNumber) {
    return (
      <OrderSuccess
        orderNumber={successOrderNumber}
        isGuest={!isAuthenticated}
        onClose={() => setSuccessOrderNumber(null)}
      />
    );
  }

  if (!isClientReady) {
    return (
      <div className="min-h-screen pt-36 pb-20 bg-primary-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center rounded-3xl border-2 border-secondary/10 bg-card p-10 text-secondary-850/70 font-sans">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-secondary" />
            Chargement du checkout...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-20 bg-primary-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary/10 rounded-full transition-colors border-2 border-secondary/10"
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-sans text-secondary-850">Finaliser ma commande</h1>
            <p className="text-sm text-secondary-850/60 font-sans">{items.length} article{items.length > 1 ? "s" : ""} dans votre panier</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ======= LEFT: FORM ======= */}
            <div className="space-y-6">

              {/* Delivery Zone */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold font-sans text-secondary-850">Zone de livraison</h2>
                </div>

                {zonesLoading ? (
                  <div className="flex items-center gap-3 py-4 text-secondary-850/60">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-sans text-sm">Chargement des zones...</span>
                  </div>
                ) : zonesError ? (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-sans">
                    <AlertCircle className="w-4 h-4" />
                    Impossible de charger les zones de livraison.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zones.map((zone) => {
                      const isSelected = selectedZoneId === zone.id;
                      const belowMin = zone.minOrderAmount ? subtotal < zone.minOrderAmount : false;
                      return (
                        <label
                          key={zone.id}
                          className={`relative flex flex-col gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-secondary bg-secondary/5"
                              : belowMin
                              ? "border-secondary/10 opacity-50 cursor-not-allowed"
                              : "border-secondary/10 hover:border-secondary/30"
                          }`}
                        >
                          <input
                            type="radio"
                            {...register("deliveryZoneId")}
                            value={zone.id}
                            disabled={belowMin}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-secondary bg-secondary" : "border-secondary/30"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold font-sans text-secondary-850 text-sm">{zone.name}</span>
                            </div>
                            <span className={`font-bold font-sans text-sm ${zone.fee === 0 ? "text-green-600" : "text-secondary"}`}>
                              {zone.fee === 0 ? "Gratuit" : `${zone.fee} DA`}
                            </span>
                          </div>
                          {zone.minOrderAmount && (
                            <p className="text-xs font-sans text-secondary-850/50 ml-6">
                              Min. {zone.minOrderAmount} DA
                            </p>
                          )}
                          {belowMin && (
                            <p className="text-xs font-sans text-red-500 ml-6">
                              Montant minimum non atteint
                            </p>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.deliveryZoneId && (
                  <p className="text-xs text-red-500 font-sans flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.deliveryZoneId.message}
                  </p>
                )}
              </section>

              {/* Guest Info (shown only when not authenticated) */}
              {!sessionLoading && !isAuthenticated && (
                <section className="bg-card rounded-3xl border-2 border-secondary/10 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                    <h2 className="text-lg font-bold font-sans text-secondary-850">Vos coordonnées</h2>
                  </div>
                  <p className="text-sm font-sans text-secondary-850/60">
                    Vous commandez sans compte.{" "}
                    <Link href={`/auth?returnUrl=${encodeURIComponent("/checkout")}`} className="text-secondary underline underline-offset-2">
                      Se connecter
                    </Link>{" "}
                    pour retrouver vos commandes.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-850/40" />
                        <Input
                          {...register("guestName")}
                          placeholder="Ex: Ahmed Benali"
                          className={`pl-10 rounded-xl border-2 ${errors.guestName ? "border-red-400" : "border-secondary/15"}`}
                        />
                      </div>
                      {errors.guestName && (
                        <p className="text-xs text-red-500 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.guestName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-850/40" />
                        <Input
                          {...register("guestEmail")}
                          type="email"
                          placeholder="votre@email.com"
                          className={`pl-10 rounded-xl border-2 ${errors.guestEmail ? "border-red-400" : "border-secondary/15"}`}
                        />
                      </div>
                      {errors.guestEmail && (
                        <p className="text-xs text-red-500 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.guestEmail.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                        Numéro de téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-850/40" />
                        <Input
                          {...register("guestPhone")}
                          type="tel"
                          placeholder="Ex: 0555 12 34 56"
                          className={`pl-10 rounded-xl border-2 ${errors.guestPhone ? "border-red-400" : "border-secondary/15"}`}
                        />
                      </div>
                      {errors.guestPhone && (
                        <p className="text-xs text-red-500 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.guestPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Delivery Address */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold font-sans text-secondary-850">Adresse de livraison</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("deliveryAddress")}
                      placeholder="Ex: 12 Rue des Oliviers, Appartement 3"
                      className={`rounded-xl border-2 ${errors.deliveryAddress ? "border-red-400" : "border-secondary/15"}`}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-xs text-red-500 mt-1 font-sans">{errors.deliveryAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                        Ville <span className="text-secondary-850/50 font-normal">(zone)</span>
                      </label>
                      <Input
                        value={selectedZone?.name ?? ""}
                        readOnly
                        placeholder="Sélectionnez une zone"
                        className="rounded-xl border-2 border-secondary/15 bg-primary-100/50 text-secondary-850/70 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register("deliveryPostalCode")}
                        placeholder="Ex: 16000"
                        className={`rounded-xl border-2 ${errors.deliveryPostalCode ? "border-red-400" : "border-secondary/15"}`}
                      />
                      {errors.deliveryPostalCode && (
                        <p className="text-xs text-red-500 mt-1 font-sans">{errors.deliveryPostalCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery Schedule */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold font-sans text-secondary-850">
                    Créneau de livraison
                    <span className="ml-2 text-xs font-normal text-secondary-850/50">(optionnel)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                      Date souhaitée
                    </label>
                    <Input
                      type="date"
                      {...register("deliveryDate")}
                      min={getTomorrowDate()}
                      className="rounded-xl border-2 border-secondary/15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                      Créneau horaire
                    </label>
                    <Controller
                      name="deliveryTimeSlot"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="flex h-11 w-full min-w-0 rounded-xl border-2 border-secondary/20 bg-white/50 px-4 py-2 font-sans text-sm text-secondary-850 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        >
                          <option value="">Indifférent</option>
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold font-sans text-secondary-850 mb-1.5">
                    Instructions de livraison
                  </label>
                  <textarea
                    {...register("deliveryNotes")}
                    rows={2}
                    placeholder="Ex: Code d'entrée, étage, instructions particulières..."
                    className="flex w-full min-w-0 rounded-xl border-2 border-secondary/20 bg-white/50 px-4 py-2 font-sans text-sm text-secondary-850 placeholder:text-secondary-850/40 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none"
                  />
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold font-sans text-secondary-850">Mode de paiement</h2>
                </div>

                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          { value: "CASH", label: "Paiement à la livraison", Icon: Banknote },
                          { value: "CARD", label: "Paiement par carte", Icon: CreditCard },
                        ] as const
                      ).map(({ value, label, Icon }) => (
                        <label
                          key={value}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            field.value === value
                              ? "border-secondary bg-secondary/5"
                              : "border-secondary/10 hover:border-secondary/30"
                          }`}
                        >
                          <input
                            type="radio"
                            value={value}
                            checked={field.value === value}
                            onChange={() => field.onChange(value)}
                            className="sr-only"
                          />
                          <Icon
                            className={`w-7 h-7 ${field.value === value ? "text-secondary" : "text-secondary-850/40"}`}
                          />
                          <span className="text-xs font-semibold font-sans text-center text-secondary-850 leading-tight">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </section>
            </div>

            {/* ======= RIGHT: ORDER SUMMARY ======= */}
            <div className="space-y-5">

              {/* Cart Items */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-secondary" />
                  <h2 className="text-base font-bold font-sans text-secondary-850">
                    Récapitulatif ({items.length} article{items.length > 1 ? "s" : ""})
                  </h2>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const finalPrice = item.isOnSale && item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;
                    const supplementsUnitTotal = (item.supplements ?? []).reduce(
                      (sum, s) => sum + s.price * s.quantity,
                      0
                    );
                    const itemPrice = finalPrice + supplementsUnitTotal;
                    return (
                      <div key={item.lineId} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary-100 overflow-hidden flex-shrink-0 border-2 border-secondary/5">
                          <Image
                            src={resolveAppImage(item.image)}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/images/card.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-sans text-secondary-850 truncate">{item.name}</p>
                          <p className="text-xs text-secondary-850/50 font-sans">Qté : {item.quantity}</p>
                          {item.supplements && item.supplements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.supplements.map((s) => (
                                <span key={s.id} className="text-[10px] font-sans text-secondary-850/60 bg-primary-100/60 border border-secondary/10 rounded px-1.5 py-0.5">
                                  + {s.quantity}× {s.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold font-sans text-secondary flex-shrink-0">
                          {(itemPrice * item.quantity).toFixed(0)} DA
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Gamification Rewards (authenticated only) */}
              {isAuthenticated && applicableRewards.length > 0 && (
                <section className="bg-card rounded-3xl border-2 border-secondary/10 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" />
                    <h2 className="text-base font-bold font-sans text-secondary-850">Mes bons de réduction</h2>
                  </div>
                  <div className="space-y-2">
                    {applicableRewards.map((reward) => {
                      const isSelected = selectedRewardId === reward.id;
                      const discountPreview = computeGamificationDiscount(reward, subtotal, deliveryFee);
                      const label =
                        reward.type === "DISCOUNT_PERCENTAGE"
                          ? `${reward.value}% de réduction`
                          : reward.type === "DISCOUNT_FIXED"
                          ? `${reward.value} DA de réduction`
                          : "Livraison gratuite";
                      return (
                        <button
                          key={reward.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedRewardId(null);
                            } else {
                              setSelectedRewardId(reward.id);
                              // Clear promo code (mutually exclusive)
                              setPromoInput("");
                              setPromoValidation(null);
                              setValue("promoCode", undefined);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-secondary bg-secondary/5"
                              : "border-secondary/10 hover:border-secondary/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                isSelected ? "border-secondary bg-secondary" : "border-secondary/30"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold font-sans text-secondary-850">{label}</p>
                              <p className="text-xs font-sans text-secondary-850/50">{reward.source}</p>
                            </div>
                          </div>
                          {selectedZone && discountPreview > 0 && (
                            <span className="text-sm font-bold text-green-600 font-sans flex-shrink-0">
                              -{discountPreview} DA
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedRewardId && (
                    <p className="text-xs text-secondary-850/50 font-sans">
                      Le bon est incompatible avec un code promo.
                    </p>
                  )}
                </section>
              )}

              {/* Promo Code */}
              <section className={`bg-card rounded-3xl border-2 border-secondary/10 p-5 space-y-3 ${
                selectedRewardId ? "opacity-50 pointer-events-none" : ""
              }`}>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-secondary" />
                  <h2 className="text-base font-bold font-sans text-secondary-850">Code promo</h2>
                  {selectedRewardId && (
                    <span className="ml-auto text-xs text-secondary-850/40 font-sans">
                      Désactivé (bon appliqué)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoValidation(null);
                      setValue("promoCode", undefined);
                    }}
                    placeholder="VOTRE CODE"
                    disabled={!!selectedRewardId}
                    className="rounded-xl border-2 border-secondary/15 uppercase tracking-widest text-sm"
                  />
                  <Button
                    type="button"
                    className="shrink-0"
                    disabled={!!selectedRewardId || isValidatingPromo}
                    onClick={handleApplyPromoCode}
                  >
                    {isValidatingPromo ? "Validation..." : "Appliquer"}
                  </Button>
                </div>
                {promoValidation && (
                  <p
                    className={`text-xs font-sans ${promoValidation.valid ? "text-green-700" : "text-red-600"}`}
                  >
                    {promoValidation.message}
                  </p>
                )}
              </section>

              {/* Order Total */}
              <section className="bg-card rounded-3xl border-2 border-secondary/10 p-5 space-y-3 sticky top-6">
                <h2 className="text-base font-bold font-sans text-secondary-850">Total commande</h2>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-secondary-850/70">Sous-total</span>
                    <span className="font-semibold text-secondary-850">{subtotal.toFixed(0)} DA</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-secondary-850/70">Frais de livraison</span>
                    {selectedZone ? (
                      <span
                        className={`font-semibold ${
                          deliveryFee === 0 || (selectedReward?.type === "FREE_DELIVERY")
                            ? "text-green-600"
                            : "text-secondary-850"
                        }`}
                      >
                        {deliveryFee === 0 || (selectedReward?.type === "FREE_DELIVERY")
                          ? "Gratuit"
                          : `${deliveryFee} DA`}
                      </span>
                    ) : (
                      <span className="text-secondary-850/40 italic text-xs">Choisir une zone</span>
                    )}
                  </div>

                  {/* Gamification discount line */}
                  {selectedReward && gamificationDiscount > 0 && selectedReward.type !== "FREE_DELIVERY" && (
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-green-700 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        {selectedReward.type === "DISCOUNT_PERCENTAGE"
                          ? `Réduction ${selectedReward.value}%`
                          : `Réduction fixe`}
                      </span>
                      <span className="font-semibold text-green-600">-{gamificationDiscount} DA</span>
                    </div>
                  )}

                  {promoValidation?.valid && promoDiscount > 0 && (
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-green-700 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Code promo {promoValidation.code}
                      </span>
                      <span className="font-semibold text-green-600">-{promoDiscount} DA</span>
                    </div>
                  )}

                  <div className="h-px bg-secondary/10 my-1" />

                  <div className="flex justify-between">
                    <span className="text-base font-bold font-sans text-secondary-850">Total</span>
                    <span className="text-xl font-bold font-sans text-secondary">
                      {(selectedZone ? total : subtotal).toFixed(0)} DA
                    </span>
                  </div>
                </div>

                {selectedZone?.minOrderAmount && subtotal < selectedZone.minOrderAmount && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-sans text-amber-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Cette zone requiert un minimum de {selectedZone.minOrderAmount} DA. 
                      Il vous manque {selectedZone.minOrderAmount - subtotal} DA.
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold"
                  size="lg"
                  disabled={isCreating || !selectedZone}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-secondary-850/40 font-sans">
                  En passant votre commande, vous acceptez nos conditions générales de vente.
                </p>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
