import prisma from '../../lib/prisma';
import { Prisma, PointsTransactionType, MissionStatus, MissionType, BadgeStatus, BadgeRarity, RewardType } from '@prisma/client';
import {
  CreateBadgeInput,
  UpdateBadgeInput,
  CreateMissionInput,
  UpdateMissionInput,
  CreateMysteryBoxInput,
  UpdateMysteryBoxInput,
  ListQuery,
  LeaderboardQuery,
} from './gamification.dto';

/**
 * Repository pour les opérations de base de données de gamification
 */
export class GamificationRepository {
  // ============================================
  // POINTS
  // ============================================

  /**
   * Récupérer le compte de points d'un utilisateur
   */
  async getPointsAccount(userId: string) {
    return prisma.pointsAccount.findUnique({
      where: { userId },
    });
  }

  /**
   * Créer un compte de points pour un utilisateur
   */
  async createPointsAccount(userId: string) {
    return prisma.pointsAccount.create({
      data: { userId },
    });
  }

  /**
   * Récupérer ou créer un compte de points
   */
  async getOrCreatePointsAccount(userId: string) {
    const account = await this.getPointsAccount(userId);
    if (account) return account;
    return this.createPointsAccount(userId);
  }

  /**
   * Ajouter une transaction de points
   */
  async addPointsTransaction(data: {
    accountId: string;
    type: PointsTransactionType;
    amount: number;
    reason: string;
    relatedOrderId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Créer la transaction
      const transaction = await tx.pointsTransaction.create({ data });

      // Mettre à jour le compte
      const updateData: Prisma.PointsAccountUpdateInput = {};
      
      if (data.type === 'EARN') {
        updateData.availablePoints = { increment: data.amount };
        updateData.totalPoints = { increment: data.amount };
        updateData.lifetimeEarned = { increment: data.amount };
      } else if (data.type === 'SPEND') {
        updateData.availablePoints = { decrement: data.amount };
        updateData.lifetimeSpent = { increment: data.amount };
      } else if (data.type === 'EXPIRE') {
        updateData.availablePoints = { decrement: data.amount };
      }

      await tx.pointsAccount.update({
        where: { id: data.accountId },
        data: updateData,
      });

      return transaction;
    });
  }

  /**
   * Historique des points d'un utilisateur
   */
  async getPointsHistory(accountId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointsTransaction.count({ where: { accountId } }),
    ]);

    return { transactions, total, page, limit };
  }

  // ============================================
  // BADGES
  // ============================================

  /**
   * Trouver un badge par ID
   */
  async findBadgeById(id: string) {
    return prisma.badge.findUnique({ where: { id } });
  }

  /**
   * Récupérer tous les badges actifs
   */
  async findActiveBadges() {
    return prisma.badge.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Récupérer tous les badges (admin)
   */
  async findAllBadges(query: ListQuery) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BadgeWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status as BadgeStatus;
    }

    const [badges, total] = await Promise.all([
      prisma.badge.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          _count: { select: { users: true } },
        },
      }),
      prisma.badge.count({ where }),
    ]);

    return { badges, total, page, limit };
  }

  /**
   * Créer un badge
   */
  async createBadge(data: CreateBadgeInput) {
    return prisma.badge.create({ data });
  }

  /**
   * Modifier un badge
   */
  async updateBadge(id: string, data: UpdateBadgeInput) {
    return prisma.badge.update({ where: { id }, data });
  }

  /**
   * Supprimer un badge
   */
  async deleteBadge(id: string) {
    return prisma.badge.delete({ where: { id } });
  }

  /**
   * Badges obtenus par un utilisateur
   */
  async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /**
   * Attribuer un badge à un utilisateur
   */
  async grantBadge(userId: string, badgeId: string) {
    return prisma.$transaction(async (tx) => {
      // Créer le lien user-badge
      const userBadge = await tx.userBadge.create({
        data: { userId, badgeId },
        include: { badge: true },
      });

      // Incrémenter le compteur du badge
      await tx.badge.update({
        where: { id: badgeId },
        data: { earnedCount: { increment: 1 } },
      });

      return userBadge;
    });
  }

  /**
   * Vérifier si un utilisateur a un badge
   */
  async userHasBadge(userId: string, badgeId: string): Promise<boolean> {
    const badge = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    return !!badge;
  }

  // ============================================
  // MISSIONS
  // ============================================

  /**
   * Trouver une mission par ID
   */
  async findMissionById(id: string) {
    return prisma.mission.findUnique({ where: { id } });
  }

  /**
   * Récupérer les missions actives
   */
  async findActiveMissions() {
    return prisma.mission.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Récupérer toutes les missions (admin)
   */
  async findAllMissions(query: ListQuery) {
    const { page, limit, search, status, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MissionWhereInput = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status as MissionStatus;
    }
    if (type) {
      where.type = type as any;
    }

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { users: true } },
        },
      }),
      prisma.mission.count({ where }),
    ]);

    return { missions, total, page, limit };
  }

  /**
   * Créer une mission
   */
  async createMission(data: CreateMissionInput) {
    return prisma.mission.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        icon: data.icon,
        targetValue: data.targetValue,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
      },
    });
  }

  /**
   * Modifier une mission
   */
  async updateMission(id: string, data: UpdateMissionInput) {
    return prisma.mission.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  /**
   * Supprimer une mission
   */
  async deleteMission(id: string) {
    return prisma.mission.delete({ where: { id } });
  }

  /**
   * Missions d'un utilisateur avec progression
   */
  async getUserMissions(userId: string) {
    return prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { mission: { startDate: 'desc' } },
    });
  }

  /**
   * Récupérer ou créer une mission utilisateur
   */
  async getOrCreateUserMission(userId: string, missionId: string) {
    const existing = await prisma.userMission.findUnique({
      where: { userId_missionId: { userId, missionId } },
      include: { mission: true },
    });

    if (existing) return existing;

    return prisma.userMission.create({
      data: { userId, missionId },
      include: { mission: true },
    });
  }

  /**
   * Mettre à jour la progression d'une mission
   */
  async updateMissionProgress(userId: string, missionId: string, progress: number) {
    return prisma.userMission.update({
      where: { userId_missionId: { userId, missionId } },
      data: { progress },
      include: { mission: true },
    });
  }

  /**
   * Marquer une mission comme complétée
   */
  async completeMission(userId: string, missionId: string) {
    return prisma.$transaction(async (tx) => {
      const userMission = await tx.userMission.update({
        where: { userId_missionId: { userId, missionId } },
        data: {
          completed: true,
          completedAt: new Date(),
        },
        include: { mission: true },
      });

      // Incrémenter le compteur de complétion
      await tx.mission.update({
        where: { id: missionId },
        data: { completionsCount: { increment: 1 } },
      });

      return userMission;
    });
  }

  /**
   * Réclamer la récompense d'une mission
   */
  async claimMissionReward(userId: string, missionId: string) {
    return prisma.userMission.update({
      where: { userId_missionId: { userId, missionId } },
      data: { claimed: true },
      include: { mission: true },
    });
  }

  // ============================================
  // MYSTERY BOXES
  // ============================================

  /**
   * Trouver une mystery box par ID
   */
  async findMysteryBoxById(id: string) {
    return prisma.mysteryBox.findUnique({
      where: { id },
      include: { possibleRewards: true },
    });
  }

  /**
   * Récupérer les mystery boxes actives
   */
  async findActiveMysteryBoxes() {
    return prisma.mysteryBox.findMany({
      where: { status: 'ACTIVE' },
      include: { possibleRewards: true },
      orderBy: { cost: 'asc' },
    });
  }

  /**
   * Récupérer toutes les mystery boxes (admin)
   */
  async findAllMysteryBoxes(query: ListQuery) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MysteryBoxWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status as any;
    }

    const [boxes, total] = await Promise.all([
      prisma.mysteryBox.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: { possibleRewards: true },
      }),
      prisma.mysteryBox.count({ where }),
    ]);

    return { boxes, total, page, limit };
  }

  /**
   * Créer une mystery box
   */
  async createMysteryBox(data: CreateMysteryBoxInput) {
    return prisma.mysteryBox.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        cost: data.cost,
        rarity: data.rarity,
        possibleRewards: {
          create: data.rewards,
        },
      },
      include: { possibleRewards: true },
    });
  }

  /**
   * Modifier une mystery box
   */
  async updateMysteryBox(id: string, data: UpdateMysteryBoxInput) {
    // Si rewards est fourni, supprimer les anciennes et créer les nouvelles
    if (data.rewards) {
      await prisma.mysteryBoxReward.deleteMany({ where: { mysteryBoxId: id } });
    }

    return prisma.mysteryBox.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        cost: data.cost,
        rarity: data.rarity,
        ...(data.rewards && {
          possibleRewards: {
            create: data.rewards,
          },
        }),
      },
      include: { possibleRewards: true },
    });
  }

  /**
   * Supprimer une mystery box
   */
  async deleteMysteryBox(id: string) {
    return prisma.mysteryBox.delete({ where: { id } });
  }

  /**
   * Attribuer une mystery box à un utilisateur
   */
  async grantMysteryBox(userId: string, mysteryBoxId: string) {
    return prisma.userMysteryBox.create({
      data: { userId, mysteryBoxId },
      include: { mysteryBox: { include: { possibleRewards: true } } },
    });
  }

  /**
   * Mystery boxes d'un utilisateur
   */
  async getUserMysteryBoxes(userId: string) {
    return prisma.userMysteryBox.findMany({
      where: { userId, opened: false },
      include: { mysteryBox: true },
      orderBy: { receivedAt: 'desc' },
    });
  }

  /**
   * Ouvrir une mystery box
   */
  async openMysteryBox(
    userMysteryBoxId: string,
    rewardType: RewardType,
    rewardValue: number,
    expiresAt?: Date
  ) {
    return prisma.$transaction(async (tx) => {
      const userBox = await tx.userMysteryBox.update({
        where: { id: userMysteryBoxId },
        data: {
          opened: true,
          openedAt: new Date(),
          rewardType,
          rewardValue,
          expiresAt,
        },
        include: { mysteryBox: true },
      });

      // Incrémenter le compteur d'ouverture
      await tx.mysteryBox.update({
        where: { id: userBox.mysteryBoxId },
        data: { openedCount: { increment: 1 } },
      });

      return userBox;
    });
  }

  // ============================================
  // STREAKS
  // ============================================

  /**
   * Récupérer le streak d'un utilisateur
   */
  async getStreak(userId: string) {
    return prisma.streak.findUnique({ where: { userId } });
  }

  /**
   * Créer ou mettre à jour le streak
   */
  async updateStreak(userId: string, data: { currentStreak: number; lastOrderDate: Date }) {
    return prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: data.currentStreak,
        longestStreak: data.currentStreak,
        lastOrderDate: data.lastOrderDate,
      },
      update: {
        currentStreak: data.currentStreak,
        longestStreak: { increment: 0 }, // Will be handled below
        lastOrderDate: data.lastOrderDate,
      },
    });
  }

  // ============================================
  // REFERRALS
  // ============================================

  /**
   * Récupérer le parrainage d'un utilisateur
   */
  async getReferral(userId: string) {
    return prisma.referral.findUnique({
      where: { referrerId: userId },
      include: {
        referredUsers: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Créer un code de parrainage
   */
  async createReferral(userId: string, code: string) {
    return prisma.referral.create({
      data: {
        referrerId: userId,
        code,
      },
    });
  }

  /**
   * Trouver un parrainage par code
   */
  async findReferralByCode(code: string) {
    return prisma.referral.findUnique({
      where: { code },
      include: { referrer: true },
    });
  }

  /**
   * Incrémenter le compteur de parrainages
   */
  async incrementReferralCount(referralId: string, successful: boolean, earnedPoints: number) {
    return prisma.referral.update({
      where: { id: referralId },
      data: {
        totalReferrals: { increment: 1 },
        ...(successful && {
          successfulReferrals: { increment: 1 },
          totalEarned: { increment: earnedPoints },
        }),
      },
    });
  }

  // ============================================
  // STATS
  // ============================================

  /**
   * Statistiques globales de gamification
   */
  async getGlobalStats() {
    const [
      totalPointsAccounts,
      totalBadgesEarned,
      totalMissionsCompleted,
      totalReferrals,
      mysteryBoxesOpened,
    ] = await Promise.all([
      prisma.pointsAccount.count(),
      prisma.userBadge.count(),
      prisma.userMission.count({ where: { completed: true } }),
      prisma.referral.aggregate({ _sum: { successfulReferrals: true } }),
      prisma.userMysteryBox.count({ where: { opened: true } }),
    ]);

    // Calculer le total des points distribués
    const pointsStats = await prisma.pointsAccount.aggregate({
      _sum: { lifetimeEarned: true },
    });

    return {
      totalPointsAccounts,
      totalPointsDistributed: pointsStats._sum.lifetimeEarned || 0,
      totalBadgesEarned,
      totalMissionsCompleted,
      totalReferrals: totalReferrals._sum.successfulReferrals || 0,
      mysteryBoxesOpened,
    };
  }

  /**
   * Leaderboard des points
   */
  async getLeaderboard(query: LeaderboardQuery) {
    const { period, limit } = query;

    // Pour simplifier, on utilise le total des points
    // Un système plus avancé filtrerait par période
    const accounts = await prisma.pointsAccount.findMany({
      take: limit,
      orderBy: { totalPoints: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Récupérer le nombre de badges pour chaque utilisateur
    const userIds = accounts.map((a) => a.userId);
    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: true,
    });

    const badgeCountMap = new Map(badgeCounts.map((bc) => [bc.userId, bc._count]));

    return accounts.map((account, index) => ({
      rank: index + 1,
      userId: account.userId,
      userName: account.user.name,
      userAvatar: account.user.image,
      totalPoints: account.totalPoints,
      badgeCount: badgeCountMap.get(account.userId) || 0,
    }));
  }

  /**
   * Leaderboard mensuel basé sur les points gagnés (EARN) dans le mois
   */
  async getMonthlyLeaderboard(year: number, month: number, limit: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    // Récupérer les comptes ayant gagné des points ce mois-ci
    const accounts = await prisma.pointsAccount.findMany({
      where: {
        transactions: {
          some: {
            type: 'EARN',
            createdAt: { gte: startOfMonth, lt: endOfMonth },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        transactions: {
          where: {
            type: 'EARN',
            createdAt: { gte: startOfMonth, lt: endOfMonth },
          },
          select: { amount: true },
        },
      },
    });

    // Calculer la somme mensuelle par utilisateur et trier
    const ranked = accounts
      .map((account) => ({
        userId: account.userId,
        userName: account.user.name,
        userAvatar: account.user.image,
        monthlyPoints: account.transactions.reduce((sum, t) => sum + t.amount, 0),
      }))
      .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
      .slice(0, limit);

    // Récupérer le nombre de badges pour chaque utilisateur classé
    const userIds = ranked.map((r) => r.userId);
    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: true,
    });

    const badgeCountMap = new Map(badgeCounts.map((bc) => [bc.userId, bc._count]));

    return ranked.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      userName: entry.userName,
      userAvatar: entry.userAvatar,
      monthlyPoints: entry.monthlyPoints,
      badgeCount: badgeCountMap.get(entry.userId) || 0,
    }));
  }

  // ============================================
  // USER REWARDS (bons de réduction / avantages)
  // ============================================

  /**
   * Créer un bon de récompense pour un utilisateur
   * Utilisé pour DISCOUNT_PERCENTAGE, DISCOUNT_FIXED, FREE_DELIVERY (pas POINTS)
   */
  async createUserReward(data: {
    userId: string;
    type: RewardType;
    value: number;
    source: string;
    expiresAt?: Date;
  }) {
    return prisma.userReward.create({ data });
  }

  /**
   * Récupérer les bons disponibles d'un utilisateur
   */
  async getUserRewards(userId: string) {
    const now = new Date();
    return prisma.userReward.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  /**
   * Trouver un bon par ID
   */
  async findUserRewardById(id: string) {
    return prisma.userReward.findUnique({ where: { id } });
  }

  /**
   * Marquer un bon comme utilisé (lors d'une commande)
   */
  async markUserRewardUsed(id: string) {
    return prisma.userReward.update({
      where: { id },
      data: { status: 'USED', usedAt: new Date() },
    });
  }

  /**
   * Expirer les bons périmés (tâche de maintenance)
   */
  async expireOldRewards() {
    return prisma.userReward.updateMany({
      where: {
        status: 'AVAILABLE',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  /**
   * Nombre de bons disponibles pour un utilisateur
   */
  async countAvailableRewards(userId: string): Promise<number> {
    const now = new Date();
    return prisma.userReward.count({
      where: {
        userId,
        status: 'AVAILABLE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
  }

  // ============================================
  // LEADERBOARD CONFIG
  // ============================================

  /**
   * Récupérer toutes les configs de classement actives (triées par rank)
   */
  async getLeaderboardConfigs() {
    return prisma.leaderboardConfig.findMany({
      where: { isActive: true },
      orderBy: { rank: 'asc' },
    });
  }

  /**
   * Récupérer toutes les configs de classement (admin)
   */
  async getAllLeaderboardConfigs() {
    return prisma.leaderboardConfig.findMany({
      orderBy: { rank: 'asc' },
    });
  }

  /**
   * Récupérer une config par rang
   */
  async getLeaderboardConfigByRank(rank: number) {
    return prisma.leaderboardConfig.findUnique({
      where: { rank },
    });
  }

  /**
   * Créer ou mettre à jour une config de classement
   */
  async upsertLeaderboardConfig(rank: number, data: {
    rewardType: RewardType;
    rewardValue: number;
    isActive?: boolean;
  }) {
    return prisma.leaderboardConfig.upsert({
      where: { rank },
      create: {
        rank,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        isActive: data.isActive ?? true,
      },
      update: {
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Supprimer une config de classement
   */
  async deleteLeaderboardConfig(rank: number) {
    return prisma.leaderboardConfig.delete({
      where: { rank },
    });
  }

  // ============================================
  // MONTHLY LEADERBOARD DISTRIBUTION
  // ============================================

  /**
   * Vérifier si un mois a déjà été distribué
   */
  async getMonthlyDistribution(year: number, month: number) {
    return prisma.monthlyLeaderboardDistribution.findUnique({
      where: { year_month: { year, month } },
    });
  }

  /**
   * Marquer un mois comme distribué
   */
  async createMonthlyDistribution(year: number, month: number, adminId: string) {
    return prisma.monthlyLeaderboardDistribution.create({
      data: { year, month, distributedBy: adminId },
    });
  }
}

export const gamificationRepository = new GamificationRepository();
