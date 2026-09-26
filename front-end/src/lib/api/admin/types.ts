// ============================================
// ADMIN API — TYPES (correspondant aux réponses backend)
// ============================================

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * Réponse de GET /api/admin/dashboard
 * Structure plate retournée par adminService.getDashboardStats()
 */
export interface AdminDashboardStats {
  // Ventes (mois en cours vs mois précédent)
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;

  // Utilisateurs
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  usersChange: number;

  // Abonnements
  activeSubscriptions: number;
  subscriptionsChange: number;
  subscriptionRevenue: number;

  // Produits
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

// ============================================
// ANALYTICS
// ============================================

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface AnalyticsQuery {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Un point de données pour le graphique de revenus
 * Réponse de GET /api/admin/analytics/revenue
 */
export interface RevenueChartData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

/**
 * Un top produit
 * Réponse de GET /api/admin/analytics/top-products
 */
export interface AdminTopProduct {
  id: string;
  name: string;
  image: string | null;
  totalSold: number;
  revenue: number;
}

/**
 * Un top client
 * Réponse de GET /api/admin/analytics/top-customers
 */
export interface AdminTopCustomer {
  id: string;
  name: string | null;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

/**
 * Distribution des statuts de commande
 */
export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Réponse de GET /api/admin/analytics
 */
export interface AnalyticsOverview {
  stats: AdminDashboardStats;
  revenueChart: RevenueChartData[];
  topProducts: AdminTopProduct[];
  topCustomers: AdminTopCustomer[];
  orderStatusDistribution: OrderStatusDistribution[];
}

// ============================================
// ADMIN ORDERS (pour le tableau de bord)
// ============================================

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  sortBy?: 'newest' | 'oldest' | 'total-high' | 'total-low';
}

// ============================================
// PAGINATION (structure commune des réponses paginées backend)
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
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// ADMIN PRODUCTS
// ============================================

export type ProductCategory = 'PLATS' | 'BOISSONS' | 'DESSERTS' | 'SNACKS';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';

export interface ProductNutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  finalPrice: number;
  image: string;
  stock: number;
  stockAlert: number;
  status: ProductStatus;
  rating: number;
  totalSold: number;
  isNew: boolean;
  isOnSale: boolean;
  isBestSeller: boolean;
  discount: number | null;
  portionSize: string | null;
  prepTime: string | null;
  images: string[];
  nutrition: ProductNutrition | null;
  allergens: string[];
  dietTypes: string[];
  mealTypes: string[];
  dietaryGoals: string[];
  supplements: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
  }>;
  reviewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  category?: ProductCategory;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'alphabetical' | 'rating';
}

export interface CreateProductData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  // image is sent as a File via multipart upload, not in this object
  // imageFiles (secondary) are sent as File[] via multipart, not in this object
  // removeImages: URLs of secondary images to delete (sent as JSON string)
  stock?: number;
  stockAlert?: number;
  status?: ProductStatus;
  isNew?: boolean;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  discount?: number | null;
  portionSize?: string | null;
  prepTime?: string | null;
  nutrition?: ProductNutrition;
  allergens?: string[];
  dietTypes?: string[];
  mealTypes?: string[];
  dietaryGoals?: string[];
  // IDs des suppléments associés au produit
  supplements?: string[];
}

export type UpdateProductData = Partial<CreateProductData>;

export interface UpdateStockData {
  stock: number;
  operation?: 'set' | 'add' | 'subtract';
}

