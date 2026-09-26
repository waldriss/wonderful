import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createReview, updateReview, deleteReview } from './clientRequests';
import { reviewKeys } from './queries';
import type { CreateReviewDto, UpdateReviewDto } from './types';

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook pour créer un avis.
 * Invalide les avis du produit concerné.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => createReview(data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.product(review.productId),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.mine() });
      toast.success('Avis envoyé ! Il sera visible après modération.');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'avis");
    },
  });
}

/**
 * Hook pour modifier un avis.
 */
export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewDto }) =>
      updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.mine() });
      toast.success('Avis modifié avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la modification de l'avis");
    },
  });
}

/**
 * Hook pour supprimer un avis.
 */
export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.mine() });
      toast.success('Avis supprimé');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de l'avis");
    },
  });
}

