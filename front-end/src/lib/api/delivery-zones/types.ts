// ============================================
// TYPES - ZONES DE LIVRAISON
// ============================================

export interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string[];
  fee: number;
  minOrderAmount: number | null;
  isActive: boolean;
}

export interface DeliveryZoneListResponse {
  success: boolean;
  data: DeliveryZone[];
}

export interface DeliveryZoneDetailResponse {
  success: boolean;
  data: DeliveryZone;
}

export interface CreateDeliveryZoneData {
  name: string;
  fee: number;
  minOrderAmount?: number | null;
  isActive?: boolean;
}

export type UpdateDeliveryZoneData = Partial<CreateDeliveryZoneData>;
