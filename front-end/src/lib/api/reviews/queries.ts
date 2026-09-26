import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProductReviews, getMyReviews } from './clientRequests';
import type { ReviewListParams } from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  productList: (productId: string, params?: ReviewListParams) =>
    [...reviewKeys.product(productId), params] as const,
  mine: () => [...reviewKeys.all, 'mine'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour récupérer les avis d'un produit.
 */
export function useProductReviews(
  productId: string,
  params: ReviewListParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: reviewKeys.productList(productId, params),
    queryFn: () => getProductReviews(productId, params),
    enabled: enabled && !!productId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour récupérer mes avis (dashboard).
 */
export function useMyReviews(enabled = true) {
  return useQuery({
    queryKey: reviewKeys.mine(),
    queryFn: getMyReviews,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
