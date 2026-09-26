import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiFetch';
import type {
  DeliveryZone,
  DeliveryZoneListResponse,
  DeliveryZoneDetailResponse,
  CreateDeliveryZoneData,
  UpdateDeliveryZoneData,
} from './types';

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json as T;
}

// ============================================
// PUBLIC
// ============================================

/**
 * GET /api/delivery-zones
 * Zones actives (pour le checkout)
 */
export async function getActiveDeliveryZones(): Promise<DeliveryZone[]> {
  const res = await apiGet('/api/delivery-zones');
  const json = await parseResponse<DeliveryZoneListResponse>(res);
  return json.data;
}

// ============================================
// ADMIN
// ============================================

/**
 * GET /api/admin/delivery-zones
 */
export async function adminGetDeliveryZones(): Promise<DeliveryZone[]> {
  const res = await apiGet('/api/admin/delivery-zones');
  const json = await parseResponse<DeliveryZoneListResponse>(res);
  return json.data;
}

/**
 * GET /api/admin/delivery-zones/:id
 */
export async function adminGetDeliveryZone(id: string): Promise<DeliveryZone> {
  const res = await apiGet(`/api/admin/delivery-zones/${id}`);
  const json = await parseResponse<DeliveryZoneDetailResponse>(res);
  return json.data;
}

/**
 * POST /api/admin/delivery-zones
 */
export async function adminCreateDeliveryZone(data: CreateDeliveryZoneData): Promise<DeliveryZone> {
  const res = await apiPost('/api/admin/delivery-zones', data);
  const json = await parseResponse<DeliveryZoneDetailResponse>(res);
  return json.data;
}

/**
 * PUT /api/admin/delivery-zones/:id
 */
export async function adminUpdateDeliveryZone(id: string, data: UpdateDeliveryZoneData): Promise<DeliveryZone> {
  const res = await apiPut(`/api/admin/delivery-zones/${id}`, data);
  const json = await parseResponse<DeliveryZoneDetailResponse>(res);
  return json.data;
}

/**
 * DELETE /api/admin/delivery-zones/:id
 */
export async function adminDeleteDeliveryZone(id: string): Promise<void> {
  const res = await apiDelete(`/api/admin/delivery-zones/${id}`);
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
}
