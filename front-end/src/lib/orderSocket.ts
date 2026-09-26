/**
 * Socket.IO client — /orders namespace
 *
 * Provides a lazily-created, singleton socket connected to the backend
 * `/orders` namespace.  Only import this on the client side (components /
 * hooks that run in the browser).
 *
 * The socket is created once and reused across components.  It connects
 * using credentials (cookies) so better-auth can validate the session on the
 * server-side auth middleware.
 */

import { io, Socket } from 'socket.io-client';

// ============================================
// TYPES (mirrored from backend)
// ============================================

export interface NewOrderPayload {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  deliveryCity: string;
  createdAt: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  changedAt: string;
}

// ============================================
// CLIENT-SIDE EVENTS INTERFACE
// ============================================

export interface ServerToClientOrderEvents {
  'order:new': (payload: NewOrderPayload) => void;
  'order:status_changed': (payload: OrderStatusChangedPayload) => void;
}

// ============================================
// SINGLETON
// ============================================

let orderSocket: Socket<ServerToClientOrderEvents> | null = null;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Returns (and lazily creates) the singleton socket for the /orders namespace.
 * Call `disconnectOrderSocket()` when the consumer unmounts to clean up.
 */
export function getOrderSocket(): Socket<ServerToClientOrderEvents> {
  if (!orderSocket) {
    orderSocket = io(`${BACKEND_URL}/orders`, {
      withCredentials: true,   // send better-auth session cookie
      autoConnect: false,      // connect explicitly via socket.connect()
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    }) as Socket<ServerToClientOrderEvents>;
  }

  return orderSocket;
}

/**
 * Disconnect and destroy the singleton so it can be recreated on next call.
 */
export function disconnectOrderSocket(): void {
  if (orderSocket) {
    orderSocket.disconnect();
    orderSocket = null;
  }
}
