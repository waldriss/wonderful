import { apiGet, apiPost } from '@/lib/api/apiFetch';

// ============================================
// TYPES
// ============================================

export interface PushStatus {
  configured: boolean;
  enabled: boolean;
  subscriptionCount: number;
  endpoints: string[];
  /** Clé publique VAPID pour PushManager.subscribe() */
  vapidPublicKey: string;
}

export interface PushSubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceLabel?: string;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  deviceLabel: string | null;
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REQUESTS
// ============================================

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

/**
 * GET /api/notifications/push/status
 * Statut push de l'utilisateur connecté (config serveur + appareils actifs)
 */
export async function getPushStatus(): Promise<PushStatus> {
  const res = await apiGet('/api/notifications/push/status');
  const json = await parseResponse<{ success: boolean; data: PushStatus }>(res);
  return json.data;
}

/**
 * POST /api/notifications/push/subscribe
 * Enregistre la souscription push d'un navigateur/appareil
 */
export async function subscribePushDevice(
  payload: PushSubscribePayload
): Promise<PushSubscriptionRecord> {
  const res = await apiPost('/api/notifications/push/subscribe', payload);
  const json = await parseResponse<{ success: boolean; data: PushSubscriptionRecord }>(res);
  return json.data;
}

/**
 * POST /api/notifications/push/unsubscribe
 * Désactive la souscription push d'un appareil
 */
export async function unsubscribePushDevice(endpoint: string): Promise<{ success: boolean }> {
  const res = await apiPost('/api/notifications/push/unsubscribe', { endpoint });
  return parseResponse<{ success: boolean }>(res);
}
