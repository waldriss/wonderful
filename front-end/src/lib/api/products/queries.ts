import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProducts, getProductById, getCategories, getFilters, getSuggestions } from './clientRequests';
import type { ProductListParams } from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  filters: () => [...productKeys.all, 'filters'] as const,
  suggestions: () => [...productKeys.all, 'suggestions'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer la liste des produits avec filtres.
 * Utilise keepPreviousData pour une pagination fluide.
 */
export function useProducts(params: ProductListParams = {}, enabled = true) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    enabled,
    staleTime: 60 * 1000, // 1 min
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      // Pas de retry sur les erreurs 4xx
      if (error.message.includes('404') || error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer le détail d'un produit.
 */
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('404') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer les catégories de produits.
 */
export function useProductCategories(enabled = true) {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: getCategories,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 min — les catégories changent peu
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook pour récupérer les options de filtres.
 */
export function useProductFilters(enabled = true) {
  return useQuery({
    queryKey: productKeys.filters(),
    queryFn: getFilters,
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook pour récupérer les suggestions personnalisées.
 */
export function useSuggestions(enabled = true) {
  return useQuery({
    queryKey: productKeys.suggestions(),
    queryFn: () => getSuggestions(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
