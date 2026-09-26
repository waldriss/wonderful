import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDATION - SUPPLEMENTS
// ============================================

/**
 * Schema pour la création d'un supplément (Admin)
 * Un supplément est une option payante ajoutable à un produit (ex: extra fromage)
 */
export const createSupplementSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  description: z.string().max(300).optional().nullable(),
  price: z.coerce.number().int().positive('Le prix doit être positif'),
  isActive: z.boolean().default(true),
});

/**
 * Schema pour la mise à jour d'un supplément (Admin)
 */
export const updateSupplementSchema = createSupplementSchema.partial();

/**
 * Schema pour les paramètres d'URL
 */
export const supplementIdParamSchema = z.object({
  id: z.string().min(1, 'ID supplément requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateSupplementDto = z.infer<typeof createSupplementSchema>;
export type UpdateSupplementDto = z.infer<typeof updateSupplementSchema>;
export type SupplementIdParamDto = z.infer<typeof supplementIdParamSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface SupplementResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  productsCount: number;
  createdAt: Date;
  updatedAt: Date;
}