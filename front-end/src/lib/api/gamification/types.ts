import type { PaginationMeta } from '../products/types';

// ============================================
// ENUMS (mirror backend Prisma enums)
// ============================================

export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type BadgeStatus = 'ACTIVE' | 'INACTIVE';

/** Types de déclenchement de mission */
export type MissionType = 'ORDER_COUNT' | 'TOTAL_SPENT' | 'REFERRAL_COUNT' | 'STREAK_DAYS';

export type MissionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type PointsTransactionType = 'EARN' | 'SPEND' | 'EXPIRE';

/** Types de récompense gamification */
export type RewardType =
  | 'POINTS'
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FIXED'
  | 'FREE_DELIVERY';

export type UserRewardStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

// ============================================
// POINTS
// ============================================

export interface PointsBalance {
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface PointsTransaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  relatedOrderId: string | null;
  createdAt: string;
}

export interface UsePointsDto {
  points: number;
  orderId?: string;
}

export interface UsePointsResponse {
  success: boolean;
  message: string;
  pointsUsed: number;
  newBalance: PointsBalance;
}

// ============================================
// BADGES
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string | null;
  rarity: BadgeRarity;
  requirementType: MissionType | null;
  requirementTarget: number | null;
  rewardType: RewardType | null;
  rewardValue: number | null;
  earnedCount: number;
  status: BadgeStatus;
  earnedAt?: string;
  progress?: number;
}

// ============================================
// MISSIONS
// ============================================

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  icon: string | null;
  targetValue: number;
  rewardType: RewardType;
  rewardValue: number;
  startDate: string | null;
  endDate: string | null;
  status: MissionStatus;
  completionsCount: number;
  currentProgress?: number;
  completed?: boolean;
  claimed?: boolean;
  completedAt?: string | null;
}

export interface ClaimMissionResponse {
  success: boolean;
  message: string;
  reward: {
    type: RewardType;
    value: number;
  };
  userRewardId: string | null;
}

// ============================================
// USER REWARDS (bons de récompense)
// ============================================

export interface UserReward {
  id: string;
  type: RewardType;
  value: number;
  status: UserRewardStatus;
  source: string;
  expiresAt: string | null;
}

// ============================================
// MYSTERY BOXES
// ============================================

export interface MysteryBoxReward {
  type: RewardType;
  value: number;
  probability: number;
  description: string | null;
}

export interface MysteryBox {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  cost: number;
  rarity: BadgeRarity;
  status: string;
  openedCount: number;
  rewards?: MysteryBoxReward[];
}

export interface BuyMysteryBoxResponse {
  success: boolean;
  message: string;
  userMysteryBoxId: string;
  mysteryBox: MysteryBox;
}

export interface OpenMysteryBoxResponse {
  rewardType: RewardType;
  rewardValue: number;
  description: string | null;
  pointsSpent: number;
  /** Non-null si la récompense crée un bon utilisable en commande */
  userRewardId: string | null;
}

// ============================================
// STREAK
// ============================================

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastOrderDate: string | null;
  active: boolean;
}

// ============================================
// REFERRAL
// ============================================

export interface Referral {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
}

export interface UseReferralResponse {
  success: boolean;
  message: string;
  pointsEarned: number;
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  totalPoints: number;
  badgeCount: number;
}

export interface MonthlyLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  monthlyPoints: number;
  badgeCount: number;
}

export interface LeaderboardRewardConfig {
  id: string;
  rank: number;
  rewardType: RewardType;
  rewardValue: number;
  isActive: boolean;
  createdAt: string;
}

export type LeaderboardPeriod = 'all' | 'monthly' | 'weekly';

export interface LeaderboardParams {
  period?: LeaderboardPeriod;
  limit?: number;
}

// ============================================
// OVERVIEW
// ============================================

export interface GamificationOverview {
  points: PointsBalance;
  streak: Streak;
  badgesEarned: number;
  totalBadges: number;
  activeMissions: number;
  completedMissions: number;
  referralCode: string | null;
  pendingRewards: number;
}

// ============================================
// API RESPONSES (wrapper shapes)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}
