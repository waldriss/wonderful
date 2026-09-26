"use client";

import { motion } from "framer-motion";
import { SubscriptionData, ProductItem } from "./types";
import { cn, formatDzdAmount } from "@/lib/utils";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  User,
  Gift,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Flame,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Step5ThankYouProps {
  subscriptionData: SubscriptionData;
  onAddProducts: (products: ProductItem[]) => void;
  onGoHome: () => void;
}

// Suggested products (upsell)
const SUGGESTED_PRODUCTS: ProductItem[] = [
  {
    id: "suggest-1",
    name: "Smoothie Detox",
    description: "Épinards, banane, pomme",
    price: 6.5,
    category: "drinks",
    image: "/images/card.png",
    quantity: 0,
  },
  {
    id: "suggest-2",
    name: "Energy Balls",
    description: "Dattes, amandes, cacao",
    price: 4.0,
    category: "desserts",
    image: "/images/card.png",
    quantity: 0,
  },
  {
    id: "suggest-3",
    name: "Salade César",
    description: "Poulet grillé, parmesan, croûtons",
    price: 11.5,
    category: "meals",
    image: "/images/card.png",
    quantity: 0,
  },
];

const SUBSCRIPTION_LABELS = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  annual: "Annuel",
  custom: "Personnalisé",
};

const DAY_LABELS: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mer",
  thursday: "Jeu",
  friday: "Ven",
  saturday: "Sam",
  sunday: "Dim",
};

const LOCATION_LABELS: Record<string, string> = {
  home: "À domicile",
  work: "Au bureau",
  pickup: "Point relais",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Matin (8h-12h)",
  noon: "Midi (12h-14h)",
  afternoon: "Après-midi (14h-18h)",
  evening: "Soir (18h-21h)",
};

