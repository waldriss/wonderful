import { apiGet, apiPost, apiDelete } from '@/lib/api/apiFetch';
import type {
  Notification,
  NotificationsListResponse,
  UnreadCountResponse,
  NotificationListParams,
} from './types';

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

export async function getNotifications(
  params: NotificationListParams = {}
): Promise<NotificationsListResponse> {
  const qs = toQueryString(params as Record<string, unknown>);
  const res = await apiGet(`/api/notifications${qs}`);
  const json = await parseResponse<
    NotificationsListResponse & { pagination?: NotificationsListResponse['meta'] }
  >(res);

  // Tolérance : certaines routes legacy renvoient `pagination` au lieu de `meta`
  return {
    success: json.success,
    data: json.data,
    meta: json.meta ?? json.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
  };
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiGet('/api/notifications/unread-count');
  const json = await parseResponse<UnreadCountResponse>(res);
  return json.data.unreadCount ?? 0;
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await apiPost(`/api/notifications/${id}/read`);
  const json = await parseResponse<{ success: boolean; data: Notification }>(res);
  return json.data;
}

export async function markAllAsRead(): Promise<void> {
  const res = await apiPost('/api/notifications/read-all');
  await parseResponse<{ success: boolean }>(res);
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await apiDelete(`/api/notifications/${id}`);
  await parseResponse<{ success: boolean }>(res);
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await apiDelete('/api/notifications');
  await parseResponse<{ success: boolean }>(res);
}
