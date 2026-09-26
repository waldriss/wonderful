import { z } from 'zod';
import { OrderStatus, PaymentMethod, PaymentStatus, PhoneConfirmationStatus } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - COMMANDES
// ============================================

/**
 * Schema pour un supplément sélectionné dans le panier
 */
export const cartSupplementSchema = z.object({
  supplementId: z.string().min(1, 'ID supplément requis'),
  quantity: z.coerce.number().int().positive('Quantité doit être positive').default(1),
});

/**
 * Schema pour l'ajout d'un item au panier
 */
export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  quantity: z.coerce.number().int().positive('Quantité doit être positive').default(1),
  supplements: z.array(cartSupplementSchema).optional(),
});

/**
 * Schema pour la mise à jour de la quantité d'une ligne du panier
 */
export const updateCartItemQuantitySchema = z.object({
  quantity: z.coerce.number().int().positive('Quantité doit être positive'),
});

/**
 * Schema pour la fusion du panier local avec le panier serveur
 */
export const mergeCartSchema = z.object({
  items: z.array(addCartItemSchema).min(1, 'Au moins un article requis'),
});

/**
 * Schema pour un item de commande
 */
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  quantity: z.coerce.number().int().positive('Quantité doit être positive'),
  // Suppléments sélectionnés (optionnels, validés au niveau du service)
  supplements: z.array(cartSupplementSchema).optional(),
});

/**
 * Schema pour la création d'une commande
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un produit requis'),
  
  // Zone de livraison (prioritaire sur deliveryCity si fournie)
  deliveryZoneId: z.string().optional(),

  // Livraison
  deliveryAddress: z.string().min(5, 'Adresse de livraison requise'),
  deliveryCity: z.string().default(''),
  deliveryPostalCode: z.string().min(4, 'Code postal requis'),
  deliveryDate: z.coerce.date().optional(),
  deliveryTimeSlot: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
  
  // Paiement
  paymentMethod: z.nativeEnum(PaymentMethod),
  
  // Code promo (optionnel, mutuellement exclusif avec userRewardId)
  promoCode: z.string().optional(),

  // Bon de récompense gamification (optionnel, mutuellement exclusif avec promoCode)
  userRewardId: z.string().cuid('ID de récompense invalide').optional(),

  // Informations invité (requis si non authentifié)
  guestName: z.string().min(2, 'Nom requis').optional(),
  guestEmail: z.string().email('Email invalide').optional(),
  guestPhone: z.string().min(8, 'Numéro de téléphone requis').optional(),
});

/**
 * Schema pour les paramètres de liste des commandes (Client)
 */
export const listMyOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.nativeEnum(OrderStatus).optional(),
});

/**
 * Schema pour les paramètres de liste des commandes (Admin)
 */
export const listOrdersAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'total-high', 'total-low']).default('newest'),
});

/**
 * Schema pour le changement de statut (Admin)
 */
export const changeOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().max(500).optional(),
});

/**
 * Schema pour les paramètres d'URL
 */
export const orderIdParamSchema = z.object({
  id: z.string().min(1, 'ID commande requis'),
});

/**
 * Schema pour la confirmation téléphonique (Admin)
 */
export const updatePhoneConfirmationSchema = z.object({
  status: z.nativeEnum(PhoneConfirmationStatus),
  phoneNumber: z.string().optional(),
  note: z.string().max(500).optional(),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type OrderItemDto = z.infer<typeof orderItemSchema>;
export type ListMyOrdersQueryDto = z.infer<typeof listMyOrdersQuerySchema>;
export type ListOrdersAdminQueryDto = z.infer<typeof listOrdersAdminQuerySchema>;
export type ChangeOrderStatusDto = z.infer<typeof changeOrderStatusSchema>;
export type OrderIdParamDto = z.infer<typeof orderIdParamSchema>;
export type UpdatePhoneConfirmationDto = z.infer<typeof updatePhoneConfirmationSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  // Suppléments figés au moment de la commande (nom et prix copiés)
  supplements: Array<{
    supplementId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  totalPrice: number;
}

export interface OrderStatusHistoryResponse {
  id: string;
  status: OrderStatus;
  note: string | null;
  changedBy: string | null;
  timestamp: Date;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number | null;
  deliveryFee: number | null;
  discount: number | null;
  
  // Livraison
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryDate: Date | null;
  deliveryTimeSlot: string | null;
  deliveryNotes: string | null;
  
  // Paiement
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: Date | null;
  
  // Items
  items: OrderItemResponse[];
  
  // Historique
  statusHistory: OrderStatusHistoryResponse[];
  
  // Promo
  promoCode: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneConfirmationResponse {
  status: PhoneConfirmationStatus;
  confirmedAt: Date | null;
  confirmedNumber: string | null;
  note: string | null;
}

export interface OrderAdminResponse extends OrderResponse {
  phoneConfirmation: PhoneConfirmationResponse;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    orderTrustStatus: import('@prisma/client').CustomerOrderTrustStatus;
    orderTrustNote: string | null;
  };
}

export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}
