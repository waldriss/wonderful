'use client';

/**
 * PushNotificationsBanner
 *
 * Bannière discrète proposant d'activer les notifications push.
 * La demande de permission étant soumise à un geste utilisateur (Chrome),
 * elle ne s'affiche que lorsque la permission est encore "default"
 * (jamais demandée) et que le backend est configuré.
 */

import { motion } from 'framer-motion';
import { BellRing, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationsBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { permission, status, enable, isEnabling } = usePushNotifications();

  if (dismissed) return null;
  if (permission !== 'default') return null;
  if (!status?.configured) return null;

  const handleEnable = async () => {
    try {
      await enable();
      toast.success('Notifications activées !');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'activer les notifications";
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-secondary/20 bg-white/60 backdrop-blur-sm mb-6"
    >
      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
        <BellRing className="w-5 h-5 text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-secondary-850 text-sm">
          Recevez vos notifications même hors du site
        </p>
        <p className="text-xs text-secondary-850/60 font-sans">
          Commandes, promotions et récompenses directement sur cet appareil.
        </p>
      </div>
      <button
        onClick={handleEnable}
        disabled={isEnabling}
        className="h-9 px-4 bg-secondary text-white rounded-full font-sans font-semibold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
      >
        {isEnabling ? (
          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          'Activer'
        )}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-850/40 hover:bg-secondary/10 hover:text-secondary-850/70 transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
