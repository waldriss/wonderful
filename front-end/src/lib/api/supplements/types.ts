// ============================================
// TYPES - SUPPLEMENTS
// ============================================

export interface Supplement {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementListResponse {
  success: boolean;
  data: Supplement[];
}

export interface SupplementDetailResponse {
  success: boolean;
  data: Supplement;
}

export interface CreateSupplementData {
  name: string;
  description?: string | null;
  price: number;
  isActive?: boolean;
}

export type UpdateSupplementData = Partial<CreateSupplementData>;