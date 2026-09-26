import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  subscribe,
  updateMySubscription,
  pauseMySubscription,
  resumeMySubscription,
  cancelMySubscription,
} from './clientRequests';
import { subscriptionKeys } from './queries';
import type { CreateSubscriptionDto, UpdateSubscriptionDto, PauseSubscriptionDto } from './types';

// ============================================
// MUTATIONS
// ============================================

/**
 * Souscrire à un abonnement.
 * Invalide le cache "mine" pour recharger l'abonnement actif.
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) => subscribe(dto),
    onSuccess: (subscription) => {
      // Mettre à jour directement le cache "mine"
      queryClient.setQueryData(subscriptionKeys.mine(), subscription);
      // Invalider l'historique
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.history() });
      toast.success('Abonnement souscrit avec succès !');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la souscription');
    },
  });
}

/**
 * Modifier les informations de livraison de l'abonnement.
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateSubscriptionDto) => updateMySubscription(dto),
    onSuccess: (subscription) => {
      queryClient.setQueryData(subscriptionKeys.mine(), subscription);
      toast.success('Abonnement mis à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

/**
 * Mettre en pause l'abonnement.
 */
export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto?: PauseSubscriptionDto) => pauseMySubscription(dto),
    onSuccess: ({ subscription }) => {
      queryClient.setQueryData(subscriptionKeys.mine(), subscription);
      toast.success('Abonnement mis en pause');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise en pause');
    },
  });
}

/**
 * Reprendre l'abonnement.
 */
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeMySubscription,
    onSuccess: ({ subscription }) => {
      queryClient.setQueryData(subscriptionKeys.mine(), subscription);
      toast.success('Abonnement repris avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la reprise');
    },
  });
}

/**
 * Annuler l'abonnement.
 * Invalide le cache "mine" et "history" pour recharger les données.
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => cancelMySubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.history() });
      toast.success('Abonnement annulé');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });
}
