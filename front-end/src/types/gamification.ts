// ============================================
// GAMIFICATION TYPES - WONDERFUL REWARDS
// ============================================

/**
 * Points System - Wondercoins
 * 100 DA = 10 points
 * 1000 points = 100 DA
 * 6000 points = 1 plat gratuit
 */
export interface PointsAccount {
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface PointsTransaction {
  id: string;
  type: "earn" | "spend" | "expire";
  amount: number;
  reason: string;
  date: string;
  relatedOrderId?: string;
}

export interface PointsReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: "discount" | "free_meal" | "free_drink" | "gift";
  value: number; // En DA pour discount, ou quantité pour items
  available: boolean;
  image?: string;
}

/**
 * Badges System
 * Achievement-based rewards
 */
export type BadgeCategory = "nutrition" | "orders" | "exploration" | "health" | "social";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  requirement: string; // Description de l'objectif
  reward: string; // Ce que ça débloque
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface BadgeDefinition {
  // Exemples prédéfinis
  healthyAddict: Badge; // 10 commandes plats équilibrés = -5%
  proteinLover: Badge; // 5 plats protéinés = barre protéinée
  wonderfulExplorer: Badge; // Tous les plats goûtés = boisson offerte
  weightLossChampion: Badge; // -10kg = badge spécial
}

/**
 * Streaks System
 * Consecutive orders rewards
 */
export interface Streak {
  currentStreak: number; // Jours consécutifs
  longestStreak: number;
  lastOrderDate: string;
  active: boolean;
  nextReward: StreakReward | null;
}

export interface StreakReward {
  daysRequired: number;
  rewardType: "discount" | "free_meal" | "bonus_points";
  value: number; // Pourcentage ou montant
  description: string;
  claimed: boolean;
}

/**
 * Personal Statistics
 * User progress tracking
 */
export interface UserStatistics {
  // Nutrition stats
  totalProteinConsumed: number; // En kg
  totalCaloriesConsumed: number;
  caloriesSaved: number; // vs fast food
  
  // Order stats
  totalOrders: number;
  favoriteMeal: {
    name: string;
    orderCount: number;
    image?: string;
  };
  topThreeMeals: Array<{
    name: string;
    orderCount: number;
  }>;
  
  // Time stats
  memberSince: string;
  daysActive: number;
  
  // Health stats
  weightLost?: number; // En kg
  healthGoalProgress?: number; // 0-100
}

/**
 * Referral System
 * Invite friends for rewards
 */
export interface Referral {
  id: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number; // Ceux qui ont commandé
  totalEarned: number; // En DA
  leaderboardRank?: number;
}

export interface ReferredFriend {
  id: string;
  name: string;
  dateReferred: string;
  hasOrdered: boolean;
  rewardEarned: number;
}

export interface ReferralReward {
  friendDiscount: number; // 50 DA
  referrerBonus: number; // 50 DA
  milestones: Array<{
    referralsRequired: number;
    reward: string;
    achieved: boolean;
  }>;
}

/**
 * Weekly Missions
 * Time-limited challenges
 */
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "order" | "social" | "nutrition" | "exploration";
  progress: number; // 0-100
  target: number; // Objectif numérique
  current: number; // Progression actuelle
  reward: MissionReward;
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}

export interface MissionReward {
  type: "points" | "discount" | "free_item";
  value: number;
  description: string;
}

/**
 * Mystery Boxes
 * Random rewards system
 */
export interface MysteryBox {
  id: string;
  receivedAt: string;
  opened: boolean;
  openedAt?: string;
  content?: MysteryBoxContent;
}

export interface MysteryBoxContent {
  type: "free_drink" | "bonus_meal" | "discount_code" | "bonus_points";
  value: number;
  description: string;
  expiresAt?: string;
  shareableCode?: string; // Si c'est un code à partager
}

export interface MysteryBoxChance {
  probability: number; // 1 sur X
  lastReceived?: string;
  totalReceived: number;
}

/**
 * Leaderboards
 * Competitive rankings
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  badge?: string;
}

export interface Leaderboard {
  type: "referrals" | "points" | "streaks" | "orders";
  period: "weekly" | "monthly" | "alltime";
  entries: LeaderboardEntry[];
  userRank?: number;
}

/**
 * Complete Gamification Profile
 */
export interface GamificationProfile {
  points: PointsAccount;
  badges: Badge[];
  streak: Streak;
  statistics: UserStatistics;
  referral: Referral;
  activeMissions: Mission[];
  mysteryBoxes: MysteryBox[];
  recentTransactions: PointsTransaction[];
}

/**
 * Notifications & Achievements
 */
export interface GamificationNotification {
  id: string;
  type: "badge_unlocked" | "mission_complete" | "streak_milestone" | "mystery_box" | "referral_success";
  title: string;
  message: string;
  icon: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