// ============================================
// ADMIN USERS / CUSTOMERS
// ============================================

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AdminCustomer {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminCustomerDetails {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  totalSpent: number;
  ordersCount: number;
  reviewsCount: number;
  favoritesCount: number;
  badgesCount: number;
  points: {
    available: number;
    lifetime: number;
  } | null;
  streak: {
    current: number;
    longest: number;
  } | null;
  subscription: {
    id: string;
    planName: string;
    status: string;
    startDate: string;
    nextDeliveryDate: string | null;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }>;
  orderTrustStatus: CustomerOrderTrustStatus;
  orderTrustNote: string | null;
  orderTrustUpdatedAt: string | null;
  orderTrustUpdatedBy: string | null;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface ChangeUserStatusData {
  status: UserStatus;
  reason?: string;
}

export type CustomerOrderTrustStatus = 'NONE' | 'VERIFIED' | 'UNRELIABLE';

export interface UpdateCustomerOrderTrustData {
  orderTrustStatus: CustomerOrderTrustStatus;
  orderTrustNote?: string;
}

// ============================================
// ADMIN ORDERS — FULL DETAIL (Phase 3)
// ============================================

/** Enum statuts commande (valeurs backend Prisma) */
export type OrderStatusAPI =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

/** Statut confirmation téléphonique */
export type PhoneConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'NO_RESPONSE' | 'DECLINED';

/** Enum paiement (valeurs backend Prisma) */
export type PaymentStatusAPI = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethodAPI = 'CARD' | 'CASH';

export interface AdminOrderItem {
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

export interface AdminOrderStatusHistory {
  id: string;
  status: OrderStatusAPI;
  note: string | null;
  changedBy: string | null;
  timestamp: string;
}

/**
 * Commande complète (Admin) — correspond à OrderAdminResponse du backend
 */
export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatusAPI;
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
  paymentMethod: PaymentMethodAPI;
  paymentStatus: PaymentStatusAPI;
  paidAt: string | null;
  items: AdminOrderItem[];
  statusHistory: AdminOrderStatusHistory[];
  promoCode: string | null;
  createdAt: string;
  updatedAt: string;
  phoneConfirmation: {
    status: PhoneConfirmationStatus;
    confirmedAt: string | null;
    confirmedNumber: string | null;
    note: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    orderTrustStatus: CustomerOrderTrustStatus;
    orderTrustNote: string | null;
  };
}

export interface UpdateOrderStatusData {
  status: OrderStatusAPI;
  note?: string;
}

export interface UpdatePhoneConfirmationData {
  status: PhoneConfirmationStatus;
  phoneNumber?: string;
  note?: string;
}

// ============================================
// ADMIN REVIEWS (Phase 3)
// ============================================

export type ReviewStatusAPI = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatusAPI;
  helpful: number;
  response: string | null;
  responseAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
  userId: string;
  orderId: string | null;
  productId: string;
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  status?: ReviewStatusAPI;
  productId?: string;
  userId?: string;
  rating?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'rating';
}

export interface AdminReviewStats {
  byStatus: Record<ReviewStatusAPI, number>;
  total: number;
  pendingCount: number;
}

// ============================================
// ADMIN PROMO CODES (Phase 3)
// ============================================

export type PromoCodeTypeAPI = 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
export type PromoCodeStatusAPI = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type PromoApplicableToAPI = 'ALL' | 'FIRST_ORDER' | 'SUBSCRIPTION';

export interface AdminPromoCode {
  id: string;
  code: string;
  type: PromoCodeTypeAPI;
  value: number;
  description: string | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  status: PromoCodeStatusAPI;
  applicableTo: PromoApplicableToAPI;
}

export interface AdminPromoCodeListParams {
  page?: number;
  limit?: number;
  status?: PromoCodeStatusAPI;
  type?: PromoCodeTypeAPI;
  search?: string;
}

export interface CreatePromoCodeData {
  code: string;
  type: PromoCodeTypeAPI;
  value: number;
  description?: string;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  validFrom?: string;
  validUntil?: string | null;
  status?: PromoCodeStatusAPI;
  applicableTo?: PromoApplicableToAPI;
}

export type UpdatePromoCodeData = Partial<CreatePromoCodeData>;

export interface ChangePromoCodeStatusData {
  status: PromoCodeStatusAPI;
}

// ============================================
// ADMIN SUBSCRIPTIONS (Phase 4)
// ============================================

export type SubscriptionPlanTypeAPI = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
export type SubscriptionStatusAPI = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PENDING';

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  type: SubscriptionPlanTypeAPI;
  basePrice: number;
  maxProducts: number | null;
  features: string[];
  discount: number | null;
  isActive: boolean;
  subscriberCount?: number;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatusAPI;
  startDate: string;
  nextBillingDate: string | null;
  nextDeliveryDate: string | null;
  deliveryDays: string[];
  deliveryAddress: string;
  deliveryTimeSlot: string | null;
  paymentMethod: string;
  totalPaid: number;
  deliveriesCount: number;
  pausedAt: string | null;
  pauseReason: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  plan: AdminSubscriptionPlan;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface AdminSubscriptionStats {
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

export interface AdminSubscriptionListParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatusAPI;
  planId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'nextDeliveryDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanData {
  name: string;
  description?: string;
  type: SubscriptionPlanTypeAPI;
  basePrice: number;
  maxProducts?: number;
  features?: string[];
  discount?: number;
  isActive?: boolean;
}

export type UpdatePlanData = Partial<CreatePlanData>;

export interface ChangePlanStatusData {
  isActive: boolean;
}

export interface AdminSubscriptionActionData {
  action: 'pause' | 'resume' | 'cancel';
  reason?: string;
}

// ============================================
// ADMIN GAMIFICATION (Phase 4)
// ============================================

export type BadgeRarityAPI = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type BadgeStatusAPI = 'ACTIVE' | 'INACTIVE';
export type MissionTypeAPI = 'ORDER_COUNT' | 'TOTAL_SPENT' | 'REFERRAL_COUNT' | 'STREAK_DAYS';
export type MissionStatusAPI = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type RewardTypeAPI = 'POINTS' | 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_FIXED' | 'FREE_DELIVERY';

export interface AdminBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string | null;
  rarity: BadgeRarityAPI;
  requirementType: MissionTypeAPI | null;
  requirementTarget: number | null;
  rewardType: RewardTypeAPI | null;
  rewardValue: number | null;
  earnedCount: number;
  status: BadgeStatusAPI;
}

