import { apiGet, apiPostFormData, apiPutFormData, apiPatch, apiDelete, apiPost, apiPut } from '../apiFetch';
import type {
  AdminDashboardStats,
  AnalyticsOverview,
  RevenueChartData,
  AdminTopProduct,
  AdminTopCustomer,
  AnalyticsQuery,
  AdminOrderListParams,
  AdminProductListParams,
  AdminProduct,
  PaginatedResponse,
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  AdminUserListParams,
  AdminCustomer,
  AdminCustomerDetails,
  ChangeUserStatusData,
  UpdateCustomerOrderTrustData,
  // Phase 3
  AdminOrderDetail,
  UpdateOrderStatusData,
  UpdatePhoneConfirmationData,
  AdminReview,
  AdminReviewListParams,
  AdminReviewStats,
  AdminPromoCode,
  AdminPromoCodeListParams,
  CreatePromoCodeData,
  UpdatePromoCodeData,
  ChangePromoCodeStatusData,
  // Phase 4
  AdminSubscription,
  AdminSubscriptionPlan,
  AdminSubscriptionStats,
  AdminSubscriptionListParams,
  CreatePlanData,
  UpdatePlanData,
  ChangePlanStatusData,
  AdminSubscriptionActionData,
  AdminBadge,
  AdminMission,
  AdminMysteryBox,
  AdminGamificationStats,
  AdminGamificationListParams,
  CreateBadgeData,
  UpdateBadgeData,
  CreateMissionData,
  UpdateMissionData,
  CreateMysteryBoxData,
  UpdateMysteryBoxData,
  GrantPointsData,
  AdminNotification,
  AdminNotificationStats,
  AdminNotificationListParams,
  CreateNotificationData,
  BulkNotificationData,
  // Phase 5
  AdminSetting,
  UpsertSettingData,
  ChangeUserRoleData,
  // Phase 3 Leaderboard
  LeaderboardConfig,
  MonthlyLeaderboardEntry,
  DistributeRewardsResponse,
} from './types';

// ============================================
// HELPERS
// ============================================

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// ============================================
// DASHBOARD
// ============================================

/**
 * GET /api/admin/dashboard
 * Statistiques globales du tableau de bord
 */
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const res = await apiGet('/api/admin/dashboard');
  const json = await parseResponse<{ success: boolean; data: AdminDashboardStats }>(res);
  return json.data;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/admin/analytics
 * Vue d'ensemble analytics (stats + charts + top products + customers)
 */
export async function getAnalyticsOverview(query?: AnalyticsQuery): Promise<AnalyticsOverview> {
  const qs = buildQueryString({
    period: query?.period,
    startDate: query?.startDate,
    endDate: query?.endDate,
  });
  const res = await apiGet(`/api/admin/analytics${qs}`);
  const json = await parseResponse<{ success: boolean; data: AnalyticsOverview }>(res);
  return json.data;
}

/**
 * GET /api/admin/analytics/revenue
 * Données du graphique de revenus
 */
export async function getRevenueChart(query?: AnalyticsQuery): Promise<RevenueChartData[]> {
  const qs = buildQueryString({
    period: query?.period,
    startDate: query?.startDate,
    endDate: query?.endDate,
  });
  const res = await apiGet(`/api/admin/analytics/revenue${qs}`);
  const json = await parseResponse<{ success: boolean; data: RevenueChartData[] }>(res);
  return json.data;
}

/**
 * GET /api/admin/analytics/top-products
 * Top produits vendus
 */
