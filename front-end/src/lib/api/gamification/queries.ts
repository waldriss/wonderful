import { useQuery } from '@tanstack/react-query';
import {
  getOverview,
  getPoints,
  getPointsHistory,
  getBadges,
  getMyBadges,
  getMissions,
  getMysteryBoxes,
  getStreak,
  getReferral,
  getLeaderboard,
  getMyRewards,
  getLeaderboardConfigsPublic,
} from './clientRequests';
import type { LeaderboardParams } from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const gamificationKeys = {
  all: ['gamification'] as const,
  overview: () => [...gamificationKeys.all, 'overview'] as const,
  points: () => [...gamificationKeys.all, 'points'] as const,
  pointsHistory: (page?: number) => [...gamificationKeys.all, 'points-history', page] as const,
  badges: () => [...gamificationKeys.all, 'badges'] as const,
  myBadges: () => [...gamificationKeys.all, 'my-badges'] as const,
  missions: () => [...gamificationKeys.all, 'missions'] as const,
  mysteryBoxes: () => [...gamificationKeys.all, 'mystery-boxes'] as const,
  streak: () => [...gamificationKeys.all, 'streak'] as const,
  referral: () => [...gamificationKeys.all, 'referral'] as const,
  leaderboard: (params?: LeaderboardParams) => [...gamificationKeys.all, 'leaderboard', params] as const,
  leaderboardConfigs: () => [...gamificationKeys.all, 'leaderboard-configs'] as const,
  rewards: () => [...gamificationKeys.all, 'rewards'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

export function useGamificationOverview(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.overview(),
    queryFn: getOverview,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function usePoints(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.points(),
    queryFn: getPoints,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function usePointsHistory(page: number = 1, enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.pointsHistory(page),
    queryFn: () => getPointsHistory(page),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useBadges(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.badges(),
    queryFn: getBadges,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useMyBadges(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.myBadges(),
    queryFn: getMyBadges,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useMissions(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.missions(),
    queryFn: getMissions,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMysteryBoxes(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.mysteryBoxes(),
    queryFn: getMysteryBoxes,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useStreak(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.streak(),
    queryFn: getStreak,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useReferral(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.referral(),
    queryFn: getReferral,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useLeaderboard(params: LeaderboardParams = {}, enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(params),
    queryFn: () => getLeaderboard(params),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMyRewards(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.rewards(),
    queryFn: getMyRewards,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function useLeaderboardConfigsPublic(enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.leaderboardConfigs(),
    queryFn: getLeaderboardConfigsPublic,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
