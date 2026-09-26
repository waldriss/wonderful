'use client';

/**
 * usePushNotifications
 *
 * Encapsule tout le cycle de vie de l'abonnement push navigateur :
 *   - détection du support (service worker + PushManager + Notification)
 *   - état de permission courant
 *   - activation : demande permission → PushManager.subscribe → envoi au backend
 *   - désactivation : désabonnement navigateur + backend
 *   - auto-réabonnement si la permission est déjà accordée
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPushStatus,
  subscribePushDevice,
  unsubscribePushDevice,
} from '@/lib/api/notifications/push';

export const pushKeys = {
  all: ['notifications', 'push'] as const,
  status: () => [...pushKeys.all, 'status'] as const,
};

export type PushPermissionState = 'unsupported' | 'granted' | 'default' | 'denied';

/**
 * Convertit une clé VAPID base64url (standards Web Push) en Uint8Array,
 * format requis par PushManager.subscribe().
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Safari')
    ? 'Safari'
    : ua.includes('Firefox')
    ? 'Firefox'
    : 'Navigateur';
  const os = ua.includes('Mac')
    ? 'macOS'
    : ua.includes('Windows')
    ? 'Windows'
    : ua.includes('Android')
    ? 'Android'
    : ua.includes('iPhone') || ua.includes('iPad')
    ? 'iOS'
    : 'Appareil';
  return `${browser} — ${os}`;
}

export function usePushNotifications() {
  const queryClient = useQueryClient();

  const supported = useMemo(() => isPushSupported(), []);
  const permission = useMemo<PushPermissionState>(() => {
    if (!supported) return 'unsupported';
    return Notification.permission;
  }, [supported]);

  // Statut côté serveur (config VAPID + appareils enregistrés)
  const statusQuery = useQuery({
    queryKey: pushKeys.status(),
    queryFn: getPushStatus,
    enabled: supported,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: pushKeys.status() });
  }, [queryClient]);

  // ============================================
  // ACTIVATION
  // ============================================

  const enableMutation = useMutation({
    mutationFn: async () => {
      if (!supported) throw new Error('Navigateur non compatible');

      const status = statusQuery.data;
      if (!status?.configured || !status.vapidPublicKey) {
        throw new Error('Les notifications push ne sont pas activées sur ce site');
      }

      // 1. Demander la permission (doit être déclenché par un geste utilisateur)
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== 'granted') {
        throw new Error('Permission refusée');
      }

      // 2. Enregistrer le service worker (idempotent)
      const registration = await navigator.serviceWorker.register('/sw.js');

      // 3. Récupérer ou créer la souscription push du navigateur
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(status.vapidPublicKey),
        });
      }

      // 4. Envoyer au backend
      const subscriptionJson = subscription.toJSON();
      const { p256dh, auth } = subscriptionJson.keys ?? {};
      if (!subscriptionJson.endpoint || !p256dh || !auth) {
        throw new Error('Souscription push invalide (données manquantes)');
      }

      await subscribePushDevice({
        endpoint: subscriptionJson.endpoint,
        keys: { p256dh, auth },
        userAgent: navigator.userAgent.slice(0, 500),
        deviceLabel: getDeviceLabel(),
      });
    },
    onSuccess: refresh,
  });

  // ============================================
  // DÉSACTIVATION
  // ============================================

  const disableMutation = useMutation({
    mutationFn: async () => {
      if (!supported) return;

      // 1. Désabonner le navigateur s'il existe une souscription
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // 2. Informer le backend (endpoint désactivé)
      if (subscription?.endpoint) {
        await unsubscribePushDevice(subscription.endpoint);
      } else {
        // Aucune souscription locale : désactiver toutes celles du compte via l'API
        const status = statusQuery.data;
        for (const endpoint of status?.endpoints ?? []) {
          await unsubscribePushDevice(endpoint);
        }
      }
    },
    onSuccess: refresh,
  });

  return {
    supported,
    permission,
    status: statusQuery.data,
    isStatusLoading: statusQuery.isLoading,
    enable: enableMutation.mutateAsync,
    disable: disableMutation.mutateAsync,
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    error: enableMutation.error,
  };
}
