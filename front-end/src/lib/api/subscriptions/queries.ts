import { useQuery } from '@tanstack/react-query';
import {
  getPlans,
  getPlanById,
  getMySubscription,
  getSubscriptionHistory,
} from './clientRequests';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  plan: (id: string) => [...subscriptionKeys.plans(), id] as const,
  mine: () => [...subscriptionKeys.all, 'mine'] as const,
  history: () => [...subscriptionKeys.all, 'history'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer la liste de tous les plans actifs.
 * Public — ne nécessite pas d'authentification.
 */
export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: getPlans,
    staleTime: 10 * 60 * 1000, // 10 min — plans changent rarement
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook pour récupérer le détail d'un plan.
 */
export function usePlan(id: string, enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.plan(id),
    queryFn: () => getPlanById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer l'abonnement actif de l'utilisateur connecté.
 * Retourne null si aucun abonnement actif.
 */
export function useMySubscription(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.mine(),
    queryFn: getMySubscription,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer l'historique des abonnements.
 */
export function useSubscriptionHistory(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.history(),
    queryFn: getSubscriptionHistory,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}
