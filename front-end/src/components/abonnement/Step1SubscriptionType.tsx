"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, CalendarRange, Settings2, Check, Star } from "lucide-react";
import { cn, formatDzdAmount } from "@/lib/utils";
import { SubscriptionType } from "./types";
import type { SubscriptionPlan } from "@/lib/api/subscriptions/types";
import { Skeleton } from "@/components/ui/skeleton";

interface Step1Props {
  selectedType: SubscriptionType;
  selectedPlanId?: string | null;
  onSelect: (type: SubscriptionType, planId?: string, planName?: string) => void;
  onNext: () => void;
  /** Plans chargés depuis l'API — si fournis, remplacent les données statiques */
  apiPlans?: SubscriptionPlan[];
  isLoadingPlans?: boolean;
}

const PLAN_TYPE_MAP: Record<string, SubscriptionType> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUAL: "annual",
  CUSTOM: "custom",
};

const PLAN_ICONS: Record<SubscriptionType, React.ReactNode> = {
  monthly: <Calendar className="w-7 h-7" />,
  quarterly: <CalendarDays className="w-7 h-7" />,
  annual: <CalendarRange className="w-7 h-7" />,
  custom: <Settings2 className="w-7 h-7" />,
};

const PLAN_PERIOD_LABELS: Record<SubscriptionType, string> = {
  monthly: "/mois",
  quarterly: "/trimestre",
  annual: "/an",
  custom: "",
};

const STATIC_OPTIONS = [
  {
    key: "monthly",
    id: "monthly" as SubscriptionType,
    planId: null as string | null,
    name: "Mensuel",
    price: 49,
    period: PLAN_PERIOD_LABELS.monthly,
    description: "Parfait pour essayer",
    features: ["Sans engagement", "Modifiable à tout moment", "Livraison incluse"],
    popular: false,
    badge: null as string | null,
  },
  {
    key: "quarterly",
    id: "quarterly" as SubscriptionType,
    planId: null as string | null,
    name: "Trimestriel",
    price: 44,
    period: PLAN_PERIOD_LABELS.quarterly,
    description: "Notre recommandation",
    features: ["Économisez 10%", "3 mois d'engagement", "Livraison express offerte"],
    popular: true,
    badge: "-10%",
  },
  {
    key: "annual",
    id: "annual" as SubscriptionType,
    planId: null as string | null,
    name: "Annuel",
    price: 39,
    period: PLAN_PERIOD_LABELS.annual,
    description: "Le meilleur rapport qualité-prix",
    features: ["Économisez 20%", "12 mois d'engagement", "VIP support", "Cadeaux exclusifs"],
    popular: false,
    badge: "-20%",
  },
];

const Step1SubscriptionType: React.FC<Step1Props> = ({
  selectedType,
  selectedPlanId,
  onSelect,
  onNext,
  apiPlans,
  isLoadingPlans,
}) => {
  // Construire les options d'affichage depuis l'API ou le fallback statique
  const displayOptions = React.useMemo(() => {
    if (!apiPlans) return STATIC_OPTIONS;
    const visibleApiPlans = apiPlans.filter((plan) => plan.type !== "CUSTOM");
    if (visibleApiPlans.length === 0) return [];

    return visibleApiPlans.map((plan) => {
      const typeKey = PLAN_TYPE_MAP[plan.type] ?? "monthly";
      const staticMatch = STATIC_OPTIONS.find((o) => o.id === typeKey);
      return {
        key: plan.id,
        id: typeKey,
        planId: plan.id,
        name: plan.name,
        price: plan.basePrice,
        period: PLAN_PERIOD_LABELS[typeKey],
        description: plan.description ?? staticMatch?.description ?? "",
        features: plan.features.length > 0 ? plan.features : (staticMatch?.features ?? []),
        popular: typeKey === "quarterly",
        badge: plan.discount ? `-${plan.discount}%` : null,
      };
    });
  }, [apiPlans]);

  const selectedOption = React.useMemo(
    () =>
      displayOptions.find((option) =>
        option.planId ? option.planId === selectedPlanId : option.id === selectedType
      ),
    [displayOptions, selectedPlanId, selectedType]
  );

  const canContinue = !!selectedOption;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoadingPlans) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-14 rounded-full" />
      </div>
    );
  }

  if (displayOptions.length === 0) {
    return (
      <div className="bg-card border-2 border-secondary/5 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-semibold font-sans text-secondary-850">Aucune formule disponible</h3>
        <p className="mt-2 text-sm font-sans text-secondary-850/70">
          Aucun plan actif n&apos;a encore été configuré par l&apos;administrateur.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayOptions.map((option) => {
          const isSelected = option.planId
            ? option.planId === selectedPlanId
            : selectedType === option.id;

          return (
            <motion.div
              key={option.key}
              variants={itemVariants}
              onClick={() => onSelect(option.id, option.planId ?? undefined, option.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative bg-card rounded-2xl p-6 cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-2 border-secondary shadow-md"
                  : "border-2 border-secondary/5 hover:border-secondary/20",
                option.popular && "md:scale-105"
              )}
            >
              {/* Popular badge */}
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-sans font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Populaire
                  </span>
                </div>
              )}

              {/* Discount badge */}
              {option.badge && !option.popular && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-primary-400 text-secondary-850 px-3 py-1 rounded-full text-sm font-sans font-bold">
                    {option.badge}
                  </span>
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary-200 text-secondary-850"
                  )}
                >
                  {PLAN_ICONS[option.id] ?? <Calendar className="w-7 h-7" />}
                </div>

                <div className="flex-1">
                  {/* Name & Price */}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3
                      className={cn(
                        "font-bold font-sans text-xl",
                        isSelected ? "text-secondary" : "text-secondary-850"
                      )}
                    >
                      {option.name}
                    </h3>
                    {option.price !== null && (
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-bold font-sans text-secondary-850">
                          {formatDzdAmount(option.price)}
                        </span>
                        {option.period && (
                          <span className="text-secondary-850/60 text-sm font-sans">{option.period}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-secondary-850/60 text-sm font-sans mt-1">{option.description}</p>

                  {/* Features */}
                  <ul className="mt-4 space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-sans">
                        <Check
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isSelected ? "text-secondary" : "text-primary-600"
                          )}
                        />
                        <span className="text-secondary-850/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.button
        variants={itemVariants}
        onClick={onNext}
        disabled={!canContinue}
        whileHover={canContinue ? { scale: 1.02 } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
        className={cn(
          "w-full h-14 rounded-full font-semibold font-sans text-lg transition-all",
          canContinue
            ? "bg-secondary text-white hover:bg-secondary/90 shadow-md"
            : "bg-primary-200 text-secondary-850/40 cursor-not-allowed"
        )}
      >
        Continuer avec {selectedOption?.name ?? "une formule"}
      </motion.button>
    </motion.div>
  );
};

export default Step1SubscriptionType;
