// ============================================
// ENUMS
// ============================================

export type SubscriptionPlanType = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionPaymentMethod = 'CARD' | 'CASH' | 'TRANSFER';

// ============================================
// ENTITIES
// ============================================

export interface SubscriptionPlan {
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

export interface SubscriptionProductItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string | null;
  nextDeliveryDate: string | null;
  deliveryDays: string[];
  deliveryAddress: string;
  deliveryTimeSlot: string | null;
  paymentMethod: SubscriptionPaymentMethod;
  totalPaid: number;
  deliveriesCount: number;
  pausedAt: string | null;
  pauseReason: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
  products?: SubscriptionProductItem[];
}

// ============================================
// DTOs
// ============================================

export interface CreateSubscriptionDto {
  planId: string;
  deliveryAddress: string;
  deliveryDays: string[];
  deliveryTimeSlot?: string;
  paymentMethod: SubscriptionPaymentMethod;
}

export interface UpdateSubscriptionDto {
  deliveryAddress?: string;
  deliveryDays?: string[];
  deliveryTimeSlot?: string;
}

export interface PauseSubscriptionDto {
  pauseReason?: string;
}

// ============================================
// RESPONSE WRAPPERS
// ============================================

export interface PlansResponse {
  plans: SubscriptionPlan[];
}

export interface SubscriptionHistoryResponse {
  subscriptions: Subscription[];
}
