import { z } from 'zod';
import { SubscriptionStatus, SubscriptionPlanType } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - Client
// ============================================

/**
 * Schema pour souscrire à un abonnement
 */
export const subscribeSchema = z.object({
  planId: z.string().cuid('ID du plan invalide'),
  deliveryAddress: z.string().min(5, 'Adresse de livraison requise'),
  deliveryDays: z.array(z.string()).min(1, 'Au moins un jour de livraison requis'),
  deliveryTimeSlot: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'CASH', 'TRANSFER']),
});

/**
 * Schema pour mettre à jour un abonnement
 */
export const updateSubscriptionSchema = z.object({
  deliveryAddress: z.string().min(5, 'Adresse de livraison invalide').optional(),
  deliveryDays: z.array(z.string()).optional(),
  deliveryTimeSlot: z.string().optional(),
});

/**
 * Schema pour pause/resume
 */
export const pauseSubscriptionSchema = z.object({
  pauseReason: z.string().min(1, 'Raison de la pause requise').optional(),
});

// ============================================
// SCHEMAS DE VALIDATION - Admin
// ============================================

/**
 * Schema pour créer un plan d'abonnement
 */
export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  type: z.nativeEnum(SubscriptionPlanType),
  basePrice: z.number().positive('Le prix doit être positif'),
  maxProducts: z.number().int().positive('Nombre de produits invalide').optional(),
  features: z.array(z.string()).default([]),
  discount: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Schema pour modifier un plan
 */
export const updatePlanSchema = createPlanSchema.partial();

/**
 * Schema pour changer le statut d'un plan
 */
export const changePlanStatusSchema = z.object({
  isActive: z.boolean(),
});

/**
 * Schema de requête pour lister les abonnements
 */
export const listSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  planId: z.string().cuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'nextDeliveryDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema pour actions admin sur abonnement
 */
export const adminSubscriptionActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel']),
  reason: z.string().optional(),
});

// ============================================
// TYPES
// ============================================

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type PauseSubscriptionInput = z.infer<typeof pauseSubscriptionSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface PlanResponse {
  id: string;
  name: string;
  description: string | null;
  type: SubscriptionPlanType;
  basePrice: number;
  maxProducts: number | null;
  features: string[];
  discount: number | null;
  isActive: boolean;
  subscriberCount?: number;
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  nextBillingDate: Date | null;
  nextDeliveryDate: Date | null;
  deliveryDays: string[];
  deliveryAddress: string;
  deliveryTimeSlot: string | null;
  paymentMethod: string;
  totalPaid: number;
  deliveriesCount: number;
  pausedAt: Date | null;
  pauseReason: string | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanResponse;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
  planDistribution: {
    planId: string;
    planName: string;
    count: number;
    percentage: number;
  }[];
}