export default function Step5ThankYou({
  subscriptionData,
  onAddProducts,
  onGoHome,
}: Step5ThankYouProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<ProductItem[]>([]);
  const [showConfetti, setShowConfetti] = useState(true);

  const totalProductsPrice = subscriptionData.selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const discount = subscriptionData.customerInfo.password ? 0.1 : 0;
  const discountAmount = totalProductsPrice * discount;
  const finalTotal = totalProductsPrice - discountAmount;

  const toggleSuggestion = (product: ProductItem) => {
    setSelectedSuggestions((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleAddSuggestions = () => {
    if (selectedSuggestions.length > 0) {
      onAddProducts(selectedSuggestions);
    }
  };

  // Group products by category
  const groupedProducts = subscriptionData.selectedProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, ProductItem[]>);

  const categoryLabels: Record<string, string> = {
    meals: "Plats",
    drinks: "Boissons",
    desserts: "Desserts & Snacks",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-secondary/10 rounded-full mx-auto flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-secondary" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold font-sans text-secondary-850 mb-2">
          Merci pour votre commande ! 🎉
        </h1>
        <div className="mx-auto w-16 h-[4px] rounded-full bg-secondary mb-4" />
        <p className="font-sans text-secondary-850/70 text-lg">
          Votre abonnement a été confirmé avec succès
        </p>
        {subscriptionData.customerInfo.password && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 inline-flex items-center gap-2 bg-primary-200 text-secondary-850 px-4 py-2 rounded-full"
          >
            <Gift className="w-5 h-5 text-primary-600" />
            <span className="font-medium font-sans">
              -10% appliqué • Compte créé !
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Daily Streak Reward */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-secondary to-secondary-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold font-sans mb-1">
              Débloquez des récompenses quotidiennes ! 🔥
            </h3>
            <p className="text-white/90 text-sm font-sans">
              Commandez chaque jour et gagnez des points. 7 jours consécutifs = dessert gratuit !
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={cn(
                "flex-1 h-2 rounded-full",
                day === 1 ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
        <p className="text-white/80 text-xs font-sans mt-2 text-center">
          Jour 1/7 • Continuez pour débloquer votre récompense
        </p>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border-2 border-secondary/5 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-secondary-850" />
          </div>
          <h3 className="text-lg font-semibold font-sans text-secondary-850">
            Résumé de votre commande
          </h3>
        </div>

        {/* Subscription Type */}
        <div className="flex items-center justify-between py-3 border-b border-secondary/5">
          <span className="font-sans text-secondary-850/70">Type d&apos;abonnement</span>
          <span className="font-semibold font-sans text-secondary">
            {subscriptionData.selectedPlanName ?? SUBSCRIPTION_LABELS[subscriptionData.subscriptionType]}
          </span>
        </div>

        {/* Products */}
        <div className="py-4 border-b border-secondary/5">
          <p className="font-sans text-secondary-850/70 mb-3">Produits sélectionnés</p>
          {Object.entries(groupedProducts).map(([category, products]) => (
            <div key={category} className="mb-3">
              <p className="text-xs font-medium font-sans text-secondary-850/40 uppercase mb-2">
                {categoryLabels[category]}
              </p>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="font-sans text-secondary-850">
                    {product.name} × {product.quantity}
                  </span>
                  <span className="font-medium font-sans text-secondary-850">
                    {formatDzdAmount(product.price * product.quantity)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between font-sans">
            <span className="text-secondary-850/70">Sous-total</span>
            <span className="text-secondary-850">{formatDzdAmount(totalProductsPrice)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between font-sans text-primary-600">
              <span>Réduction compte (-10%)</span>
              <span>-{formatDzdAmount(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-secondary/5 font-sans">
            <span className="text-secondary-850">Total</span>
            <span className="text-secondary">{formatDzdAmount(finalTotal)}</span>
          </div>
        </div>
      </motion.div>

      {/* Delivery Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border-2 border-secondary/5 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold font-sans text-secondary-850">
            Informations de livraison
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-secondary-850/40 mt-0.5" />
            <div>
              <p className="text-sm font-sans text-secondary-850/60">Jours de livraison</p>
              <p className="font-medium font-sans text-secondary-850">
                {subscriptionData.deliverySchedule.days
                  .map((d) => DAY_LABELS[d])
                  .join(", ")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-secondary-850/40 mt-0.5" />
            <div>
              <p className="text-sm font-sans text-secondary-850/60">Lieu</p>
              <p className="font-medium font-sans text-secondary-850">
                {LOCATION_LABELS[subscriptionData.deliverySchedule.location || ""]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-secondary-850/40 mt-0.5" />
            <div>
              <p className="text-sm font-sans text-secondary-850/60">Heure</p>
              <p className="font-medium font-sans text-secondary-850">
                {TIME_LABELS[subscriptionData.deliverySchedule.timeSlot || ""]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-secondary-850/40 mt-0.5" />
            <div>
              <p className="text-sm font-sans text-secondary-850/60">Client</p>
              <p className="font-medium font-sans text-secondary-850">
                {subscriptionData.customerInfo.firstName}{" "}
                {subscriptionData.customerInfo.lastName}
              </p>
            </div>
          </div>
        </div>

        {subscriptionData.deliverySchedule.address && (
          <div className="mt-4 p-3 bg-primary-100 rounded-2xl border border-primary-200">
            <p className="text-sm font-sans text-secondary-850/60">Adresse de livraison</p>
            <p className="font-medium font-sans text-secondary-850">{subscriptionData.deliverySchedule.address}</p>
          </div>
        )}
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border-2 border-secondary/5 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secondary-850" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sans text-secondary-850">
              Complétez votre commande
            </h3>
            <p className="text-sm font-sans text-secondary-850/60">
              Ces produits pourraient vous plaire
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUGGESTED_PRODUCTS.map((product) => {
            const isSelected = selectedSuggestions.some((p) => p.id === product.id);
            return (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleSuggestion(product)}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 overflow-hidden transition-all",
                  isSelected
                    ? "border-secondary bg-secondary/5"
                    : "border-secondary/5 hover:border-secondary/20"
                )}
              >
                <div className="relative h-32">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold font-sans text-secondary-850">{product.name}</h4>
                  <p className="text-xs font-sans text-secondary-850/60">{product.description}</p>
                  <p className="mt-2 font-bold font-sans text-secondary">
                    +{formatDzdAmount(product.price)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedSuggestions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAddSuggestions}
            className="w-full mt-4 h-12 bg-secondary text-white rounded-full font-semibold font-sans hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Ajouter {selectedSuggestions.length} produit
            {selectedSuggestions.length > 1 ? "s" : ""} (+
            {formatDzdAmount(selectedSuggestions.reduce((sum, p) => sum + p.price, 0))})
          </motion.button>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={onGoHome}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-14 px-6 rounded-full bg-secondary text-white font-semibold font-sans hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
        >
          Retour à l&apos;accueil
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
