import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiFetch';
import type {
  Supplement,
  SupplementListResponse,
  SupplementDetailResponse,
  CreateSupplementData,
  UpdateSupplementData,
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
 * GET /api/supplements
 * Suppléments actifs (liste publique)
 */
export async function getActiveSupplements(): Promise<Supplement[]> {
  const res = await apiGet('/api/supplements');
  const json = await parseResponse<SupplementListResponse>(res);
  return json.data;
}

// ============================================
// ADMIN
// ============================================

/**
 * GET /api/admin/supplements
 * Tous les suppléments (actifs et inactifs)
 */
export async function adminGetSupplements(): Promise<Supplement[]> {
  const res = await apiGet('/api/admin/supplements');
  const json = await parseResponse<SupplementListResponse>(res);
  return json.data;
}

/**
 * GET /api/admin/supplements/:id
 */
export async function adminGetSupplement(id: string): Promise<Supplement> {
  const res = await apiGet(`/api/admin/supplements/${id}`);
  const json = await parseResponse<SupplementDetailResponse>(res);
  return json.data;
}

/**
 * POST /api/admin/supplements
 */
export async function adminCreateSupplement(data: CreateSupplementData): Promise<Supplement> {
  const res = await apiPost('/api/admin/supplements', data);
  const json = await parseResponse<SupplementDetailResponse>(res);
  return json.data;
}

/**
 * PUT /api/admin/supplements/:id
 */
export async function adminUpdateSupplement(id: string, data: UpdateSupplementData): Promise<Supplement> {
  const res = await apiPut(`/api/admin/supplements/${id}`, data);
  const json = await parseResponse<SupplementDetailResponse>(res);
  return json.data;
}

/**
 * DELETE /api/admin/supplements/:id
 */
export async function adminDeleteSupplement(id: string): Promise<void> {
  const res = await apiDelete(`/api/admin/supplements/${id}`);
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
}