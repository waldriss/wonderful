import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDATION - ZONES DE LIVRAISON
// ============================================

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  fee: z.coerce.number().int().min(0, 'Les frais doivent être positifs'),
  minOrderAmount: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateDeliveryZoneSchema = createDeliveryZoneSchema.partial();

export const deliveryZoneIdParamSchema = z.object({
  id: z.string().min(1, 'ID zone requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateDeliveryZoneDto = z.infer<typeof createDeliveryZoneSchema>;
export type UpdateDeliveryZoneDto = z.infer<typeof updateDeliveryZoneSchema>;
export type DeliveryZoneIdParamDto = z.infer<typeof deliveryZoneIdParamSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface DeliveryZoneResponse {
  id: string;
  name: string;
  fee: number;
  minOrderAmount: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
