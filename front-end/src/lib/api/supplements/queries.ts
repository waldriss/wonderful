import { useQuery } from '@tanstack/react-query';
import { getActiveSupplements, adminGetSupplements } from './clientRequests';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const supplementKeys = {
  all: ['supplements'] as const,
  adminList: () => [...supplementKeys.all, 'admin'] as const,
  publicList: () => [...supplementKeys.all, 'public'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Tous les suppléments (admin)
 */
export function useAdminSupplements() {
  return useQuery({
    queryKey: supplementKeys.adminList(),
    queryFn: adminGetSupplements,
    staleTime: 60 * 1000,
  });
}

/**
 * Suppléments actifs (public)
 */
export function useActiveSupplements() {
  return useQuery({
    queryKey: supplementKeys.publicList(),
    queryFn: getActiveSupplements,
    staleTime: 5 * 60 * 1000,
  });
}