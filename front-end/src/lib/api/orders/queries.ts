import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getOrders, getOrderById, getCart } from './clientRequests';
import type { OrderListParams } from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrderListParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  cart: () => [...orderKeys.all, 'cart'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer la liste des commandes de l'utilisateur.
 */
export function useOrders(params: OrderListParams = {}, enabled = true) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer le détail d'une commande.
 */
export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('404') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer le panier serveur.
 * Activé uniquement si l'utilisateur est connecté (passer enabled = !!session).
 */
export function useServerCart(enabled = true) {
  return useQuery({
    queryKey: orderKeys.cart(),
    queryFn: getCart,
    enabled,
    staleTime: 30 * 1000, // 30s — panier change fréquemment
    gcTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
