import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateDeliveryZone,
  adminUpdateDeliveryZone,
  adminDeleteDeliveryZone,
} from './clientRequests';
import { deliveryZoneKeys } from './queries';
import type { CreateDeliveryZoneData, UpdateDeliveryZoneData } from './types';

// ============================================
// HOOKS DE MUTATION
// ============================================

/**
 * Créer une zone de livraison
 */
export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliveryZoneData) => adminCreateDeliveryZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.all });
    },
  });
}

/**
 * Mettre à jour une zone de livraison
 */
export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryZoneData }) =>
      adminUpdateDeliveryZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.all });
    },
  });
}

/**
 * Supprimer une zone de livraison
 */
export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteDeliveryZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZoneKeys.all });
    },
  });
}
