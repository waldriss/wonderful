"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Package,
  Edit,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSubscriptionPlanTypeLabel } from "@/lib/product-labels";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMySubscription,
  useSubscriptionHistory,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
} from "@/lib/api/subscriptions";
import type { Subscription } from "@/lib/api/subscriptions/types";

// ============================================
// HELPERS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  PAUSED: "En pause",
  CANCELLED: "Annulé",
  EXPIRED: "Expiré",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500",
  PAUSED: "bg-yellow-500",
  CANCELLED: "bg-red-500",
  EXPIRED: "bg-gray-400",
};

const DAY_LABELS: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

const PAYMENT_LABELS: Record<string, string> = {
  CARD: "Carte bancaire",
  CASH: "Paiement à la livraison",
  TRANSFER: "Virement",
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// ============================================
// LOADING SKELETON
// ============================================

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-48 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-56 rounded-3xl" />
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function NoSubscription() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-secondary/60" />
      </div>
      <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-2">
        Aucun abonnement actif
      </h2>
      <p className="text-secondary-850/60 font-sans mb-6 max-w-sm">
        Vous n'avez pas encore d'abonnement. Découvrez nos formules et commencez dès aujourd'hui !
      </p>
      <a
        href="/abonnement"
        className="h-12 px-8 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
      >
        Découvrir les formules
        <ChevronRight className="w-5 h-5" />
      </a>
    </motion.div>
  );
}

