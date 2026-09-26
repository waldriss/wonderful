import type { ProductCategory } from '../products/types';
import type { Product, PaginationMeta } from '../products/types';

// ============================================
// FAVORITES TYPES
// ============================================

export interface Favorite {
  id: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    category: ProductCategory;
    price: number;
    finalPrice: number;
    image: string;
    rating: number;
    isOnSale: boolean;
    discount: number | null;
    isNew: boolean;
    isBestSeller: boolean;
  };
}

export interface FavoritesListResponse {
  success: boolean;
  data: Favorite[];
  meta: PaginationMeta;
}

export interface FavoriteIdsResponse {
  success: boolean;
  data: string[];
}

export interface CheckFavoriteResponse {
  success: boolean;
  data: { isFavorite: boolean };
}

export interface FavoriteListParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
}
