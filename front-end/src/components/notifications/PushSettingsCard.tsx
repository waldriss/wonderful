'use client';

/**
 * PushSettingsCard
 *
 * Carte de gestion des notifications push affichée dans le centre de
 * notifications. Permet d'activer/désactiver le push de cet appareil,
 * en complément de la bannière d'accueil.
 */

import { motion } from 'framer-motion';
import { BellRing, BellOff, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushSettingsCard() {
  const {
    supported,
    permission,
    status,
    isStatusLoading,
    enable,
    disable,
    isEnabling,
    isDisabling,
  } = usePushNotifications();

  const devices = status?.subscriptionCount ?? 0;

  const handleEnable = async () => {
    try {
      await enable();
      toast.success('Notifications activées sur cet appareil');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'activer les notifications";
      toast.error(message);
    }
  };

  const handleDisable = async () => {
    try {
      await disable();
      toast.success('Notifications désactivées sur cet appareil');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de désactiver les notifications";
      toast.error(message);
    }
  };

  const getStateLabel = () => {
    if (!supported) return 'Navigateur non compatible';
    if (permission === 'denied') return 'Autorisation bloquée dans le navigateur';
    if (permission === 'granted' && status?.enabled) return 'Actives sur cet appareil';
    if (permission === 'granted') return 'Autorisation accordée, en attente d\'abonnement';
    return 'Non activées';
  };

  const canEnable =
    supported &&
    permission === 'default' &&
    status?.configured &&
    !isEnabling &&
    !isDisabling;

  const canDisable = supported && (permission === 'granted' || devices > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border-2 border-secondary/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
        <BellRing className="w-5 h-5 text-secondary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-sans font-semibold text-secondary-850">
          Notifications push
        </h3>
        <p className="text-sm text-secondary-850/60 font-sans">
          {getStateLabel()}
          {devices > 0 && (
            <span className="inline-flex items-center gap-1 ml-2 text-xs font-medium text-secondary">
              <Smartphone className="w-3 h-3" />
              {devices} appareil{devices > 1 ? "s" : ""} enregistré{devices > 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      <div className="shrink-0">
        {isStatusLoading ? (
          <Loader2 className="w-5 h-5 text-secondary animate-spin" />
        ) : isEnabling || isDisabling ? (
          <Loader2 className="w-5 h-5 text-secondary animate-spin" />
        ) : canEnable ? (
          <button
            onClick={handleEnable}
            className="h-10 px-4 bg-secondary text-white rounded-full font-sans font-semibold text-sm hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            Activer
          </button>
        ) : canDisable ? (
          <button
            onClick={handleDisable}
            className="h-10 px-4 bg-red-100 text-red-600 rounded-full font-sans font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <BellOff className="w-4 h-4" />
            Désactiver
          </button>
        ) : (
          <span className="text-xs text-secondary-850/40 font-sans">
            Indisponible
          </span>
        )}
      </div>
    </motion.div>
  );
}
