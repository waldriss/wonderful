import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getFavorites, getFavoriteIds, checkFavorite } from './clientRequests';
import type { FavoriteListParams } from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (params?: FavoriteListParams) => [...favoriteKeys.lists(), params] as const,
  ids: () => [...favoriteKeys.all, 'ids'] as const,
  check: (productId: string) => [...favoriteKeys.all, 'check', productId] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour la liste paginée des favoris (page dashboard).
 */
export function useFavorites(params: FavoriteListParams = {}, enabled = true) {
  return useQuery({
    queryKey: favoriteKeys.list(params),
    queryFn: () => getFavorites(params),
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

/**
 * Hook pour récupérer les IDs des produits favoris.
 * Utilisé pour afficher l'état cœur sur chaque ProductCard.
 */
export function useFavoriteIds(enabled = true) {
  return useQuery({
    queryKey: favoriteKeys.ids(),
    queryFn: getFavoriteIds,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour vérifier si un produit spécifique est en favori.
 * Préférer useFavoriteIds() si on affiche plusieurs cartes — plus efficace.
 */
export function useCheckFavorite(productId: string, enabled = true) {
  return useQuery({
    queryKey: favoriteKeys.check(productId),
    queryFn: () => checkFavorite(productId),
    enabled: enabled && !!productId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