// ============================================
// CONFIRM DIALOG (simple inline)
// ============================================

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  confirmClass?: string;
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmLabel = "Confirmer",
  confirmClass = "bg-secondary text-white",
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-md w-full"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="font-sans text-secondary-850 pt-2">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 border-2 border-secondary/20 rounded-full font-sans font-semibold text-secondary-850 hover:border-secondary/40 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 h-10 rounded-full font-sans font-semibold flex items-center justify-center gap-2 transition-colors",
              confirmClass
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function SubscriptionPage() {
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showModifyDelivery, setShowModifyDelivery] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: subscription, isLoading, error } = useMySubscription();
  const { data: history = [], isLoading: isLoadingHistory } = useSubscriptionHistory(showHistory);

  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();

  if (isLoading) return <SubscriptionSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-secondary-850/60 font-sans">Erreur lors du chargement de l'abonnement.</p>
      </div>
    );
  }

  if (!subscription) return <NoSubscription />;

  const isActive = subscription.status === "ACTIVE";
  const isPaused = subscription.status === "PAUSED";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <Package className="w-8 h-8 text-secondary" />
          Mon Abonnement
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Gérez votre abonnement et vos préférences
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-2 border-secondary/30 rounded-3xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-sans font-bold text-secondary-850">
                {subscription.plan.name}
              </h2>
              <span
                className={cn(
                  "px-3 py-1 text-white text-xs font-sans font-semibold rounded-full",
                  STATUS_COLORS[subscription.status] ?? "bg-gray-400"
                )}
              >
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
            </div>
              <p className="text-secondary-850/70 font-sans mb-4">
                Formule {formatSubscriptionPlanTypeLabel(subscription.plan.type)}
              </p>

            <div className="space-y-2 text-sm font-sans">
              <div className="flex items-center gap-2 text-secondary-850/70">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>Début : {formatDate(subscription.startDate)}</span>
              </div>
              {subscription.nextBillingDate && (
                <div className="flex items-center gap-2 text-secondary-850/70">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>Prochain renouvellement : {formatDate(subscription.nextBillingDate)}</span>
                </div>
              )}
              {subscription.nextDeliveryDate && (
                <div className="flex items-center gap-2 text-secondary-850/70">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span>Prochaine livraison : {formatDate(subscription.nextDeliveryDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-secondary-850/70">
                <CreditCard className="w-4 h-4 text-secondary" />
                <span>{subscription.deliveriesCount} livraison{subscription.deliveriesCount !== 1 ? "s" : ""} effectuée{subscription.deliveriesCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-4xl font-sans font-bold text-secondary mb-1">
              {subscription.plan.basePrice}€
            </div>
            <p className="text-secondary-850/60 font-sans text-sm mb-4">
              par mois
            </p>
          </div>
        </div>
      </motion.div>

      {/* Delivery Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-sans font-bold text-secondary-850">Informations de livraison</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModifyDelivery(true)}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery days */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-secondary" />
              <h4 className="font-sans font-semibold text-secondary-850">Jours de livraison</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {subscription.deliveryDays.map((day) => (
                <span
                  key={day}
                  className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-sans font-medium"
                >
                  {DAY_LABELS[day] ?? day}
                </span>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-secondary" />
              <h4 className="font-sans font-semibold text-secondary-850">Adresse</h4>
            </div>
            <p className="text-secondary-850/60 font-sans text-sm">
              {subscription.deliveryAddress}
            </p>
          </div>

          {/* Time slot */}
          {subscription.deliveryTimeSlot && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-secondary" />
                <h4 className="font-sans font-semibold text-secondary-850">Créneau horaire</h4>
              </div>
              <p className="text-secondary-850/70 font-sans text-sm">
                {subscription.deliveryTimeSlot}
              </p>
            </div>
          )}

          {/* Payment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-secondary" />
              <h4 className="font-sans font-semibold text-secondary-850">Paiement</h4>
            </div>
            <p className="text-secondary-850/70 font-sans text-sm">
              {PAYMENT_LABELS[subscription.paymentMethod] ?? subscription.paymentMethod}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pause / Resume */}
        {isActive && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPauseConfirm(true)}
            className="h-12 px-6 bg-card border-2 border-secondary/20 rounded-full font-sans font-semibold text-secondary-850 hover:border-secondary/40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Suspendre l'abonnement
          </motion.button>
        )}
        {isPaused && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => resumeMutation.mutate()}
            disabled={resumeMutation.isPending}
            className="h-12 px-6 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {resumeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Reprendre l'abonnement
          </motion.button>
        )}

        {/* History */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHistory((p) => !p)}
          className="h-12 px-6 bg-card border-2 border-secondary/20 rounded-full font-sans font-semibold text-secondary-850 hover:border-secondary/40 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4" />
          Historique
        </motion.button>

        {/* Cancel */}
        {(isActive || isPaused) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCancelConfirm(true)}
            className="h-12 px-6 bg-red-500 text-white rounded-full font-sans font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Annuler l'abonnement
          </motion.button>
        )}
      </div>

      {/* History Panel */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <h3 className="text-xl font-sans font-bold text-secondary-850 mb-4">
            Historique des abonnements
          </h3>
          {isLoadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <p className="text-secondary-850/60 font-sans text-sm">Aucun historique disponible.</p>
          ) : (
            <div className="space-y-3">
              {history.map((sub: Subscription) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-secondary/10"
                >
                  <div>
                    <p className="font-sans font-semibold text-secondary-850 text-sm">
                      {sub.plan.name}
                    </p>
                    <p className="text-xs text-secondary-850/50 font-sans">
                      Du {formatDate(sub.startDate)}
                      {sub.cancelledAt && ` au ${formatDate(sub.cancelledAt)}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 text-white text-xs font-sans font-semibold rounded-full",
                      STATUS_COLORS[sub.status] ?? "bg-gray-400"
                    )}
                  >
                    {STATUS_LABELS[sub.status] ?? sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      {showModifyDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModifyDelivery(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-2xl w-full"
          >
            <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-4">
              Modifier la livraison
            </h2>
            <p className="text-secondary-850/60 font-sans mb-6">
              Fonctionnalité à venir... 🚀
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModifyDelivery(false)}
              className="h-10 px-6 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200"
            >
              Fermer
            </motion.button>
          </motion.div>
        </div>
      )}

      {showPauseConfirm && (
        <ConfirmDialog
          message="Êtes-vous sûr de vouloir suspendre votre abonnement ? Vous pourrez le reprendre à tout moment."
          onConfirm={() => {
            pauseMutation.mutate(undefined, {
              onSuccess: () => setShowPauseConfirm(false),
            });
          }}
          onCancel={() => setShowPauseConfirm(false)}
          isLoading={pauseMutation.isPending}
          confirmLabel="Suspendre"
          confirmClass="bg-yellow-500 text-white"
        />
      )}

      {showCancelConfirm && (
        <ConfirmDialog
          message="Êtes-vous sûr de vouloir annuler définitivement votre abonnement ? Cette action est irréversible."
          onConfirm={() => {
            cancelMutation.mutate(undefined, {
              onSuccess: () => setShowCancelConfirm(false),
            });
          }}
          onCancel={() => setShowCancelConfirm(false)}
          isLoading={cancelMutation.isPending}
          confirmLabel="Annuler l'abonnement"
          confirmClass="bg-red-500 text-white"
        />
      )}
    </motion.div>
  );
}
