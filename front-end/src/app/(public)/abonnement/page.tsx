"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Stepper from "@/components/abonnement/Stepper";
import Step1SubscriptionType from "@/components/abonnement/Step1SubscriptionType";
import Step2ProductSelection from "@/components/abonnement/Step2ProductSelection";
import Step3DeliveryInfo from "@/components/abonnement/Step3DeliveryInfo";
import Step4ClientInfo from "@/components/abonnement/Step4ClientInfo";
import Step5ThankYou from "@/components/abonnement/Step5ThankYou";
import {
  SubscriptionData,
  SubscriptionType,
  ProductItem,
  DeliverySchedule,
  CustomerInfo,
} from "@/components/abonnement/types";
import { usePlans, useSubscribe } from "@/lib/api/subscriptions";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Abonnement", description: "Type de formule" },
  { id: 2, title: "Produits", description: "Choisir vos plats" },
  { id: 3, title: "Livraison", description: "Où et quand" },
  { id: 4, title: "Informations", description: "Vos coordonnées" },
  { id: 5, title: "Confirmation", description: "Valider" },
];

const INITIAL_DATA: SubscriptionData = {
  subscriptionType: "monthly",
  selectedPlanId: null,
  selectedPlanName: null,
  selectedProducts: [],
  deliverySchedule: {
    days: [],
    location: null,
    address: "",
    timeSlot: null,
    paymentMethod: null,
  },
  customerInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  },
};

export default function AbonnementPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData>(INITIAL_DATA);
  const [isCompleted, setIsCompleted] = useState(false);

  // Plans depuis l'API
  const { data: plans, isLoading: isLoadingPlans } = usePlans();

  useEffect(() => {
    if (!plans || plans.length === 0) return;

    const visiblePlans = plans.filter((plan) => plan.type !== "CUSTOM");
    if (visiblePlans.length === 0) return;

    const planTypeMap: Record<string, SubscriptionType> = {
      MONTHLY: "monthly",
      QUARTERLY: "quarterly",
      ANNUAL: "annual",
      CUSTOM: "custom",
    };

    setSubscriptionData((prev) => {
      if (
        prev.selectedPlanId &&
        visiblePlans.some((plan) => plan.id === prev.selectedPlanId)
      ) {
        return prev;
      }

      const firstPlan = visiblePlans[0];
      const mappedType = planTypeMap[firstPlan.type] ?? "monthly";

      return {
        ...prev,
        subscriptionType: mappedType,
        selectedPlanId: firstPlan.id,
        selectedPlanName: firstPlan.name,
      };
    });
  }, [plans]);

  // Mutation pour créer l'abonnement à la dernière étape
  const subscribeMutation = useSubscribe();

  /** Mappe le type wizard vers l'ID plan API */
  const getSelectedPlanId = (): string | undefined => {
    if (subscriptionData.selectedPlanId) {
      return subscriptionData.selectedPlanId;
    }

    if (!plans) return undefined;
    const visiblePlans = plans.filter((plan) => plan.type !== "CUSTOM");

    const planTypeMap: Record<SubscriptionType, string> = {
      monthly: "MONTHLY",
      quarterly: "QUARTERLY",
      annual: "ANNUAL",
      custom: "CUSTOM",
    };
    const apiType = planTypeMap[subscriptionData.subscriptionType];
    return visiblePlans.find((plan) => plan.type === apiType)?.id;
  };

  const handleSubscriptionTypeChange = (
    type: SubscriptionType,
    planId?: string,
    planName?: string
  ) => {
    setSubscriptionData((prev) => ({
      ...prev,
      subscriptionType: type,
      selectedPlanId: planId ?? null,
      selectedPlanName: planName ?? null,
    }));
  };

  const handleProductsChange = (products: ProductItem[]) => {
    setSubscriptionData((prev) => ({ ...prev, selectedProducts: products }));
  };

  const handleDeliveryChange = (schedule: DeliverySchedule) => {
    setSubscriptionData((prev) => ({ ...prev, deliverySchedule: schedule }));
  };

  const handleCustomerChange = (info: CustomerInfo) => {
    setSubscriptionData((prev) => ({ ...prev, customerInfo: info }));
  };

  const handleAddSuggestedProducts = (products: ProductItem[]) => {
    setSubscriptionData((prev) => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, ...products],
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4) {
      // Dernière étape de saisie → créer l'abonnement
      const planId = getSelectedPlanId();
      const { deliverySchedule } = subscriptionData;

      if (!planId) {
        toast.error("Plan d'abonnement introuvable");
        return;
      }

      const paymentMethodMap: Record<string, "CARD" | "CASH" | "TRANSFER"> = {
        card: "CARD",
        cash: "CASH",
      };

      subscribeMutation.mutate(
        {
          planId,
          deliveryAddress: deliverySchedule.address,
          deliveryDays: deliverySchedule.days,
          deliveryTimeSlot: deliverySchedule.timeSlot ?? undefined,
          paymentMethod:
            paymentMethodMap[deliverySchedule.paymentMethod ?? "card"] ?? "CARD",
        },
        {
          onSuccess: () => {
            setCurrentStep(5);
            setIsCompleted(true);
          },
          onError: (err: Error) => {
            toast.error(err.message || "Erreur lors de la création de l'abonnement");
          },
        }
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goHome = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-primary-100">
      {/* Header */}
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-sans text-secondary-850 mb-4"
          >
            {isCompleted ? "Commande confirmée" : "Créez votre abonnement"}
          </motion.h1>
          <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-4" />
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-secondary-850/70 text-lg font-sans"
          >
            {isCompleted
              ? "Merci pour votre confiance !"
              : "Personnalisez votre expérience en quelques étapes"}
          </motion.p>
        </div>
      </div>

      {/* Stepper */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 mb-8"
        >
          <div className="max-w-4xl mx-auto">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <Step5ThankYou
                key="thank-you"
                subscriptionData={subscriptionData}
                onAddProducts={handleAddSuggestedProducts}
                onGoHome={goHome}
              />
            ) : (
              <>
                {currentStep === 1 && (
                  <Step1SubscriptionType
                    key="step1"
                    selectedType={subscriptionData.subscriptionType}
                    selectedPlanId={subscriptionData.selectedPlanId}
                    onSelect={handleSubscriptionTypeChange}
                    onNext={nextStep}
                    apiPlans={plans}
                    isLoadingPlans={isLoadingPlans}
                  />
                )}
                {currentStep === 2 && (
                  <Step2ProductSelection
                    key="step2"
                    selectedProducts={subscriptionData.selectedProducts}
                    onProductsChange={handleProductsChange}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 3 && (
                  <Step3DeliveryInfo
                    key="step3"
                    deliverySchedule={subscriptionData.deliverySchedule}
                    onDeliveryChange={handleDeliveryChange}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 4 && (
                  <Step4ClientInfo
                    key="step4"
                    customerInfo={subscriptionData.customerInfo}
                    onCustomerChange={handleCustomerChange}
                    onNext={nextStep}
                    onBack={prevStep}
                    isSubmitting={subscribeMutation.isPending}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
