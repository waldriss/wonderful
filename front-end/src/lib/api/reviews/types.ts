// Enum mirrored from backend schema
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ============================================
// REVIEW TYPES
// ============================================

export interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  helpful: number;
  response: string | null;
  responseAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  productId: string;
}

export interface ReviewWithProduct extends Review {
  product: {
    id: string;
    name: string;
    image: string;
  };
}

export interface ProductReviewsStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================
// DTOs
// ============================================

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  /** Optionnel : lié à une commande */
  orderId?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string | null;
  comment?: string;
}

// ============================================
// QUERY PARAMS
// ============================================

export interface ReviewListParams {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

// ============================================
// API RESPONSES
// ============================================

export interface ProductReviewsResponse {
  success: boolean;
  data: Review[];
  stats: ProductReviewsStats;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MyReviewsResponse {
  success: boolean;
  data: ReviewWithProduct[];
}
