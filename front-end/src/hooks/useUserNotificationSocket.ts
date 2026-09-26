'use client';

/**
 * useUserNotificationSocket
 *
 * Connecte au namespace backend `/notifications` et écoute les événements
 * temps réel de l'utilisateur connecté :
 *   - `notification:new`        → nouvelle notification reçue
 *   - `notification:updated`    → état lu/non lu modifié
 *   - `notification:read_all`   → tout marqué comme lu
 *   - `notification:deleted`    → notification supprimée
 *   - `notification:deleted_all`→ toutes supprimées
 *
 * Le hook se connecte au montage et se déconnecte au démontage.
 * Le socket étant un singleton, il est sûr de monter plusieurs consommateurs.
 */

import { useEffect, useRef } from 'react';
import {
  getNotificationSocket,
  disconnectNotificationSocket,
  type NotificationCreatedPayload,
  type NotificationUpdatedPayload,
  type NotificationDeletedPayload,
} from '@/lib/notificationSocket';

interface UseUserNotificationSocketOptions {
  /** Nouvelle notification reçue. */
  onNew?: (payload: NotificationCreatedPayload) => void;
  /** État lu/non lu d'une notification modifié. */
  onUpdated?: (payload: NotificationUpdatedPayload) => void;
  /** Toutes les notifications marquées comme lues. */
  onReadAll?: () => void;
  /** Notification supprimée. */
  onDeleted?: (payload: NotificationDeletedPayload) => void;
  /** Toutes les notifications supprimées. */
  onDeletedAll?: () => void;
  /** Met à false pour suspendre l'écoute (défaut: true). */
  enabled?: boolean;
}

export function useUserNotificationSocket({
  onNew,
  onUpdated,
  onReadAll,
  onDeleted,
  onDeletedAll,
  enabled = true,
}: UseUserNotificationSocketOptions = {}): void {
  // Refs stables pour que les listeners voient toujours les derniers callbacks
  const onNewRef = useRef(onNew);
  const onUpdatedRef = useRef(onUpdated);
  const onReadAllRef = useRef(onReadAll);
  const onDeletedRef = useRef(onDeleted);
  const onDeletedAllRef = useRef(onDeletedAll);

  useEffect(() => { onNewRef.current = onNew; }, [onNew]);
  useEffect(() => { onUpdatedRef.current = onUpdated; }, [onUpdated]);
  useEffect(() => { onReadAllRef.current = onReadAll; }, [onReadAll]);
  useEffect(() => { onDeletedRef.current = onDeleted; }, [onDeleted]);
  useEffect(() => { onDeletedAllRef.current = onDeletedAll; }, [onDeletedAll]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getNotificationSocket();

    const handleNew = (payload: NotificationCreatedPayload) => onNewRef.current?.(payload);
    const handleUpdated = (payload: NotificationUpdatedPayload) => onUpdatedRef.current?.(payload);
    const handleReadAll = () => onReadAllRef.current?.();
    const handleDeleted = (payload: NotificationDeletedPayload) => onDeletedRef.current?.(payload);
    const handleDeletedAll = () => onDeletedAllRef.current?.();
    const handleConnectError = (err: Error) => {
      // Ignore silencieusement les erreurs d'auth (session expirée) — le middleware
      // Next.js redirige déjà vers /auth.
      if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') return;
      console.error('[useUserNotificationSocket] connect_error:', err.message);
    };

    socket.on('notification:new', handleNew);
    socket.on('notification:updated', handleUpdated);
    socket.on('notification:read_all', handleReadAll);
    socket.on('notification:deleted', handleDeleted);
    socket.on('notification:deleted_all', handleDeletedAll);
    socket.on('connect_error', handleConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('notification:new', handleNew);
      socket.off('notification:updated', handleUpdated);
      socket.off('notification:read_all', handleReadAll);
      socket.off('notification:deleted', handleDeleted);
      socket.off('notification:deleted_all', handleDeletedAll);
      socket.off('connect_error', handleConnectError);
      // Ne PAS déconnecter le socket ici : d'autres consommateurs du namespace
      // peuvent être montés (dashboard, sidebar, etc.).
    };
  }, [enabled]);
}

export { disconnectNotificationSocket };
