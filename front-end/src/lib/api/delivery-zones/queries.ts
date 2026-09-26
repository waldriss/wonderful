import { useQuery } from '@tanstack/react-query';
import { adminGetDeliveryZones, getActiveDeliveryZones } from './clientRequests';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const deliveryZoneKeys = {
  all: ['delivery-zones'] as const,
  adminList: () => [...deliveryZoneKeys.all, 'admin'] as const,
  publicList: () => [...deliveryZoneKeys.all, 'public'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Toutes les zones (admin)
 */
export function useAdminDeliveryZones() {
  return useQuery({
    queryKey: deliveryZoneKeys.adminList(),
    queryFn: adminGetDeliveryZones,
    staleTime: 60 * 1000,
  });
}

/**
 * Zones actives (public — checkout)
 */
export function useActiveDeliveryZones() {
  return useQuery({
    queryKey: deliveryZoneKeys.publicList(),
    queryFn: getActiveDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });
}
