import { z } from 'zod';
import { MissionType, MissionStatus, BadgeRarity, BadgeStatus, RewardType } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - Client
// ============================================

export const usePointsSchema = z.object({
  points: z.number().int().positive('Nombre de points invalide'),
  orderId: z.string().cuid('ID de commande invalide').optional(),
});

export const referralSchema = z.object({
  code: z.string().min(4, 'Code trop court').max(20, 'Code trop long'),
});

// ============================================
// SCHEMAS DE VALIDATION - Admin
// ============================================

export const createBadgeSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue'),
  icon: z.string().min(1, 'Icône requise'),
  category: z.string().max(50, 'Catégorie trop longue').optional(),
  rarity: z.nativeEnum(BadgeRarity).default('COMMON'),
  requirementType: z.nativeEnum(MissionType).optional(),
  requirementTarget: z.number().int().min(1).optional(),
  rewardType: z.nativeEnum(RewardType).optional(),
  rewardValue: z.number().int().min(0).optional(),
  status: z.nativeEnum(BadgeStatus).default('ACTIVE'),
});

export const updateBadgeSchema = createBadgeSchema.partial();

export const createMissionSchema = z.object({
  title: z.string().min(2, 'Titre trop court').max(200, 'Titre trop long'),
  description: z.string().max(500, 'Description trop longue'),
  type: z.nativeEnum(MissionType),
  icon: z.string().optional(),
  targetValue: z.number().int().min(1, 'Objectif invalide'),
  rewardType: z.nativeEnum(RewardType),
  /**
   * POINTS: nombre de points
   * DISCOUNT_PERCENTAGE: pourcentage (1–100)
   * DISCOUNT_FIXED: montant en DA
   * FREE_DELIVERY: mettre 0
   */
  rewardValue: z.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.nativeEnum(MissionStatus).default('ACTIVE'),
});

export const updateMissionSchema = createMissionSchema.partial();

export const createMysteryBoxSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  icon: z.string().optional(),
  cost: z.number().int().min(0).default(0),
  rarity: z.nativeEnum(BadgeRarity).default('COMMON'),
  rewards: z
    .array(
      z.object({
        type: z.nativeEnum(RewardType),
        value: z.number().int().min(0),
        probability: z.number().int().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .min(1, 'Au moins une récompense requise'),
});

export const updateMysteryBoxSchema = createMysteryBoxSchema.partial();

export const grantPointsSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur invalide'),
  points: z.number().int().positive('Nombre de points invalide'),
  reason: z.string().min(2, 'Raison requise').max(200, 'Raison trop longue'),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(['all', 'monthly', 'weekly']).default('all'),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const leaderboardConfigSchema = z.object({
  rank: z.number().int().min(1).max(10),
  rewardType: z.nativeEnum(RewardType),
  rewardValue: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const updateLeaderboardConfigSchema = leaderboardConfigSchema.partial().omit({ rank: true });

export const distributeLeaderboardRewardsSchema = z.object({
  year: z.number().int().min(2020).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
});

// ============================================
// TYPES
// ============================================

export type UsePointsInput = z.infer<typeof usePointsSchema>;
export type ReferralInput = z.infer<typeof referralSchema>;
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
export type CreateMysteryBoxInput = z.infer<typeof createMysteryBoxSchema>;
export type UpdateMysteryBoxInput = z.infer<typeof updateMysteryBoxSchema>;
export type GrantPointsInput = z.infer<typeof grantPointsSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type LeaderboardConfigInput = z.infer<typeof leaderboardConfigSchema>;
export type UpdateLeaderboardConfigInput = z.infer<typeof updateLeaderboardConfigSchema>;
export type DistributeLeaderboardRewardsInput = z.infer<typeof distributeLeaderboardRewardsSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface PointsResponse {
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface PointsHistoryItemResponse {
  id: string;
  amount: number;
  type: string;
  reason: string;
  relatedOrderId: string | null;
  createdAt: Date;
}

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string | null;
  rarity: BadgeRarity;
  requirementType: string | null;
  requirementTarget: number | null;
  rewardType: RewardType | null;
  rewardValue: number | null;
  earnedCount: number;
  status: BadgeStatus;
  earnedAt?: Date;
  progress?: number;
}

export interface MissionResponse {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  icon: string | null;
  targetValue: number;
  rewardType: RewardType;
  rewardValue: number;
  startDate: Date | null;
  endDate: Date | null;
  status: MissionStatus;
  completionsCount: number;
  // Pour l'utilisateur connecté
  currentProgress?: number;
  completed?: boolean;
  claimed?: boolean;
  completedAt?: Date | null;
}

export interface MysteryBoxResponse {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  cost: number;
  rarity: BadgeRarity;
  status: string;
  openedCount: number;
  rewards?: {
    type: RewardType;
    value: number;
    probability: number;
    description: string | null;
  }[];
}

export interface MysteryBoxOpenResult {
  rewardType: RewardType;
  rewardValue: number;
  description: string | null;
  pointsSpent: number;
  /** Non-null si la récompense crée un bon utilisable en commande */
  userRewardId: string | null;
}

export interface UserRewardResponse {
  id: string;
  type: RewardType;
  value: number;
  status: string;
  source: string;
  expiresAt: Date | null;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastOrderDate: Date | null;
  active: boolean;
}

export interface LeaderboardEntryResponse {
  rank: number;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  totalPoints: number;
  badgeCount: number;
}

export interface ReferralResponse {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
}

export interface GamificationOverviewResponse {
  points: PointsResponse;
  streak: StreakResponse;
  badgesEarned: number;
  totalBadges: number;
  activeMissions: number;
  completedMissions: number;
  referralCode: string | null;
  pendingRewards: number;
}

export interface GamificationStatsResponse {
  totalPointsAccounts: number;
  totalPointsDistributed: number;
  totalBadgesEarned: number;
  totalMissionsCompleted: number;
  totalReferrals: number;
  mysteryBoxesOpened: number;
}

export interface LeaderboardConfigResponse {
  id: string;
  rank: number;
  rewardType: RewardType;
  rewardValue: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MonthlyLeaderboardEntryResponse {
  rank: number;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  monthlyPoints: number;
  badgeCount: number;
}

export interface DistributeRewardsResult {
  year: number;
  month: number;
  distributedAt: Date;
  winners: {
    rank: number;
    userId: string;
    userName: string | null;
    monthlyPoints: number;
    rewardType: RewardType;
    rewardValue: number;
    userRewardId: string | null;
  }[];
}
