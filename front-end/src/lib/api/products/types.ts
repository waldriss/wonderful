// Enums mirrored from backend schema — do not import @prisma/client in frontend
export type ProductCategory = 'PLATS' | 'BOISSONS' | 'DESSERTS' | 'SNACKS';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';

// ============================================
// PAGINATION
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface ProductNutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  /** Prix après réduction */
  finalPrice: number;
  image: string;
  stock: number;
  status: ProductStatus;
  rating: number;
  totalSold: number;

  isNew: boolean;
  isOnSale: boolean;
  isBestSeller: boolean;
  discount: number | null;

  portionSize: string | null;
  prepTime: string | null;

  /** Secondary carousel images */
  images: string[];

  nutrition: ProductNutrition | null;
  allergens: string[];
  dietTypes: string[];
  mealTypes: string[];
  dietaryGoals: string[];

  /** Suppléments disponibles (actifs uniquement côté public) */
  supplements: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
  }>;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// CATEGORY & FILTER TYPES
// ============================================

export interface ProductCategory_ {
  value: ProductCategory;
  label: string;
  count: number;
}

export interface FilterOption {
  value: string;
  count: number;
}

export interface ProductFilters {
  categories: ProductCategory_[];
  mealTypes: FilterOption[];
  dietaryGoals: FilterOption[];
  dietTypes: FilterOption[];
  allergens: FilterOption[];
  priceRange: { min: number; max: number };
  caloriesRange: { min: number; max: number };
}

// ============================================
// QUERY PARAMS
// ============================================

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  minRating?: number;
  minCalories?: number;
  maxCalories?: number;
  minProteins?: number;
  maxProteins?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
  minFiber?: number;
  maxFiber?: number;
  /** Comma-separated list, e.g. "Déjeuner,Dîner" */
  mealType?: string;
  /** Comma-separated list */
  dietaryGoals?: string;
  portionSize?: string;
  /** Comma-separated specifications (tags) */
  specifications?: string;
  /** Comma-separated allergens to exclude */
  allergies?: string;
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'alphabetical' | 'rating';
}

// ============================================
// API RESPONSES
// ============================================

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: PaginationMeta;
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface ProductCategoriesResponse {
  success: boolean;
  data: ProductCategory_[];
}

export interface ProductFiltersResponse {
  success: boolean;
  data: ProductFilters;
}
