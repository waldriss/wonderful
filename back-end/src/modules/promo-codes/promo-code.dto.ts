import { z } from 'zod';
import { PromoCodeType, PromoCodeStatus, PromoApplicableTo } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - CODES PROMO
// ============================================

/**
 * Schema pour la création d'un code promo (Admin)
 */
export const createPromoCodeSchema = z.object({
  code: z.string().min(3, 'Code trop court').max(20).toUpperCase(),
  type: z.nativeEnum(PromoCodeType),
  value: z.coerce.number().int().positive('Valeur doit être positive'),
  description: z.string().max(200).optional(),
  minOrderAmount: z.coerce.number().int().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  validFrom: z.coerce.date().default(() => new Date()),
  validUntil: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(PromoCodeStatus).default(PromoCodeStatus.ACTIVE),
  applicableTo: z.nativeEnum(PromoApplicableTo).default(PromoApplicableTo.ALL),
});

/**
 * Schema pour la mise à jour d'un code promo
 */
export const updatePromoCodeSchema = createPromoCodeSchema.partial();

/**
 * Schema pour le changement de statut
 */
export const changePromoCodeStatusSchema = z.object({
  status: z.nativeEnum(PromoCodeStatus),
});

/**
 * Schema pour la validation d'un code promo (Client)
 */
export const validatePromoCodeSchema = z.object({
  code: z.string().min(1, 'Code requis'),
  subtotal: z.coerce.number().int().positive('Montant requis'),
  deliveryFee: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Schema pour les paramètres de liste (Admin)
 */
export const listPromoCodesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(PromoCodeStatus).optional(),
  type: z.nativeEnum(PromoCodeType).optional(),
  search: z.string().optional(),
});

/**
 * Schema pour les paramètres d'URL
 */
export const promoCodeIdParamSchema = z.object({
  id: z.string().min(1, 'ID code promo requis'),
});

export type CreatePromoCodeDto = z.infer<typeof createPromoCodeSchema>;
export type UpdatePromoCodeDto = z.infer<typeof updatePromoCodeSchema>;
export type ChangePromoCodeStatusDto = z.infer<typeof changePromoCodeStatusSchema>;
export type ValidatePromoCodeDto = z.infer<typeof validatePromoCodeSchema>;
export type ListPromoCodesQueryDto = z.infer<typeof listPromoCodesQuerySchema>;
export type PromoCodeIdParamDto = z.infer<typeof promoCodeIdParamSchema>;

export interface PromoCodeResponse {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  description: string | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: Date;
  validUntil: Date | null;
  status: PromoCodeStatus;
  applicableTo: PromoApplicableTo;
}

export interface PromoCodeValidationResponse {
  valid: boolean;
  code: string;
  type: PromoCodeType;
  value: number;
  discount: number;
  requiresAuth?: boolean;
  message: string;
}
