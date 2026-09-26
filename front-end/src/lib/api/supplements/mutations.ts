import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateSupplement,
  adminUpdateSupplement,
  adminDeleteSupplement,
} from './clientRequests';
import { supplementKeys } from './queries';
import type { CreateSupplementData, UpdateSupplementData } from './types';

// ============================================
// HOOKS DE MUTATION
// ============================================

/**
 * Créer un supplément
 */
export function useCreateSupplement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplementData) => adminCreateSupplement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.all });
    },
  });
}

/**
 * Mettre à jour un supplément
 */
export function useUpdateSupplement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplementData }) =>
      adminUpdateSupplement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.all });
    },
  });
}

/**
 * Supprimer un supplément
 */
export function useDeleteSupplement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteSupplement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementKeys.all });
    },
  });
}