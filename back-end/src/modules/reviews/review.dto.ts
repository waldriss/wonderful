import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - AVIS
// ============================================

/**
 * Schema pour la création d'un avis
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  rating: z.coerce.number().int().min(1, 'Note minimum 1').max(5, 'Note maximum 5'),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Commentaire trop court').max(1000),
  orderId: z.string().optional(), // Optionnel: lié à une commande
});

/**
 * Schema pour la mise à jour d'un avis
 */
export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * Schema pour les paramètres de liste des avis (Public)
 */
export const listProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest', 'helpful']).default('newest'),
});

/**
 * Schema pour les paramètres de liste des avis (Admin)
 */
export const listReviewsAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(ReviewStatus).optional(),
  productId: z.string().optional(),
  userId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'rating']).default('newest'),
});

/**
 * Schema pour le changement de statut d'un avis (Admin)
 */
export const changeReviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

/**
 * Schema pour les paramètres d'URL
 */
export const reviewIdParamSchema = z.object({
  id: z.string().min(1, 'ID avis requis'),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
export type ListProductReviewsQueryDto = z.infer<typeof listProductReviewsQuerySchema>;
export type ListReviewsAdminQueryDto = z.infer<typeof listReviewsAdminQuerySchema>;
export type ChangeReviewStatusDto = z.infer<typeof changeReviewStatusSchema>;
export type ReviewIdParamDto = z.infer<typeof reviewIdParamSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface ReviewUserResponse {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  helpful: number;
  response: string | null;
  responseAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: ReviewUserResponse;
  productId: string;
}

export interface ReviewWithProductResponse extends ReviewResponse {
  product: {
    id: string;
    name: string;
    image: string;
  };
}

export interface ProductReviewsStatsResponse {
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

export interface ReviewAdminResponse extends ReviewWithProductResponse {
  userId: string;
  orderId: string | null;
}
