import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getDashboardStats,
  getAnalyticsOverview,
  getRevenueChart,
  getTopProducts,
  getTopCustomers,
  getAdminOrders,
  getAdminOrder,
  getAdminProducts,
  getAdminProduct,
  getAdminUsers,
  getAdminUser,
  getAdminReviews,
  getAdminReviewStats,
  getAdminPromoCodes,
  // Phase 4
  getAdminSubscriptions,
  getAdminSubscriptionStats,
  getAdminSubscription,
  getAdminSubscriptionPlans,
  getAdminBadges,
  getAdminMissions,
  getAdminMysteryBoxes,
  getAdminGamificationStats,
  getAdminNotifications,
  getAdminNotificationStats,
  // Phase 5
  getAdminSettings,
  // Phase 3 Leaderboard
  getLeaderboardConfigs,
  getMonthlyLeaderboardAdmin,
} from './clientRequests';
import type {
  AnalyticsQuery,
  AdminOrderListParams,
  AdminProductListParams,
  AdminUserListParams,
  AdminReviewListParams,
  AdminPromoCodeListParams,
  // Phase 4
  AdminSubscriptionListParams,
  AdminGamificationListParams,
  AdminNotificationListParams,
} from './types';

// ============================================
// QUERY KEY FACTORY
// ============================================

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  analytics: () => [...adminKeys.all, 'analytics'] as const,
  analyticsOverview: (query?: AnalyticsQuery) =>
    [...adminKeys.analytics(), 'overview', query] as const,
  revenueChart: (query?: AnalyticsQuery) =>
    [...adminKeys.analytics(), 'revenue', query] as const,
  topProducts: (limit?: number, startDate?: string, endDate?: string) =>
    [...adminKeys.analytics(), 'top-products', { limit, startDate, endDate }] as const,
  topCustomers: (limit?: number, startDate?: string, endDate?: string) =>
    [...adminKeys.analytics(), 'top-customers', { limit, startDate, endDate }] as const,
  orders: () => [...adminKeys.all, 'orders'] as const,
  ordersList: (params?: AdminOrderListParams) =>
    [...adminKeys.orders(), 'list', params] as const,
  orderDetail: (id: string) =>
    [...adminKeys.orders(), 'detail', id] as const,
  // Products
  products: () => [...adminKeys.all, 'products'] as const,
  productsList: (params?: AdminProductListParams) =>
    [...adminKeys.products(), 'list', params] as const,
  productDetail: (id: string) =>
    [...adminKeys.products(), 'detail', id] as const,
  // Users / Customers
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (params?: AdminUserListParams) =>
    [...adminKeys.users(), 'list', params] as const,
  userDetail: (id: string) =>
    [...adminKeys.users(), 'detail', id] as const,
  // Reviews
  reviews: () => [...adminKeys.all, 'reviews'] as const,
  reviewsList: (params?: AdminReviewListParams) =>
    [...adminKeys.reviews(), 'list', params] as const,
  reviewStats: () => [...adminKeys.reviews(), 'stats'] as const,
  // Promo Codes
  promoCodes: () => [...adminKeys.all, 'promo-codes'] as const,
  promoCodesList: (params?: AdminPromoCodeListParams) =>
    [...adminKeys.promoCodes(), 'list', params] as const,
  // Subscriptions (Phase 4)
  subscriptions: () => [...adminKeys.all, 'subscriptions'] as const,
  subscriptionsList: (params?: AdminSubscriptionListParams) =>
    [...adminKeys.subscriptions(), 'list', params] as const,
  subscriptionDetail: (id: string) =>
    [...adminKeys.subscriptions(), 'detail', id] as const,
  subscriptionStats: () => [...adminKeys.subscriptions(), 'stats'] as const,
  subscriptionPlans: () => [...adminKeys.subscriptions(), 'plans'] as const,
  // Gamification (Phase 4)
  gamification: () => [...adminKeys.all, 'gamification'] as const,
  badges: () => [...adminKeys.gamification(), 'badges'] as const,
  badgesList: (params?: AdminGamificationListParams) =>
    [...adminKeys.badges(), 'list', params] as const,
  missions: () => [...adminKeys.gamification(), 'missions'] as const,
  missionsList: (params?: AdminGamificationListParams) =>
    [...adminKeys.missions(), 'list', params] as const,
  mysteryBoxes: () => [...adminKeys.gamification(), 'mystery-boxes'] as const,
  mysteryBoxesList: (params?: AdminGamificationListParams) =>
    [...adminKeys.mysteryBoxes(), 'list', params] as const,
  gamificationStats: () => [...adminKeys.gamification(), 'stats'] as const,
  // Leaderboard (Phase 3)
  leaderboardConfigs: () => [...adminKeys.gamification(), 'leaderboard-configs'] as const,
  monthlyLeaderboard: (year?: number, month?: number) =>
    [...adminKeys.gamification(), 'monthly-leaderboard', { year, month }] as const,
  // Notifications (Phase 4)
  notifications: () => [...adminKeys.all, 'notifications'] as const,
  notificationsList: (params?: AdminNotificationListParams) =>
    [...adminKeys.notifications(), 'list', params] as const,
  notificationStats: () => [...adminKeys.notifications(), 'stats'] as const,
  // Settings (Phase 5)
  settings: () => [...adminKeys.all, 'settings'] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Stats globales du dashboard admin
 * Appelle GET /api/admin/dashboard
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getDashboardStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Vue d'ensemble analytics (stats + charts + top products + customers)
 * Appelle GET /api/admin/analytics
 */
