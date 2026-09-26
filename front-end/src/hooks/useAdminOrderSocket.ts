'use client';

/**
 * useAdminOrderSocket
 *
 * Connects to the backend `/orders` Socket.IO namespace and listens for:
 *   - `order:new`            → called when a customer places a new order
 *   - `order:status_changed` → called when an admin changes an order's status
 *
 * The hook automatically connects on mount and disconnects on unmount.
 * It is safe to mount multiple times — the socket is a singleton.
 *
 * Usage:
 *   useAdminOrderSocket({
 *     onNewOrder:          (payload) => { ... },
 *     onOrderStatusChanged: (payload) => { ... },
 *   });
 */

import { useEffect, useRef } from 'react';
import {
  getOrderSocket,
  disconnectOrderSocket,
  type NewOrderPayload,
  type OrderStatusChangedPayload,
} from '@/lib/orderSocket';

interface UseAdminOrderSocketOptions {
  /** Called when a new order is created by a customer. */
  onNewOrder?: (payload: NewOrderPayload) => void;
  /** Called when an order's status is changed. */
  onOrderStatusChanged?: (payload: OrderStatusChangedPayload) => void;
  /** Set to false to temporarily pause listening (default: true). */
  enabled?: boolean;
}

export function useAdminOrderSocket({
  onNewOrder,
  onOrderStatusChanged,
  enabled = true,
}: UseAdminOrderSocketOptions = {}): void {
  // Keep stable refs so the socket listeners always see the latest callbacks
  // without needing to re-register them on every render.
  const onNewOrderRef = useRef(onNewOrder);
  const onStatusChangedRef = useRef(onOrderStatusChanged);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  useEffect(() => {
    onStatusChangedRef.current = onOrderStatusChanged;
  }, [onOrderStatusChanged]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getOrderSocket();

    // --- event handlers ---
    const handleNewOrder = (payload: NewOrderPayload) => {
      onNewOrderRef.current?.(payload);
    };

    const handleStatusChanged = (payload: OrderStatusChangedPayload) => {
      onStatusChangedRef.current?.(payload);
    };

    const handleConnectError = (err: Error) => {
      // Silently ignore auth errors (e.g. session expired) — the user will
      // be redirected by the Next.js middleware anyway.
      if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') return;
      console.error('[useAdminOrderSocket] connect_error:', err.message);
    };

    // Register listeners
    socket.on('order:new', handleNewOrder);
    socket.on('order:status_changed', handleStatusChanged);
    socket.on('connect_error', handleConnectError);

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status_changed', handleStatusChanged);
      socket.off('connect_error', handleConnectError);
      // Do NOT call disconnectOrderSocket() here so that other mounted
      // consumers of the same namespace keep their connection alive.
    };
  }, [enabled]);
}