export async function getTopProducts(
  limit?: number,
  startDate?: string,
  endDate?: string
): Promise<AdminTopProduct[]> {
  const qs = buildQueryString({
    limit: limit !== undefined ? String(limit) : undefined,
    startDate,
    endDate,
  });
  const res = await apiGet(`/api/admin/analytics/top-products${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminTopProduct[] }>(res);
  return json.data;
}

/**
 * GET /api/admin/analytics/top-customers
 * Top clients
 */
export async function getTopCustomers(
  limit?: number,
  startDate?: string,
  endDate?: string
): Promise<AdminTopCustomer[]> {
  const qs = buildQueryString({
    limit: limit !== undefined ? String(limit) : undefined,
    startDate,
    endDate,
  });
  const res = await apiGet(`/api/admin/analytics/top-customers${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminTopCustomer[] }>(res);
  return json.data;
}

// ============================================
// RECENT ORDERS (pour le dashboard)
// ============================================

/**
 * GET /api/admin/orders
 * Liste paginée des commandes (admin)
 * Réponse backend: { success, data: AdminOrderDetail[], meta: {...} }
 */
export async function getAdminOrders(
  params: AdminOrderListParams = {}
): Promise<PaginatedResponse<AdminOrderDetail>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    status: params.status,
    paymentStatus: params.paymentStatus,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    userId: params.userId,
    sortBy: params.sortBy,
  });
  const res = await apiGet(`/api/admin/orders${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminOrderDetail[]; meta: PaginatedResponse<AdminOrderDetail>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * GET /api/admin/orders/:id
 * Détail d'une commande (admin)
 */
export async function getAdminOrder(id: string): Promise<AdminOrderDetail> {
  const res = await apiGet(`/api/admin/orders/${id}`);
  const json = await parseResponse<{ success: boolean; data: AdminOrderDetail }>(res);
  return json.data;
}

/**
 * PATCH /api/admin/orders/:id/status
 * Changer le statut d'une commande
 */
export async function updateOrderStatus(
  id: string,
  data: UpdateOrderStatusData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/orders/${id}/status`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN PRODUCTS
// ============================================

/**
 * GET /api/admin/products
 * Liste paginée des produits (admin)
 */
export async function getAdminProducts(
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<AdminProduct>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    pageSize: params.pageSize !== undefined ? String(params.pageSize) : undefined,
    category: params.category,
    search: params.search,
    status: params.status,
    minPrice: params.minPrice !== undefined ? String(params.minPrice) : undefined,
    maxPrice: params.maxPrice !== undefined ? String(params.maxPrice) : undefined,
    isOnSale: params.isOnSale !== undefined ? String(params.isOnSale) : undefined,
    isNew: params.isNew !== undefined ? String(params.isNew) : undefined,
    isBestSeller: params.isBestSeller !== undefined ? String(params.isBestSeller) : undefined,
    sortBy: params.sortBy,
  });
  const res = await apiGet(`/api/admin/products${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminProduct[]; meta: PaginatedResponse<AdminProduct>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * GET /api/admin/products/:id
 * Détail d'un produit (admin)
 */
export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await apiGet(`/api/admin/products/${id}`);
  const json = await parseResponse<{ success: boolean; data: AdminProduct }>(res);
  return json.data;
}

/**
 * Build a FormData payload from product data + optional image files.
 * Non-object values are appended as strings; arrays and objects as JSON strings.
 * @param imageFile   - primary image (field "image")
 * @param secondaryFiles - secondary carousel images (field "images")
 * @param removeImages   - URLs of secondary images to remove (serialised as JSON string)
 */
function buildProductFormData<T extends object>(
  data: T,
  imageFile?: File,
  secondaryFiles?: File[],
  removeImages?: string[],
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(data) as Array<[string, unknown]>) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) continue; // handled separately
    if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  }
  if (imageFile) {
    form.append('image', imageFile, imageFile.name);
  }
  for (const f of secondaryFiles ?? []) {
    form.append('images', f, f.name);
  }
  if (removeImages?.length) {
    form.append('removeImages', JSON.stringify(removeImages));
  }
  return form;
}

/**
 * POST /api/admin/products
 * Créer un produit (multipart/form-data)
 */
export async function createProduct(
  data: CreateProductData,
  imageFile: File,
  secondaryFiles?: File[],
): Promise<AdminProduct> {
  const form = buildProductFormData(data, imageFile, secondaryFiles);
  const res = await apiPostFormData('/api/admin/products', form);
  const json = await parseResponse<{ success: boolean; data: AdminProduct }>(res);
  return json.data;
}

/**
 * PUT /api/admin/products/:id
 * Modifier un produit (multipart/form-data, image optionnelle)
 */
export async function updateProduct(
  id: string,
  data: UpdateProductData,
  imageFile?: File,
  secondaryFiles?: File[],
  removeImages?: string[],
): Promise<AdminProduct> {
  const form = buildProductFormData(data, imageFile, secondaryFiles, removeImages);
  const res = await apiPutFormData(`/api/admin/products/${id}`, form);
  const json = await parseResponse<{ success: boolean; data: AdminProduct }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/products/:id
 * Supprimer un produit
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/products/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * PATCH /api/admin/products/:id/status
 * Changer le statut d'un produit
 */
export async function changeProductStatus(
  id: string,
  status: AdminProduct['status']
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/products/${id}/status`, { status });
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * PATCH /api/admin/products/:id/stock
 * Mettre à jour le stock d'un produit
 */
