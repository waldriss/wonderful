/**
 * Socket.IO client — /notifications namespace
 *
 * Fournit un socket singleton connecté au namespace `/notifications` du backend.
 * Chaque utilisateur authentifié reçoit ses propres événements de notification.
 *
 * Importable uniquement côté client (composants / hooks navigateur).
 */

import { io, Socket } from 'socket.io-client';
import type { NotificationType } from '@/lib/api/notifications/types';

// ============================================
// TYPES (mirrored from backend)
// ============================================

export interface NotificationCreatedPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationUpdatedPayload {
  id: string;
  read: boolean;
}

export interface NotificationDeletedPayload {
  id: string;
}

// ============================================
// CLIENT-SIDE EVENTS INTERFACE
// ============================================

export interface ServerToClientNotificationEvents {
  'notification:new': (payload: NotificationCreatedPayload) => void;
  'notification:updated': (payload: NotificationUpdatedPayload) => void;
  'notification:read_all': () => void;
  'notification:deleted': (payload: NotificationDeletedPayload) => void;
  'notification:deleted_all': () => void;
}

// ============================================
// SINGLETON
// ============================================

let notificationSocket: Socket<ServerToClientNotificationEvents> | null = null;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Returns (and lazily creates) the singleton socket for the /notifications namespace.
 * The connection is shared across consumers; do NOT call disconnect() on unmount
 * unless the whole session is being torn down.
 */
export function getNotificationSocket(): Socket<ServerToClientNotificationEvents> {
  if (!notificationSocket) {
    notificationSocket = io(`${BACKEND_URL}/notifications`, {
      withCredentials: true, // envoie le cookie de session better-auth
      autoConnect: false,    // connexion explicite via socket.connect()
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    }) as Socket<ServerToClientNotificationEvents>;
  }

  return notificationSocket;
}

/**
 * Disconnect and destroy the singleton so it can be recreated on next call.
 */
export function disconnectNotificationSocket(): void {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
}
