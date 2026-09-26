import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from './clientRequests';
import type { NotificationListParams } from './types';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
} as const;

export function useNotifications(params: NotificationListParams = {}, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    enabled,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