export function useAnalyticsOverview(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: adminKeys.analyticsOverview(query),
    queryFn: () => getAnalyticsOverview(query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Graphique de revenus
 * Appelle GET /api/admin/analytics/revenue
 */
export function useRevenueChart(query?: AnalyticsQuery) {
  return useQuery({
    queryKey: adminKeys.revenueChart(query),
    queryFn: () => getRevenueChart(query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Top produits vendus
 * Appelle GET /api/admin/analytics/top-products
 */
export function useTopProducts(limit?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: adminKeys.topProducts(limit, startDate, endDate),
    queryFn: () => getTopProducts(limit, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Top clients
 * Appelle GET /api/admin/analytics/top-customers
 */
export function useTopCustomers(limit?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: adminKeys.topCustomers(limit, startDate, endDate),
    queryFn: () => getTopCustomers(limit, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Liste des commandes admin (pour le tableau de bord — commandes récentes)
 * Appelle GET /api/admin/orders
 */
export function useAdminOrders(params: AdminOrderListParams = {}) {
  return useQuery({
    queryKey: adminKeys.ordersList(params),
    queryFn: () => getAdminOrders(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// PRODUCTS
// ============================================

/**
 * Liste paginée des produits (admin)
 */
export function useAdminProducts(params: AdminProductListParams = {}) {
  return useQuery({
    queryKey: adminKeys.productsList(params),
    queryFn: () => getAdminProducts(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Détail d'un produit (admin)
 */
export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: adminKeys.productDetail(id),
    queryFn: () => getAdminProduct(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// USERS / CUSTOMERS
// ============================================

/**
 * Liste paginée des clients (admin)
 */
export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: adminKeys.usersList(params),
    queryFn: () => getAdminUsers(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Détail d'un client (admin)
 */
export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.userDetail(id),
    queryFn: () => getAdminUser(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// ORDERS DETAIL (Phase 3)
// ============================================

/**
 * Détail d'une commande (admin)
 */
export function useAdminOrderDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.orderDetail(id),
    queryFn: () => getAdminOrder(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// REVIEWS (Phase 3)
// ============================================

/**
 * Liste paginée des avis (admin)
 */
export function useAdminReviews(params: AdminReviewListParams = {}) {
  return useQuery({
    queryKey: adminKeys.reviewsList(params),
    queryFn: () => getAdminReviews(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Statistiques des avis par statut (admin)
 */
export function useAdminReviewStats() {
  return useQuery({
    queryKey: adminKeys.reviewStats(),
    queryFn: () => getAdminReviewStats(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// PROMO CODES (Phase 3)
// ============================================

/**
 * Liste paginée des codes promo (admin)
 */
export function useAdminPromoCodes(params: AdminPromoCodeListParams = {}) {
  return useQuery({
    queryKey: adminKeys.promoCodesList(params),
    queryFn: () => getAdminPromoCodes(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// SUBSCRIPTIONS (Phase 4)
// ============================================

export function useAdminSubscriptions(params: AdminSubscriptionListParams = {}) {
  return useQuery({
    queryKey: adminKeys.subscriptionsList(params),
    queryFn: () => getAdminSubscriptions(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminSubscriptionStats() {
  return useQuery({
    queryKey: adminKeys.subscriptionStats(),
    queryFn: getAdminSubscriptionStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminSubscriptionDetail(id: string) {
  return useQuery({
    queryKey: adminKeys.subscriptionDetail(id),
    queryFn: () => getAdminSubscription(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminSubscriptionPlans() {
  return useQuery({
    queryKey: adminKeys.subscriptionPlans(),
    queryFn: getAdminSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// GAMIFICATION (Phase 4)
// ============================================

export function useAdminBadges(params: AdminGamificationListParams = {}) {
  return useQuery({
    queryKey: adminKeys.badgesList(params),
    queryFn: () => getAdminBadges(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminMissions(params: AdminGamificationListParams = {}) {
  return useQuery({
    queryKey: adminKeys.missionsList(params),
    queryFn: () => getAdminMissions(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminMysteryBoxes(params: AdminGamificationListParams = {}) {
  return useQuery({
    queryKey: adminKeys.mysteryBoxesList(params),
    queryFn: () => getAdminMysteryBoxes(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminGamificationStats() {
  return useQuery({
    queryKey: adminKeys.gamificationStats(),
    queryFn: getAdminGamificationStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// LEADERBOARD (Phase 3)
// ============================================

export function useLeaderboardConfigs() {
  return useQuery({
    queryKey: adminKeys.leaderboardConfigs(),
    queryFn: getLeaderboardConfigs,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useMonthlyLeaderboardAdmin(year?: number, month?: number) {
  return useQuery({
    queryKey: adminKeys.monthlyLeaderboard(year, month),
    queryFn: () => getMonthlyLeaderboardAdmin(year, month),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// NOTIFICATIONS (Phase 4)
// ============================================

export function useAdminNotifications(params: AdminNotificationListParams = {}) {
  return useQuery({
    queryKey: adminKeys.notificationsList(params),
    queryFn: () => getAdminNotifications(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: adminKeys.notificationStats(),
    queryFn: getAdminNotificationStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// SETTINGS (Phase 5)
// ============================================

export function useAdminSettings() {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: getAdminSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}

// ============================================
// TEAM (Phase 5) — réutilise useAdminUsers filtré par rôle
// ============================================

/**
 * Liste les membres de l'équipe (ADMIN, SUPER_ADMIN)
 * Réutilise GET /api/admin/users avec filtrage multi-rôle côté client
 */
export function useAdminTeam() {
  return useQuery({
    queryKey: [...adminKeys.users(), 'team'] as const,
    queryFn: () => getAdminUsers({ limit: 100 }),
    select: (data) => ({
      ...data,
      data: data.data.filter((u) =>
        ['ADMIN', 'SUPER_ADMIN'].includes(u.role)
      ),
    }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return failureCount < 2;
    },
  });
}