export interface AdminMission {
  id: string;
  title: string;
  description: string;
  type: MissionTypeAPI;
  icon: string | null;
  targetValue: number;
  rewardType: RewardTypeAPI;
  rewardValue: number;
  startDate: string | null;
  endDate: string | null;
  status: MissionStatusAPI;
  completionsCount: number;
}

export interface AdminMysteryBox {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  cost: number;
  rarity: BadgeRarityAPI;
  status: string;
  openedCount: number;
  rewards?: {
    type: RewardTypeAPI;
    value: number;
    probability: number;
    description: string | null;
  }[];
}

export interface AdminGamificationStats {
  totalPointsAccounts: number;
  totalPointsDistributed: number;
  totalBadgesEarned: number;
  totalMissionsCompleted: number;
  totalReferrals: number;
  mysteryBoxesOpened: number;
}

export interface AdminGamificationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface CreateBadgeData {
  name: string;
  description: string;
  icon: string;
  category?: string;
  rarity?: BadgeRarityAPI;
  requirementType?: MissionTypeAPI;
  requirementTarget?: number;
  rewardType?: RewardTypeAPI;
  rewardValue?: number;
  status?: BadgeStatusAPI;
}

export type UpdateBadgeData = Partial<CreateBadgeData>;

export interface CreateMissionData {
  title: string;
  description: string;
  type: MissionTypeAPI;
  icon?: string;
  targetValue: number;
  rewardType: RewardTypeAPI;
  rewardValue?: number;
  startDate?: string;
  endDate?: string;
  status?: MissionStatusAPI;
}

export type UpdateMissionData = Partial<CreateMissionData>;

export interface CreateMysteryBoxData {
  name: string;
  description?: string;
  icon?: string;
  cost?: number;
  rarity?: BadgeRarityAPI;
  rewards: {
    type: string;
    value: number;
    probability: number;
    description?: string;
  }[];
}

export type UpdateMysteryBoxData = Partial<CreateMysteryBoxData>;

export interface GrantPointsData {
  userId: string;
  points: number;
  reason: string;
}

// ============================================
// ADMIN LEADERBOARD CONFIG (Phase 3)
// ============================================

export interface LeaderboardConfig {
  id: string;
  rank: number;
  rewardType: RewardTypeAPI;
  rewardValue: number;
  isActive: boolean;
  createdAt: string;
}

export interface MonthlyLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  monthlyPoints: number;
  badgeCount: number;
}

export interface DistributeRewardsResponse {
  success: boolean;
  year: number;
  month: number;
  distributedAt: string;
  winners: {
    rank: number;
    userId: string;
    userName: string | null;
    monthlyPoints: number;
    rewardType: RewardTypeAPI;
    rewardValue: number;
    userRewardId: string | null;
  }[];
}

// ============================================
// ADMIN NOTIFICATIONS (Phase 4)
// ============================================

// Aligné sur l'enum NotificationType du backend (back-end/prisma/schema.prisma)
export type NotificationTypeAPI =
  | 'BADGE_UNLOCKED'
  | 'MISSION_COMPLETE'
  | 'STREAK_MILESTONE'
  | 'MYSTERY_BOX'
  | 'REFERRAL_SUCCESS'
  | 'ORDER_UPDATE'
  | 'SUBSCRIPTION_UPDATE'
  | 'PROMO'
  | 'GENERAL';

export interface AdminNotification {
  id: string;
  userId: string;
  type: NotificationTypeAPI;
  title: string;
  message: string;
  icon: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
  /** Client destinataire (inclus par le backend dans la liste admin) */
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface AdminNotificationStats {
  total: number;
  unread: number;
  byType: {
    type: NotificationTypeAPI;
    count: number;
  }[];
  /** Souscriptions push web (observabilité) */
  push?: {
    activeSubscriptions: number;
    inactiveSubscriptions: number;
  };
}

export interface AdminNotificationListParams {
  page?: number;
  limit?: number;
  type?: NotificationTypeAPI;
  read?: boolean;
}

export interface CreateNotificationData {
  userId: string;
  type?: NotificationTypeAPI;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
}

export interface BulkNotificationData {
  userIds: string[];
  type?: NotificationTypeAPI;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
}

// ============================================
// ADMIN SETTINGS (Phase 5)
// ============================================

export interface AdminSetting {
  id: string;
  key: string;
  value: unknown;
  description?: string | null;
  isPublic: boolean;
  updatedAt: string;
}

export interface UpsertSettingData {
  key: string;
  value: unknown;
  description?: string;
  isPublic?: boolean;
}

// ============================================
// ADMIN TEAM (Phase 5)
// ============================================

export type TeamRole = 'ADMIN' | 'SUPER_ADMIN';

export interface ChangeUserRoleData {
  role: UserRole;
}
