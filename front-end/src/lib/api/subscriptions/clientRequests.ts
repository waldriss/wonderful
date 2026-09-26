import { apiGet, apiPost, apiPut } from '../apiFetch';
import type {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  PauseSubscriptionDto,
  PlansResponse,
  SubscriptionHistoryResponse,
} from './types';

// ============================================
// HELPERS
// ============================================

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

// ============================================
// PLANS
// ============================================

/**
 * GET /api/subscriptions/plans
 * Liste des plans disponibles (public)
 */
export async function getPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiGet('/api/subscriptions/plans');
  const data = await parseJson<PlansResponse>(res);
  return data.plans;
}

/**
 * GET /api/subscriptions/plans/:id
 * Détail d'un plan (public)
 */
export async function getPlanById(id: string): Promise<SubscriptionPlan> {
  const res = await apiGet(`/api/subscriptions/plans/${id}`);
  const data = await parseJson<{ success: boolean; data: SubscriptionPlan }>(res);
  return data.data;
}

// ============================================
// SUBSCRIPTIONS - CLIENT
// ============================================

/**
 * POST /api/subscriptions
 * Souscrire à un abonnement
 */
export async function subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
  const res = await apiPost('/api/subscriptions', dto);
  const data = await parseJson<{ success: boolean; data: Subscription }>(res);
  return data.data;
}

/**
 * GET /api/subscriptions/me
 * Récupérer l'abonnement actif de l'utilisateur
 */
export async function getMySubscription(): Promise<Subscription | null> {
  const res = await apiGet('/api/subscriptions/me');
  const data = await parseJson<{ success: boolean; data: Subscription | null }>(res);
  return data.data;
}

/**
 * GET /api/subscriptions/history
 * Historique des abonnements
 */
export async function getSubscriptionHistory(): Promise<Subscription[]> {
  const res = await apiGet('/api/subscriptions/history');
  const data = await parseJson<SubscriptionHistoryResponse>(res);
  return data.subscriptions;
}

/**
 * PUT /api/subscriptions/me
 * Modifier la livraison de l'abonnement actif
 */
export async function updateMySubscription(dto: UpdateSubscriptionDto): Promise<Subscription> {
  const res = await apiPut('/api/subscriptions/me', dto);
  const data = await parseJson<{ success: boolean; data: Subscription }>(res);
  return data.data;
}

/**
 * POST /api/subscriptions/me/pause
 * Mettre en pause l'abonnement
 */
export async function pauseMySubscription(dto?: PauseSubscriptionDto): Promise<{ message: string; subscription: Subscription }> {
  const res = await apiPost('/api/subscriptions/me/pause', dto ?? {});
  return parseJson<{ message: string; subscription: Subscription }>(res);
}

/**
 * POST /api/subscriptions/me/resume
 * Reprendre l'abonnement
 */
export async function resumeMySubscription(): Promise<{ message: string; subscription: Subscription }> {
  const res = await apiPost('/api/subscriptions/me/resume');
  return parseJson<{ message: string; subscription: Subscription }>(res);
}

/**
 * POST /api/subscriptions/me/cancel
 * Annuler l'abonnement
 */
export async function cancelMySubscription(reason?: string): Promise<{ message: string }> {
  const res = await apiPost('/api/subscriptions/me/cancel', reason ? { cancelReason: reason } : {});
  return parseJson<{ message: string }>(res);
}
