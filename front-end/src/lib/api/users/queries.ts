import { useQuery } from '@tanstack/react-query';
import { getProfile, getDashboard, getNutrition } from './clientRequests';

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  dashboard: () => [...userKeys.all, 'dashboard'] as const,
  nutrition: (period: string) => [...userKeys.all, 'nutrition', period] as const,
} as const;

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getProfile,
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: getDashboard,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}

export function useNutrition(period: 'week' | 'month' | 'all' = 'week', enabled = true) {
  return useQuery({
    queryKey: userKeys.nutrition(period),
    queryFn: () => getNutrition(period),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
}
