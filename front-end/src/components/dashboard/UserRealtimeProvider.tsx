'use client';

/**
 * UserRealtimeProvider
 *
 * Monte la connexion Socket.IO `/notifications` pour toute la zone privée
 * utilisateur. À la réception d'un événement temps réel, les queries
 * notifications sont invalidées pour rester synchronisées sans refresh.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUserNotificationSocket } from '@/hooks/useUserNotificationSocket';
import { notificationKeys } from '@/lib/api/notifications/queries';
import type { NotificationCreatedPayload } from '@/lib/notificationSocket';

export default function UserRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
  }, [queryClient]);

  useUserNotificationSocket({
    onNew: useCallback(
      (payload: NotificationCreatedPayload) => {
        refreshNotifications();

        toast(payload.title, {
          description: payload.message,
          duration: 6000,
        });
      },
      [refreshNotifications]
    ),

    onUpdated: useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),

    onReadAll: useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),

    onDeleted: useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),

    onDeletedAll: useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),
  });

  return <>{children}</>;
}
