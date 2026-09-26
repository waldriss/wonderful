import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  changeProductStatus,
  updateProductStock,
  changeUserStatus,
  // Phase 3
  updateOrderStatus,
  updatePhoneConfirmation,
  updateCustomerOrderTrust,
  deleteAdminReview,
  updateReviewStatus,
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
  changeAdminPromoCodeStatus,
  // Phase 4
  adminSubscriptionAction,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  changeSubscriptionPlanStatus,
  createAdminBadge,
  updateAdminBadge,
  deleteAdminBadge,
  createAdminMission,
  updateAdminMission,
  deleteAdminMission,
  createAdminMysteryBox,
  updateAdminMysteryBox,
  deleteAdminMysteryBox,
  grantPoints,
  createAdminNotification,
  sendBulkNotification,
  deleteAdminNotification,
  // Phase 5
  upsertAdminSetting,
  deleteAdminSetting,
  changeUserRole,
  // Phase 3 Leaderboard
  upsertLeaderboardConfig,
  deleteLeaderboardConfig,
  distributeMonthlyRewards,
} from './clientRequests';
import { adminKeys } from './queries';
import type {
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  ProductStatus,
  ChangeUserStatusData,
  // Phase 3
  UpdateOrderStatusData,
  UpdatePhoneConfirmationData,
  UpdateCustomerOrderTrustData,
  CreatePromoCodeData,
  UpdatePromoCodeData,
  ChangePromoCodeStatusData,
  // Phase 4
  AdminSubscriptionActionData,
  CreatePlanData,
  UpdatePlanData,
  ChangePlanStatusData,
  CreateBadgeData,
  UpdateBadgeData,
  CreateMissionData,
  UpdateMissionData,
  CreateMysteryBoxData,
  UpdateMysteryBoxData,
  // Phase 5
  UpsertSettingData,
  ChangeUserRoleData,
  GrantPointsData,
  CreateNotificationData,
  BulkNotificationData,
  // Phase 3 Leaderboard
  LeaderboardConfig,
} from './types';

// ============================================
// PRODUCT MUTATIONS
// ============================================

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, imageFile, secondaryFiles }: { data: CreateProductData; imageFile: File; secondaryFiles?: File[] }) =>
      createProduct(data, imageFile, secondaryFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, imageFile, secondaryFiles, removeImages }: { id: string; data: UpdateProductData; imageFile?: File; secondaryFiles?: File[]; removeImages?: string[] }) =>
      updateProduct(id, data, imageFile, secondaryFiles, removeImages),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() });
      queryClient.invalidateQueries({ queryKey: adminKeys.productDetail(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useChangeProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      changeProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockData }) =>
      updateProductStock(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products() });
      queryClient.invalidateQueries({ queryKey: adminKeys.productDetail(variables.id) });
    },
  });
}

// ============================================
// USER / CUSTOMER MUTATIONS
// ============================================

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeUserStatusData }) =>
      changeUserStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.id) });
    },
  });
}

// ============================================
// ORDERS MUTATIONS (Phase 3)
// ============================================

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusData }) =>
      updateOrderStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.orderDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdatePhoneConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhoneConfirmationData }) =>
      updatePhoneConfirmation(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orderDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateCustomerOrderTrust() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerOrderTrustData }) =>
      updateCustomerOrderTrust(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.id) });
      // Invalider les commandes car le trust status est affiché dessus
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

// ============================================
// REVIEW MUTATIONS (Phase 3)
// ============================================

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reviews() });
      const labels: Record<string, string> = {
        APPROVED: 'Avis approuvé',
        REJECTED: 'Avis rejeté',
        PENDING: 'Avis remis en attente',
      };
      toast.success(labels[variables.status] ?? 'Statut mis à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du changement de statut');
    },
  });
}

export function useDeleteAdminReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reviews() });
      toast.success('Avis supprimé');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });
}

// ============================================
// PROMO CODE MUTATIONS (Phase 3)
// ============================================

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromoCodeData) => createAdminPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.promoCodes() });
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromoCodeData }) =>
      updateAdminPromoCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.promoCodes() });
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminPromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.promoCodes() });
    },
  });
}

export function useTogglePromoCodeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePromoCodeStatusData }) =>
      changeAdminPromoCodeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.promoCodes() });
    },
  });
}

// ============================================
// SUBSCRIPTION MUTATIONS (Phase 4)
// ============================================

export function useAdminSubscriptionAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminSubscriptionActionData }) =>
      adminSubscriptionAction(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanData) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionPlans() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionStats() });
      toast.success('Formule créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Impossible de créer la formule');
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanData }) =>
      updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionPlans() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionStats() });
      toast.success('Formule mise à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Impossible de modifier la formule');
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionPlans() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionStats() });
      toast.success(result.message || 'Formule supprimée');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Impossible de supprimer la formule');
    },
  });
}

export function useChangeSubscriptionPlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePlanStatusData }) =>
      changeSubscriptionPlanStatus(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionPlans() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptionStats() });
      toast.success(
        variables.data.isActive ? 'Formule activée' : 'Formule désactivée'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Impossible de changer le statut de la formule');
    },
  });
}

// ============================================
// GAMIFICATION MUTATIONS (Phase 4)
// ============================================

// --- Badges ---

export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBadgeData) => createAdminBadge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.badges() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

export function useUpdateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBadgeData }) =>
      updateAdminBadge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.badges() });
    },
  });
}

export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminBadge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.badges() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

// --- Missions ---

export function useCreateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMissionData) => createAdminMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.missions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMissionData }) =>
      updateAdminMission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.missions() });
    },
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.missions() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

// --- Mystery Boxes ---

export function useCreateMysteryBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMysteryBoxData) => createAdminMysteryBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mysteryBoxes() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

export function useUpdateMysteryBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMysteryBoxData }) =>
      updateAdminMysteryBox(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mysteryBoxes() });
    },
  });
}

export function useDeleteMysteryBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminMysteryBox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mysteryBoxes() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

// --- Points ---

export function useGrantPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantPointsData) => grantPoints(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
    },
  });
}

// --- Leaderboard ---

export function useUpsertLeaderboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rank, data }: { rank: number; data: Partial<LeaderboardConfig> }) =>
      upsertLeaderboardConfig(rank, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leaderboardConfigs() });
      toast.success('Configuration enregistrée');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });
}

export function useDeleteLeaderboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rank: number) => deleteLeaderboardConfig(rank),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.leaderboardConfigs() });
      toast.success('Configuration supprimée');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

export function useDistributeMonthlyRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year?: number; month?: number }) =>
      distributeMonthlyRewards(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.monthlyLeaderboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gamificationStats() });
      toast.success('Récompenses distribuées avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la distribution');
    },
  });
}

// ============================================
// NOTIFICATION MUTATIONS (Phase 4)
// ============================================

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationData) => createAdminNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationStats() });
    },
  });
}

export function useSendBulkNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkNotificationData) => sendBulkNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationStats() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationStats() });
    },
  });
}

// ============================================
// SETTINGS MUTATIONS (Phase 5)
// ============================================

export function useUpsertSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertSettingData) => upsertAdminSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteAdminSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
    },
  });
}

// ============================================
// USER ROLE MUTATIONS (Phase 5)
// ============================================

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeUserRoleData }) =>
      changeUserRole(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.id) });
    },
  });
}
