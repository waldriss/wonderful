// Aligné sur l'enum NotificationType du backend (back-end/prisma/schema.prisma)
export type NotificationType =
  | 'BADGE_UNLOCKED'
  | 'MISSION_COMPLETE'
  | 'STREAK_MILESTONE'
  | 'MYSTERY_BOX'
  | 'REFERRAL_SUCCESS'
  | 'ORDER_UPDATE'
  | 'SUBSCRIPTION_UPDATE'
  | 'PROMO'
  | 'GENERAL';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationsListResponse {
  success: boolean;
  data: Notification[];
  meta: PaginationMeta;
}

export interface UnreadCountResponse {
  success: boolean;
  data: { unreadCount: number };
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  read?: boolean;
}
