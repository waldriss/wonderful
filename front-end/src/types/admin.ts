// ============================================
// ADMIN DASHBOARD TYPES
// ============================================

// ============================================
// CUSTOMERS
// ============================================
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  status: "active" | "inactive" | "suspended";
  subscription?: CustomerSubscription;
  points: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  notes?: string;
}

export interface CustomerSubscription {
  id: string;
  plan: string;
  status: "active" | "paused" | "cancelled";
  startDate: string;
  nextDelivery?: string;
  price: number;
}

// ============================================
// PRODUCTS
// ============================================
export interface Product {
  id: string;
  name: string;
  description: string;
  category: "plats" | "boissons" | "desserts" | "snacks";
  price: number;
  image: string;
  nutrition: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  stock: number;
  stockAlert: number;
  status: "active" | "draft" | "outOfStock";
  allergenes: string[];
  dietTypes: string[];
  rating: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: Product["category"];
  price: number;
  image?: File | string;
  nutrition: Product["nutrition"];
  stock: number;
  stockAlert: number;
  status: Product["status"];
  allergenes: string[];
  dietTypes: string[];
}

// ============================================
// ORDERS
// ============================================
export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "preparing" 
  | "in_transit" 
  | "delivered" 
  | "cancelled";

export interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  promoCode?: string;
  status: OrderStatus;
  statusHistory: StatusChange[];
  // Support both nested and flat delivery fields
  delivery?: {
    address: string;
    city: string;
    postalCode: string;
    date: string;
    timeSlot: string;
    instructions?: string;
  };
  // Flat delivery fields (alternative format)
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  // Support both nested and flat payment fields
  payment?: {
    method: string;
    status: "pending" | "paid" | "refunded" | "failed";
    paidAt?: string;
  };
  // Flat payment fields (alternative format)
  paymentMethod?: "card" | "cash";
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface StatusChange {
  status: OrderStatus;
  timestamp: string;
  by?: string;
  note?: string;
}

// ============================================
// SUBSCRIPTIONS
// ============================================
export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  plan: SubscriptionPlan;
  status: "active" | "paused" | "cancelled" | "expired";
  products: SubscriptionProduct[];
  delivery: {
    days: string[];
    address: string;
    timeSlot: string;
  };
  price: number;
  startDate: string;
  nextDelivery?: string;
  nextBilling?: string;
  cancelledAt?: string;
  pausedUntil?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: "weekly" | "monthly" | "quarterly";
  basePrice: number;
  description: string;
  maxProducts: number;
  features: string[];
}

export interface SubscriptionProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

// AdminSubscription - Alternative format for admin pages
export interface AdminSubscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  plan: {
    id: string;
    name: string;
    price: number;
    mealsPerWeek: number;
    description: string;
  };
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;
  nextBillingDate?: string;
  nextDeliveryDate?: string;
  deliveryDay?: string;
  deliveryTimeSlot?: string;
  paymentMethod?: "card" | "cash";
  totalSpent?: number;
  totalPaid?: number;
  deliveriesCount?: number;
  products?: SubscriptionProduct[];
  pausedAt?: string;
  pauseReason?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// ============================================
// DELIVERIES
// ============================================
export interface Delivery {
  id: string;
  orderId: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    address?: string;
    city?: string;
  };
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  scheduledDate: string;
  timeSlot: string;
  status: "scheduled" | "assigned" | "in_progress" | "in_transit" | "completed" | "delivered" | "pending" | "failed";
  driver?: Driver;
  notes?: string;
  completedAt?: string;
  deliveredAt?: string;
  estimatedArrival?: string;
  failureReason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: "available" | "busy" | "offline" | "active" | "inactive";
  currentDeliveries?: number;
  completedToday?: number;
  deliveriesToday?: number;
  rating?: number;
  zone?: string;
  vehicleType?: "scooter" | "car" | "bike";
}

// Alias for backward compatibility
export type DeliveryDriver = Driver;

// ============================================
// REVIEWS
// ============================================
export interface Review {
  id: string;
  // Denormalized fields (optional if nested objects are used)
  customerId?: string;
  customerName?: string;
  customerAvatar?: string;
  productId?: string;
  productName?: string;
  // Support nested customer object (alternative)
  customer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  // Support nested product object (alternative)
  product?: {
    id: string;
    name: string;
    image: string;
  };
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  status: "published" | "pending" | "hidden" | "flagged" | "approved";
  adminResponse?: string;
  response?: string;
  responseAt?: string;
  helpful?: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// MARKETING
// ============================================
export interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number;
  description?: string;
  minOrderAmount?: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil?: string;
  validTo?: string;
  status: "active" | "expired" | "disabled";
  applicableTo: "all" | "first_order" | "specific_products" | "subscription" | "vip";
  productIds?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "push" | "email" | "sms";
  target: "all" | "segment" | "specific";
  targetIds?: string[];
  sentAt?: string;
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

// ============================================
// GAMIFICATION ADMIN
// ============================================

// Base types used in gamification pages
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "order" | "social" | "nutrition" | "exploration" | "daily" | "weekly" | "monthly" | "streak" | "one_time";
  icon: string;
  target?: number;
  targetValue?: number;
  current?: number;
  reward: {
    type: "points" | "discount" | "free_item" | "badge";
    value: number | string;
    description?: string;
  };
  startDate?: string;
  endDate?: string;
  status: "active" | "upcoming" | "ended" | "inactive";
  completions?: number;
  completionsCount?: number;
  participants?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

export interface MysteryBox {
  id: string;
  name: string;
  description: string;
  icon?: string;
  cost: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  possibleRewards: Array<{
    type: string;
    value: number | string;
    probability: number;
    description?: string;
  }>;
  status: "active" | "inactive";
  openedCount?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement?: {
    type: string;
    target: number;
    description: string;
  };
  reward?: {
    type: "discount" | "points" | "free_item";
    value: number;
    description?: string;
  };
  earnedCount?: number;
  earnedBy?: number;
  status?: "active" | "disabled";
}

export interface BadgeAdmin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement: {
    type: string;
    target: number;
    description: string;
  };
  reward: {
    type: "discount" | "points" | "free_item";
    value: number;
    description: string;
  };
  earnedCount: number;
  status: "active" | "disabled";
}

export interface MissionAdmin {
  id: string;
  title: string;
  description: string;
  type: "order" | "social" | "nutrition" | "exploration";
  target: number;
  reward: {
    type: "points" | "discount" | "free_item";
    value: number;
  };
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "ended";
  completions: number;
  participants: number;
}

// ============================================
// ANALYTICS
// ============================================
export interface DashboardStats {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
  orders: {
    today: number;
    pending: number;
    preparing: number;
    inTransit: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    activeSubscribers: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  sold: number;
  revenue: number;
}

// ============================================
// TEAM / ADMIN USERS
// ============================================
export type AdminRole = 
  | "super_admin" 
  | "admin" 
  | "order_manager" 
  | "delivery_manager" 
  | "viewer";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

// ============================================
// SETTINGS
// ============================================
export interface AppSettings {
  general: {
    companyName: string;
    logo?: string;
    email: string;
    phone: string;
    address: string;
  };
  delivery: {
    zones: DeliveryZone[];
    timeSlots: string[];
    defaultFee: number;
    freeDeliveryThreshold: number;
  };
  gamification: {
    pointsPerDA: number;
    pointsRedemptionRate: number;
    mysteryBoxProbability: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string[];
  fee: number;
  minOrderAmount: number;
  active: boolean;
}

// ============================================
// COMMON TYPES
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface BulkAction {
  action: string;
  ids: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  timestamp: string;
  ip?: string;
}
