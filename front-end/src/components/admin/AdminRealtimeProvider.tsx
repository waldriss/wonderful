'use client';

/**
 * AdminRealtimeProvider
 *
 * Mounts the Socket.IO connection for the entire admin dashboard so that
 * real-time order events (new order, status change) work on every admin page,
 * not just the orders page.
 *
 * Place this component as a wrapper inside the admin layout (server component
 * cannot run hooks, so we delegate to this thin client wrapper).
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAdminOrderSocket } from '@/hooks/useAdminOrderSocket';
import { adminKeys } from '@/lib/api/admin/queries';
import type { NewOrderPayload, OrderStatusChangedPayload } from '@/lib/orderSocket';

export default function AdminRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useAdminOrderSocket({
    onNewOrder: useCallback(
      (payload: NewOrderPayload) => {
        queryClient.invalidateQueries({ queryKey: adminKeys.orders() });

        toast.success(`Nouvelle commande #${payload.orderNumber}`, {
          description: `${payload.customerName} — ${payload.total.toLocaleString('fr-FR')} DA`,
          duration: 8000,
        });
      },
      [queryClient]
    ),

    onOrderStatusChanged: useCallback(
      (payload: OrderStatusChangedPayload) => {
        queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
        queryClient.invalidateQueries({
          queryKey: adminKeys.orderDetail(payload.orderId),
        });
      },
      [queryClient]
    ),
  });

  return <>{children}</>;
}