export async function updateProductStock(
  id: string,
  data: UpdateStockData
): Promise<{ success: boolean; newStock: number }> {
  const res = await apiPatch(`/api/admin/products/${id}/stock`, data);
  return parseResponse<{ success: boolean; newStock: number }>(res);
}

/**
 * PATCH /api/admin/orders/:id/phone-confirmation
 * Mettre à jour la confirmation téléphonique
 */
export async function updatePhoneConfirmation(
  id: string,
  data: UpdatePhoneConfirmationData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/orders/${id}/phone-confirmation`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN USERS / CUSTOMERS
// ============================================

/**
 * GET /api/admin/users
 * Liste paginée des clients (admin)
 */
export async function getAdminUsers(
  params: AdminUserListParams = {}
): Promise<PaginatedResponse<AdminCustomer>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    search: params.search,
    status: params.status,
    role: params.role,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
  const res = await apiGet(`/api/admin/users${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminCustomer[]; meta: PaginatedResponse<AdminCustomer>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * GET /api/admin/users/:id
 * Détail d'un client (admin)
 */
export async function getAdminUser(id: string): Promise<AdminCustomerDetails> {
  const res = await apiGet(`/api/admin/users/${id}`);
  const json = await parseResponse<{ success: boolean; data: AdminCustomerDetails }>(res);
  return json.data;
}

/**
 * PATCH /api/admin/users/:id/status
 * Changer le statut d'un client
 */
export async function changeUserStatus(
  id: string,
  data: ChangeUserStatusData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/users/${id}/status`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * GET /api/admin/users/export
 * Exporter les clients en CSV
 */
export async function exportCustomersCSV(params?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Blob> {
  const qs = buildQueryString({
    status: params?.status,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });
  const res = await apiGet(`/api/admin/users/export${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

/**
 * PATCH /api/admin/users/:id/order-trust
 * Mettre à jour le statut de confiance commande d'un client
 */
export async function updateCustomerOrderTrust(
  id: string,
  data: UpdateCustomerOrderTrustData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/users/${id}/order-trust`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN REVIEWS (Phase 3)
// ============================================

/**
 * GET /api/admin/reviews/stats
 * Statistiques des avis (counts par statut)
 */
export async function getAdminReviewStats(): Promise<AdminReviewStats> {
  const res = await apiGet('/api/admin/reviews/stats');
  const json = await parseResponse<{ success: boolean; data: AdminReviewStats }>(res);
  return json.data;
}

/**
 * GET /api/admin/reviews
 * Liste paginée des avis (admin)
 * Réponse backend: { data: AdminReview[], meta: {...} }
 */
export async function getAdminReviews(
  params: AdminReviewListParams = {}
): Promise<PaginatedResponse<AdminReview>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    status: params.status,
    productId: params.productId,
    userId: params.userId,
    rating: params.rating !== undefined ? String(params.rating) : undefined,
    search: params.search,
    sortBy: params.sortBy,
  });
  const res = await apiGet(`/api/admin/reviews${qs}`);
  const json = await parseResponse<{ data: AdminReview[]; meta: PaginatedResponse<AdminReview>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * PATCH /api/admin/reviews/:id/status
 * Approuver ou rejeter un avis
 */
export async function updateReviewStatus(
  id: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/reviews/${id}/status`, { status });
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis (admin)
 */
export async function deleteAdminReview(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/reviews/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN PROMO CODES (Phase 3)
// ============================================

/**
 * GET /api/admin/promo-codes
 * Liste des codes promo (admin)
 * Réponse backend: { success, data: AdminPromoCode[], meta: {...} }
 */
export async function getAdminPromoCodes(
  params: AdminPromoCodeListParams = {}
): Promise<PaginatedResponse<AdminPromoCode>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    status: params.status,
    type: params.type,
    search: params.search,
  });
  const res = await apiGet(`/api/admin/promo-codes${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminPromoCode[]; meta: PaginatedResponse<AdminPromoCode>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * POST /api/admin/promo-codes
 * Créer un code promo
 */
export async function createAdminPromoCode(
  data: CreatePromoCodeData
): Promise<AdminPromoCode> {
  const res = await apiPost('/api/admin/promo-codes', data);
  const json = await parseResponse<{ success: boolean; data: AdminPromoCode }>(res);
  return json.data;
}

/**
 * PUT /api/admin/promo-codes/:id
 * Modifier un code promo
 */
export async function updateAdminPromoCode(
  id: string,
  data: UpdatePromoCodeData
): Promise<AdminPromoCode> {
  const res = await apiPut(`/api/admin/promo-codes/${id}`, data);
  const json = await parseResponse<{ success: boolean; data: AdminPromoCode }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/promo-codes/:id
 * Supprimer un code promo
 */
export async function deleteAdminPromoCode(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/promo-codes/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * PATCH /api/admin/promo-codes/:id/status
 * Activer / désactiver un code promo
 */
export async function changeAdminPromoCodeStatus(
  id: string,
  data: ChangePromoCodeStatusData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/promo-codes/${id}/status`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN SUBSCRIPTIONS (Phase 4)
// ============================================

/**
 * GET /api/admin/subscriptions
 * Liste paginée des abonnements (admin)
 */
export async function getAdminSubscriptions(
  params: AdminSubscriptionListParams = {}
): Promise<PaginatedResponse<AdminSubscription>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    status: params.status,
    planId: params.planId,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const res = await apiGet(`/api/admin/subscriptions${qs}`);
  const json = await parseResponse<{
    success: boolean;
    data: AdminSubscription[];
    meta?: PaginatedResponse<AdminSubscription>["meta"];
    pagination?: PaginatedResponse<AdminSubscription>["meta"];
  }>(res);

  const meta = json.meta ?? json.pagination;
  if (!meta) {
    throw new Error("Réponse de pagination invalide pour les abonnements");
  }

  return { data: json.data, meta };
}

/**
 * GET /api/admin/subscriptions/stats
 * Statistiques des abonnements
 */
export async function getAdminSubscriptionStats(): Promise<AdminSubscriptionStats> {
  const res = await apiGet('/api/admin/subscriptions/stats');
  const json = await parseResponse<{ success: boolean; data: AdminSubscriptionStats }>(res);
  return json.data;
}

/**
 * GET /api/admin/subscriptions/:id
 * Détail d'un abonnement
 */
export async function getAdminSubscription(id: string): Promise<AdminSubscription> {
  const res = await apiGet(`/api/admin/subscriptions/${id}`);
  const json = await parseResponse<{ success: boolean; data: AdminSubscription }>(res);
  return json.data;
}

/**
 * POST /api/admin/subscriptions/:id/action
 * Action admin sur un abonnement (pause/resume/cancel)
 */
export async function adminSubscriptionAction(
  id: string,
  data: AdminSubscriptionActionData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPost(`/api/admin/subscriptions/${id}/action`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * GET /api/admin/subscriptions/plans
 * Liste tous les plans d'abonnement
 */
export async function getAdminSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
  const res = await apiGet('/api/admin/subscriptions/plans');
  const json = await parseResponse<{
    success: boolean;
    data?: AdminSubscriptionPlan[];
    plans?: AdminSubscriptionPlan[];
  }>(res);
  return json.data ?? json.plans ?? [];
}

/**
 * POST /api/admin/subscriptions/plans
 * Créer un plan d'abonnement
 */
export async function createSubscriptionPlan(data: CreatePlanData): Promise<AdminSubscriptionPlan> {
  const res = await apiPost('/api/admin/subscriptions/plans', data);
  const json = await parseResponse<{ success: boolean; data: AdminSubscriptionPlan }>(res);
  return json.data;
}

/**
 * PUT /api/admin/subscriptions/plans/:id
 * Modifier un plan d'abonnement
 */
export async function updateSubscriptionPlan(id: string, data: UpdatePlanData): Promise<AdminSubscriptionPlan> {
  const res = await apiPut(`/api/admin/subscriptions/plans/${id}`, data);
  const json = await parseResponse<{ success: boolean; data: AdminSubscriptionPlan }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/subscriptions/plans/:id
 * Supprimer un plan d'abonnement
 */
export async function deleteSubscriptionPlan(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/subscriptions/plans/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * PATCH /api/admin/subscriptions/plans/:id/status
 * Activer/Désactiver un plan d'abonnement
 */
export async function changeSubscriptionPlanStatus(
  id: string,
  data: ChangePlanStatusData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/subscriptions/plans/${id}/status`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN GAMIFICATION (Phase 4)
// ============================================

// --- Badges ---

/**
 * GET /api/admin/gamification/badges
 * Liste des badges (admin)
 */
export async function getAdminBadges(
  params: AdminGamificationListParams = {}
): Promise<PaginatedResponse<AdminBadge>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    search: params.search,
    status: params.status,
  });
  const res = await apiGet(`/api/admin/gamification/badges${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminBadge[]; meta: PaginatedResponse<AdminBadge>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * POST /api/admin/gamification/badges
 * Créer un badge
 */
export async function createAdminBadge(data: CreateBadgeData): Promise<AdminBadge> {
  const res = await apiPost('/api/admin/gamification/badges', data);
  const json = await parseResponse<{ success: boolean; data: AdminBadge }>(res);
  return json.data;
}

/**
 * PUT /api/admin/gamification/badges/:id
 * Modifier un badge
 */
export async function updateAdminBadge(id: string, data: UpdateBadgeData): Promise<AdminBadge> {
  const res = await apiPut(`/api/admin/gamification/badges/${id}`, data);
  const json = await parseResponse<{ success: boolean; data: AdminBadge }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/gamification/badges/:id
 * Supprimer un badge
 */
export async function deleteAdminBadge(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/gamification/badges/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// --- Missions ---

/**
 * GET /api/admin/gamification/missions
 * Liste des missions (admin)
 */
export async function getAdminMissions(
  params: AdminGamificationListParams = {}
): Promise<PaginatedResponse<AdminMission>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    search: params.search,
    status: params.status,
    type: params.type,
  });
  const res = await apiGet(`/api/admin/gamification/missions${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminMission[]; meta: PaginatedResponse<AdminMission>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * POST /api/admin/gamification/missions
 * Créer une mission
 */
export async function createAdminMission(data: CreateMissionData): Promise<AdminMission> {
  const res = await apiPost('/api/admin/gamification/missions', data);
  const json = await parseResponse<{ success: boolean; data: AdminMission }>(res);
  return json.data;
}

/**
 * PUT /api/admin/gamification/missions/:id
 * Modifier une mission
 */
export async function updateAdminMission(id: string, data: UpdateMissionData): Promise<AdminMission> {
  const res = await apiPut(`/api/admin/gamification/missions/${id}`, data);
  const json = await parseResponse<{ success: boolean; data: AdminMission }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/gamification/missions/:id
 * Supprimer une mission
 */
export async function deleteAdminMission(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/gamification/missions/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// --- Mystery Boxes ---

/**
 * GET /api/admin/gamification/mystery-boxes
 * Liste des coffres mystères (admin)
 */
export async function getAdminMysteryBoxes(
  params: AdminGamificationListParams = {}
): Promise<PaginatedResponse<AdminMysteryBox>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    search: params.search,
    status: params.status,
  });
  const res = await apiGet(`/api/admin/gamification/mystery-boxes${qs}`);
  const json = await parseResponse<{ success: boolean; data: AdminMysteryBox[]; meta: PaginatedResponse<AdminMysteryBox>['meta'] }>(res);
  return { data: json.data, meta: json.meta };
}

/**
 * POST /api/admin/gamification/mystery-boxes
 * Créer un coffre mystère
 */
export async function createAdminMysteryBox(data: CreateMysteryBoxData): Promise<AdminMysteryBox> {
  const res = await apiPost('/api/admin/gamification/mystery-boxes', data);
  const json = await parseResponse<{ success: boolean; data: AdminMysteryBox }>(res);
  return json.data;
}

/**
 * PUT /api/admin/gamification/mystery-boxes/:id
 * Modifier un coffre mystère
 */
export async function updateAdminMysteryBox(id: string, data: UpdateMysteryBoxData): Promise<AdminMysteryBox> {
  const res = await apiPut(`/api/admin/gamification/mystery-boxes/${id}`, data);
  const json = await parseResponse<{ success: boolean; data: AdminMysteryBox }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/gamification/mystery-boxes/:id
 * Supprimer un coffre mystère
 */
export async function deleteAdminMysteryBox(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/gamification/mystery-boxes/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// --- Points & Stats ---

/**
 * POST /api/admin/gamification/points/grant
 * Attribuer des points manuellement
 */
export async function grantPoints(data: GrantPointsData): Promise<{ success: boolean; message: string }> {
  const res = await apiPost('/api/admin/gamification/points/grant', data);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * GET /api/admin/gamification/stats
 * Statistiques gamification globales
 */
export async function getAdminGamificationStats(): Promise<AdminGamificationStats> {
  const res = await apiGet('/api/admin/gamification/stats');
  const json = await parseResponse<{ success: boolean; data: AdminGamificationStats }>(res);
  return json.data;
}

// --- Leaderboard Config & Distribution ---

/**
 * GET /api/admin/gamification/leaderboard-configs
 * Liste des configurations de récompenses de classement
 */
export async function getLeaderboardConfigs(): Promise<LeaderboardConfig[]> {
  const res = await apiGet('/api/admin/gamification/leaderboard-configs');
  const json = await parseResponse<{ success: boolean; data: LeaderboardConfig[] }>(res);
  return json.data;
}

/**
 * PUT /api/admin/gamification/leaderboard-configs/:rank
 * Créer ou mettre à jour une config de récompense pour un rang
 */
export async function upsertLeaderboardConfig(
  rank: number,
  data: Partial<LeaderboardConfig>
): Promise<LeaderboardConfig> {
  const res = await apiPut(`/api/admin/gamification/leaderboard-configs/${rank}`, data);
  const json = await parseResponse<{ success: boolean; data: LeaderboardConfig }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/gamification/leaderboard-configs/:rank
 * Supprimer une config de récompense
 */
export async function deleteLeaderboardConfig(rank: number): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/gamification/leaderboard-configs/${rank}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

/**
 * GET /api/admin/gamification/leaderboard/monthly
 * Classement mensuel (admin)
 */
export async function getMonthlyLeaderboardAdmin(
  year?: number,
  month?: number,
  limit?: number
): Promise<MonthlyLeaderboardEntry[]> {
  const qs = buildQueryString({
    year: year !== undefined ? String(year) : undefined,
    month: month !== undefined ? String(month) : undefined,
    limit: limit !== undefined ? String(limit) : undefined,
  });
  const res = await apiGet(`/api/admin/gamification/leaderboard/monthly${qs}`);
  const json = await parseResponse<{ success: boolean; data: MonthlyLeaderboardEntry[] }>(res);
  return json.data;
}

/**
 * POST /api/admin/gamification/leaderboard/distribute-rewards
 * Distribuer les récompenses du classement mensuel
 */
export async function distributeMonthlyRewards(
  year?: number,
  month?: number
): Promise<DistributeRewardsResponse> {
  const res = await apiPost('/api/admin/gamification/leaderboard/distribute-rewards', { year, month });
  const json = await parseResponse<{ success: boolean; data: DistributeRewardsResponse }>(res);
  return json.data;
}

// ============================================
// ADMIN NOTIFICATIONS (Phase 4)
// ============================================

/**
 * GET /api/admin/notifications
 * Liste toutes les notifications (admin)
 */
export async function getAdminNotifications(
  params: AdminNotificationListParams = {}
): Promise<PaginatedResponse<AdminNotification>> {
  const qs = buildQueryString({
    page: params.page !== undefined ? String(params.page) : undefined,
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    type: params.type,
    read: params.read !== undefined ? String(params.read) : undefined,
  });
  const res = await apiGet(`/api/admin/notifications${qs}`);
  const json = await parseResponse<{
    success: boolean;
    data: AdminNotification[];
    meta?: PaginatedResponse<AdminNotification>["meta"];
    pagination?: PaginatedResponse<AdminNotification>["meta"];
  }>(res);

  // Tolérance : certaines routes legacy renvoient `pagination` au lieu de `meta`
  const meta = json.meta ?? json.pagination;
  if (!meta) {
    throw new Error("Réponse de pagination invalide pour les notifications");
  }

  return { data: json.data, meta };
}

/**
 * GET /api/admin/notifications/stats
 * Statistiques des notifications
 */
export async function getAdminNotificationStats(): Promise<AdminNotificationStats> {
  const res = await apiGet('/api/admin/notifications/stats');
  const json = await parseResponse<{ success: boolean; data: AdminNotificationStats }>(res);
  return json.data;
}

/**
 * POST /api/admin/notifications
 * Créer et envoyer une notification à un utilisateur
 */
export async function createAdminNotification(data: CreateNotificationData): Promise<AdminNotification> {
  const res = await apiPost('/api/admin/notifications', data);
  const json = await parseResponse<{ success: boolean; data: AdminNotification }>(res);
  return json.data;
}

/**
 * POST /api/admin/notifications/bulk
 * Envoyer une notification en masse
 */
export async function sendBulkNotification(data: BulkNotificationData): Promise<{ success: boolean; message: string; count: number }> {
  const res = await apiPost('/api/admin/notifications/bulk', data);
  return parseResponse<{ success: boolean; message: string; count: number }>(res);
}

/**
 * DELETE /api/admin/notifications/:id
 * Supprimer une notification (admin)
 */
export async function deleteAdminNotification(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/notifications/${id}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN SETTINGS (Phase 5)
// ============================================

/**
 * GET /api/admin/settings
 * Liste tous les paramètres de l'app
 */
export async function getAdminSettings(): Promise<AdminSetting[]> {
  const res = await apiGet('/api/admin/settings');
  const json = await parseResponse<{ success: boolean; data: AdminSetting[] }>(res);
  return json.data;
}

/**
 * POST /api/admin/settings
 * Créer ou modifier un paramètre (upsert)
 */
export async function upsertAdminSetting(data: UpsertSettingData): Promise<AdminSetting> {
  const res = await apiPost('/api/admin/settings', data);
  const json = await parseResponse<{ success: boolean; data: AdminSetting }>(res);
  return json.data;
}

/**
 * DELETE /api/admin/settings/:key
 * Supprimer un paramètre
 */
export async function deleteAdminSetting(key: string): Promise<{ success: boolean; message: string }> {
  const res = await apiDelete(`/api/admin/settings/${encodeURIComponent(key)}`);
  return parseResponse<{ success: boolean; message: string }>(res);
}

// ============================================
// ADMIN USERS — ROLE (Phase 5)
// ============================================

/**
 * PATCH /api/admin/users/:id/role
 * Changer le rôle d'un utilisateur
 */
export async function changeUserRole(
  id: string,
  data: ChangeUserRoleData
): Promise<{ success: boolean; message: string }> {
  const res = await apiPatch(`/api/admin/users/${id}/role`, data);
  return parseResponse<{ success: boolean; message: string }>(res);
}
