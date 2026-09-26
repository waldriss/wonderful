import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from './clientRequests';
import { favoriteKeys } from './queries';

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook toggle favori avec optimistic update.
 * Met à jour immédiatement le cache favoriteIds, puis invalide la liste complète.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      isFavorite,
    }: {
      productId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    },

    // ---- Optimistic update ----
    onMutate: async ({ productId, isFavorite }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: favoriteKeys.ids() });

      // Snapshot de l'état précédent
      const previousIds = queryClient.getQueryData<string[]>(favoriteKeys.ids());

      // Mise à jour optimiste des IDs
      queryClient.setQueryData<string[]>(favoriteKeys.ids(), (old = []) => {
        if (isFavorite) {
          // On retire l'ID
          return old.filter((id) => id !== productId);
        } else {
          // On ajoute l'ID
          return old.includes(productId) ? old : [...old, productId];
        }
      });

      return { previousIds };
    },

    // ---- Rollback sur erreur ----
    onError: (_error, _vars, context) => {
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(favoriteKeys.ids(), context.previousIds);
      }
    },

    // ---- Sync serveur après succès ----
    onSuccess: () => {
      // Invalider la liste paginée (dashboard favoris)
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}
