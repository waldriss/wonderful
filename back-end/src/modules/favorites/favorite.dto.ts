import { z } from 'zod';
import { ProductCategory } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - FAVORIS
// ============================================

/**
 * Schema pour les paramètres de liste des favoris
 */
export const listFavoritesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  category: z.nativeEnum(ProductCategory).optional(),
});

/**
 * Schema pour les paramètres d'URL (productId)
 */
export const favoriteProductParamSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type ListFavoritesQueryDto = z.infer<typeof listFavoritesQuerySchema>;
export type FavoriteProductParamDto = z.infer<typeof favoriteProductParamSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface FavoriteProductResponse {
  id: string;
  productId: string;
  addedAt: Date;
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
