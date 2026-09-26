// ============================================
// ENUMS (mirrored from backend — do not import @prisma/client in frontend)
// ============================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'CASH';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

// Namespace-style object so we can write `OrderStatus.PENDING` in the page
// eslint-disable-next-line @typescript-eslint/no-namespace
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

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
// CART TYPES
// ============================================

export interface CartSupplement {
  supplementId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  price: number;
  finalPrice: number;
  discount: number | null;
  isOnSale: boolean;
  quantity: number;
  /** Suppléments sélectionnés pour cette ligne */
  supplements: CartSupplement[];
  /** Prix unitaire incluant les suppléments (finalPrice + suppléments) */
  unitTotal: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface CartSupplementInput {
  supplementId: string;
  quantity: number;
}

export interface AddCartItemDto {
  productId: string;
  quantity: number;
  supplements?: CartSupplementInput[];
}

export interface UpdateCartItemQuantityDto {
  quantity: number;
}

export interface MergeCartDto {
  items: {
    productId: string;
    quantity: number;
    supplements?: CartSupplementInput[];
  }[];
}

// ============================================
// ORDER TYPES
// ============================================

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  /** Suppléments figés au moment de la commande */
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
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number | null;
  deliveryFee: number | null;
  discount: number | null;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryDate: string | null;
  deliveryTimeSlot: string | null;
  deliveryNotes: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  items: OrderItemResponse[];
  statusHistory: OrderStatusHistoryResponse[];
  promoCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  createdAt: string;
}

export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
    supplements?: CartSupplementInput[];
  }[];
  deliveryZoneId?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  /** ID d'un bon de récompense gamification (mutuellement exclusif avec promoCode) */
  userRewardId?: string;
  // Champs invité (requis si non authentifié)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
