import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  usePoints as usePointsApi,
  claimMissionReward,
  buyMysteryBox,
  openMysteryBox,
  generateReferralCode,
  useReferralCode,
} from './clientRequests';
import { gamificationKeys } from './queries';
import type {
  UsePointsDto,
  PointsBalance,
  GamificationOverview,
} from './types';

// ============================================
// POINTS MUTATIONS
// ============================================

export function useSpendPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UsePointsDto) => usePointsApi(dto),
    onMutate: async ({ points }) => {
      await queryClient.cancelQueries({ queryKey: gamificationKeys.points() });
      const previousPoints = queryClient.getQueryData<PointsBalance>(gamificationKeys.points());

      queryClient.setQueryData<PointsBalance>(gamificationKeys.points(), (old) => {
        if (!old) return old;
        return {
          ...old,
          availablePoints: Math.max(0, old.availablePoints - points),
          lifetimeSpent: old.lifetimeSpent + points,
        };
      });

      return { previousPoints };
    },
    onError: (error, _vars, context) => {
      if (context?.previousPoints) {
        queryClient.setQueryData(gamificationKeys.points(), context.previousPoints);
      }
      toast.error(error.message ?? 'Erreur lors de l\'utilisation des points');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(gamificationKeys.points(), data.newBalance);
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.pointsHistory() });
      toast.success(data.message);
    },
  });
}

// ============================================
// MISSION MUTATIONS
// ============================================

export function useClaimMissionReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (missionId: string) => claimMissionReward(missionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.missions() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.points() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de la réclamation de la récompense');
    },
  });
}

// ============================================
// MYSTERY BOX MUTATIONS
// ============================================

export function useBuyMysteryBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mysteryBoxId: string) => buyMysteryBox(mysteryBoxId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.mysteryBoxes() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.points() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de l\'achat de la mystery box');
    },
  });
}

export function useOpenMysteryBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userMysteryBoxId: string) => openMysteryBox(userMysteryBoxId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.mysteryBoxes() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.points() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      const desc = data.description || `${data.rewardType}: ${data.rewardValue}`;
      toast.success(`Récompense obtenue : ${desc}`);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de l\'ouverture de la mystery box');
    },
  });
}

// ============================================
// REFERRAL MUTATIONS
// ============================================

export function useGenerateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateReferralCode,
    onSuccess: (data) => {
      queryClient.setQueryData(gamificationKeys.referral(), data);
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      toast.success('Code de parrainage généré !');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de la génération du code');
    },
  });
}

export function useUseReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => useReferralCode(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.points() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.overview() });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de l\'utilisation du code');
    },
  });
}
