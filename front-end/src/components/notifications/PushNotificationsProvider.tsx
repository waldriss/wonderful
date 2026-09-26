'use client';

/**
 * PushNotificationsProvider
 *
 * Monte la bannière d'activation push dans la zone utilisateur.
 * Si la permission a déjà été accordée lors d'une visite précédente,
 * il s'assure que le navigateur est bien abonné et que la souscription
 * est enregistrée côté backend (l'upsert backend déduplique par endpoint).
 */

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import PushNotificationsBanner from '@/components/notifications/PushNotificationsBanner';

export default function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { permission, status, enable, isStatusLoading } = usePushNotifications();

  // Auto-réabonnement silencieux si la permission est déjà accordée.
  // La demande de permission étant déjà passée, `enable()` ne re-prompt pas.
  useEffect(() => {
    if (isStatusLoading || permission !== 'granted' || !status?.configured) return;

    let cancelled = false;

    (async () => {
      try {
        const registration =
          (await navigator.serviceWorker.getRegistration('/sw.js')) ??
          (await navigator.serviceWorker.register('/sw.js'));

        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;

        // Souscription locale présente mais inconnue du backend → à enregistrer
        if (existing && !status.endpoints.includes(existing.endpoint)) {
          await enable();
          return;
        }

        // Permission accordée mais aucune souscription locale → à créer
        if (!existing) {
          await enable();
        }
      } catch {
        // Échec silencieux : la bannière / le centre de notifications
        // restent disponibles pour une activation manuelle.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [permission, status, isStatusLoading, enable]);

  return (
    <>
      <PushNotificationsBanner />
      {children}
    </>
  );
}
