import { gamificationRepository } from './gamification.repository';
import { createBadRequestError, createNotFoundError, createConflictError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { MissionType, RewardType } from '@prisma/client';
import logger from '../../utils/logger';
import { NotificationService } from '../notifications/notification.service';
import {
  CreateBadgeInput,
  UpdateBadgeInput,
  CreateMissionInput,
  UpdateMissionInput,
  CreateMysteryBoxInput,
  UpdateMysteryBoxInput,
  GrantPointsInput,
  ListQuery,
  LeaderboardQuery,
  PointsResponse,
  BadgeResponse,
  MissionResponse,
  MysteryBoxResponse,
  MysteryBoxOpenResult,
  UserRewardResponse,
  LeaderboardEntryResponse,
  ReferralResponse,
  GamificationOverviewResponse,
  GamificationStatsResponse,
  LeaderboardConfigResponse,
  UpdateLeaderboardConfigInput,
  MonthlyLeaderboardEntryResponse,
  DistributeRewardsResult,
  DistributeLeaderboardRewardsInput,
} from './gamification.dto';

// Diffusion des notifications aux clients (persisté + socket + push)
const notificationService = new NotificationService();

// Points de parrainage
const REFERRAL_BONUS_REFERRER = 100;
const REFERRAL_BONUS_REFERRED = 50;

// Durée de validité par défaut des bons (30 jours)
const REWARD_EXPIRY_DAYS = 30;

/**
 * Service pour la logique métier de gamification
 */
class GamificationService {
  // ============================================
  // OVERVIEW - Client
  // ============================================

  /**
   * Vue d'ensemble gamification pour l'utilisateur
   */
  async getOverview(userId: string): Promise<GamificationOverviewResponse> {
    const [pointsAccount, streak, userBadges, allBadges, userMissions, activeMissions, referral, pendingRewards] =
      await Promise.all([
        gamificationRepository.getOrCreatePointsAccount(userId),
        gamificationRepository.getStreak(userId),
        gamificationRepository.getUserBadges(userId),
        gamificationRepository.findActiveBadges(),
        gamificationRepository.getUserMissions(userId),
        gamificationRepository.findActiveMissions(),
        gamificationRepository.getReferral(userId),
        gamificationRepository.countAvailableRewards(userId),
      ]);

    const completedMissions = userMissions.filter((m) => m.completed).length;

    return {
      points: {
        totalPoints: pointsAccount.totalPoints,
        availablePoints: pointsAccount.availablePoints,
        lifetimeEarned: pointsAccount.lifetimeEarned,
        lifetimeSpent: pointsAccount.lifetimeSpent,
      },
      streak: streak
        ? {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastOrderDate: streak.lastOrderDate,
            active: streak.active,
          }
        : {
            currentStreak: 0,
            longestStreak: 0,
            lastOrderDate: null,
            active: false,
          },
      badgesEarned: userBadges.length,
      totalBadges: allBadges.length,
      activeMissions: activeMissions.length,
      completedMissions,
      referralCode: referral?.code || null,
      pendingRewards,
    };
  }

  // ============================================
  // POINTS - Client
  // ============================================

  /**
   * Récupérer le solde de points
   */
  async getPointsBalance(userId: string): Promise<PointsResponse> {
    const account = await gamificationRepository.getOrCreatePointsAccount(userId);
    return {
      totalPoints: account.totalPoints,
      availablePoints: account.availablePoints,
      lifetimeEarned: account.lifetimeEarned,
      lifetimeSpent: account.lifetimeSpent,
    };
  }

  /**
   * Historique des points
   */
  async getPointsHistory(userId: string, page = 1, limit = 20) {
    const account = await gamificationRepository.getOrCreatePointsAccount(userId);
    const { transactions, total } = await gamificationRepository.getPointsHistory(account.id, page, limit);

    return {
      data: transactions,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Utiliser des points (pour une commande)
   */
  async usePoints(userId: string, points: number, orderId?: string) {
    const account = await gamificationRepository.getOrCreatePointsAccount(userId);

    if (account.availablePoints < points) {
      throw createBadRequestError(`Points insuffisants. Disponible: ${account.availablePoints}`);
    }

    await gamificationRepository.addPointsTransaction({
      accountId: account.id,
      type: 'SPEND',
      amount: points,
      reason: orderId ? `Utilisé pour la commande ${orderId}` : 'Utilisation manuelle',
      relatedOrderId: orderId,
    });

    const newBalance = await this.getPointsBalance(userId);

    return {
      message: `${points} points utilisés avec succès`,
      pointsUsed: points,
      newBalance,
    };
  }

  /**
   * Ajouter des points (interne)
   */
  async addPoints(userId: string, points: number, reason: string, relatedOrderId?: string): Promise<PointsResponse> {
    const account = await gamificationRepository.getOrCreatePointsAccount(userId);

    await gamificationRepository.addPointsTransaction({
      accountId: account.id,
      type: 'EARN',
      amount: points,
      reason,
      relatedOrderId,
    });

    return this.getPointsBalance(userId);
  }

  // ============================================
  // BADGES - Client
  // ============================================

  /**
   * Récupérer tous les badges
   */
  async getBadges(userId: string): Promise<BadgeResponse[]> {
    const [allBadges, userBadges] = await Promise.all([
      gamificationRepository.findActiveBadges(),
      gamificationRepository.getUserBadges(userId),
    ]);

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
    const earnedBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.unlockedAt]));

    return allBadges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      requirementType: badge.requirementType,
      requirementTarget: badge.requirementTarget,
      rewardType: badge.rewardType,
      rewardValue: badge.rewardValue,
      earnedCount: badge.earnedCount,
      status: badge.status,
      earnedAt: earnedBadgeMap.get(badge.id),
    }));
  }

  /**
   * Mes badges obtenus
   */
  async getMyBadges(userId: string): Promise<BadgeResponse[]> {
    const userBadges = await gamificationRepository.getUserBadges(userId);

    return userBadges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      category: ub.badge.category,
      rarity: ub.badge.rarity,
      requirementType: ub.badge.requirementType,
      requirementTarget: ub.badge.requirementTarget,
      rewardType: ub.badge.rewardType,
      rewardValue: ub.badge.rewardValue,
      earnedCount: ub.badge.earnedCount,
      status: ub.badge.status,
      earnedAt: ub.unlockedAt,
    }));
  }

  // ============================================
  // MISSIONS - Client
  // ============================================

  /**
   * Récupérer les missions actives avec progression
   */
  async getMissions(userId: string): Promise<MissionResponse[]> {
    const [activeMissions, userMissions] = await Promise.all([
      gamificationRepository.findActiveMissions(),
      gamificationRepository.getUserMissions(userId),
    ]);

    const userMissionMap = new Map(userMissions.map((um) => [um.missionId, um]));

    return activeMissions.map((mission) => {
      const userMission = userMissionMap.get(mission.id);
      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        icon: mission.icon,
        targetValue: mission.targetValue,
        rewardType: mission.rewardType,
        rewardValue: mission.rewardValue,
        startDate: mission.startDate,
        endDate: mission.endDate,
        status: mission.status,
        completionsCount: mission.completionsCount,
        currentProgress: userMission?.progress || 0,
        completed: userMission?.completed || false,
        claimed: userMission?.claimed || false,
        completedAt: userMission?.completedAt,
      };
    });
  }

  /**
   * Réclamer une récompense de mission
   */
  async claimMissionReward(userId: string, missionId: string) {
    const userMissions = await gamificationRepository.getUserMissions(userId);
    const userMission = userMissions.find((um) => um.missionId === missionId);

    if (!userMission) {
      const mission = await gamificationRepository.findMissionById(missionId);
      if (!mission) {
        throw createNotFoundError('Mission');
      }
      throw createBadRequestError('Non inscrit à cette mission');
    }

    if (!userMission.completed) {
      throw createBadRequestError('Mission non complétée');
    }

    if (userMission.claimed) {
      throw createBadRequestError('Récompense déjà réclamée');
    }

    const claimed = await gamificationRepository.claimMissionReward(userId, missionId);
    const { rewardType, rewardValue, title } = claimed.mission;

    let userRewardId: string | null = null;

    if (rewardType === RewardType.POINTS) {
      await this.addPoints(userId, rewardValue, `Mission complétée : ${title}`);
    } else {
      // Créer un bon de réduction ou livraison gratuite (valable 30 jours)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);
      const userReward = await gamificationRepository.createUserReward({
        userId,
        type: rewardType,
        value: rewardValue,
        source: `Mission : ${title}`,
        expiresAt,
      });
      userRewardId = userReward.id;
    }

    return {
      message: 'Récompense réclamée avec succès',
      reward: {
        type: claimed.mission.rewardType,
        value: claimed.mission.rewardValue,
      },
      userRewardId,
    };
  }

  // ============================================
  // MYSTERY BOXES - Client
  // ============================================

  /**
   * Récupérer les mystery boxes disponibles
   */
  async getMysteryBoxes(): Promise<MysteryBoxResponse[]> {
    const boxes = await gamificationRepository.findActiveMysteryBoxes();

    return boxes.map((box) => ({
      id: box.id,
      name: box.name,
      description: box.description,
      icon: box.icon,
      cost: box.cost,
      rarity: box.rarity,
      status: box.status,
      openedCount: box.openedCount,
      rewards: box.possibleRewards.map((r) => ({
        type: r.type,
        value: r.value,
        probability: r.probability,
        description: r.description,
      })),
    }));
  }

  /**
   * Récupérer les mystery boxes non ouvertes d'un utilisateur.
   */
  async getMyMysteryBoxes(userId: string) {
    const boxes = await gamificationRepository.getUserMysteryBoxes(userId);

    return boxes.map((userBox) => ({
      id: userBox.id,
      receivedAt: userBox.receivedAt,
      mysteryBox: {
        id: userBox.mysteryBox.id,
        name: userBox.mysteryBox.name,
        description: userBox.mysteryBox.description,
        icon: userBox.mysteryBox.icon,
        cost: userBox.mysteryBox.cost,
        rarity: userBox.mysteryBox.rarity,
        status: userBox.mysteryBox.status,
        openedCount: userBox.mysteryBox.openedCount,
      },
    }));
  }

  /**
   * Acheter une mystery box
   */
  async buyMysteryBox(userId: string, mysteryBoxId: string) {
    const box = await gamificationRepository.findMysteryBoxById(mysteryBoxId);
    if (!box || box.status !== 'ACTIVE') {
      throw createNotFoundError('Mystery Box');
    }

    const account = await gamificationRepository.getOrCreatePointsAccount(userId);
    if (account.availablePoints < box.cost) {
      throw createBadRequestError(`Points insuffisants. Requis: ${box.cost}, Disponible: ${account.availablePoints}`);
    }

    // Déduire les points
    await gamificationRepository.addPointsTransaction({
      accountId: account.id,
      type: 'SPEND',
      amount: box.cost,
      reason: `Achat Mystery Box: ${box.name}`,
    });

    // Attribuer la box à l'utilisateur
    const userBox = await gamificationRepository.grantMysteryBox(userId, mysteryBoxId);

    return {
      message: 'Mystery Box achetée avec succès',
      userMysteryBoxId: userBox.id,
      mysteryBox: {
        id: box.id,
        name: box.name,
        description: box.description,
        icon: box.icon,
        cost: box.cost,
        rarity: box.rarity,
        status: box.status,
        openedCount: box.openedCount,
      },
    };
  }

  /**
   * Ouvrir une mystery box
   */
  async openMysteryBox(userId: string, userMysteryBoxId: string): Promise<MysteryBoxOpenResult> {
    const userBoxes = await gamificationRepository.getUserMysteryBoxes(userId);
    const userBox = userBoxes.find((ub) => ub.id === userMysteryBoxId);
    if (!userBox) {
      throw createNotFoundError('Mystery Box');
    }

    if (userBox.opened) {
      throw createBadRequestError('Mystery Box déjà ouverte');
    }

    const box = await gamificationRepository.findMysteryBoxById(userBox.mysteryBoxId);
    if (!box || !box.possibleRewards.length) {
      throw createBadRequestError('Mystery Box invalide');
    }

    // Sélectionner une récompense aléatoire selon les probabilités
    const reward = this.selectRandomReward(box.possibleRewards.map((r) => ({ ...r, type: r.type })));

    // Ouvrir la box
    await gamificationRepository.openMysteryBox(userMysteryBoxId, reward.type, reward.value);

    let userRewardId: string | null = null;

    if (reward.type === RewardType.POINTS) {
      await this.addPoints(userId, reward.value, `Mystery Box : ${box.name}`);
    } else {
      // Créer un bon de réduction / livraison gratuite
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);
      const userReward = await gamificationRepository.createUserReward({
        userId,
        type: reward.type,
        value: reward.value,
        source: `Mystery Box : ${box.name}`,
        expiresAt,
      });
      userRewardId = userReward.id;
    }

    return {
      rewardType: reward.type,
      rewardValue: reward.value,
      description: reward.description ?? null,
      pointsSpent: box.cost,
      userRewardId,
    };
  }

  /**
   * Sélectionner une récompense aléatoire
   */
  private selectRandomReward(rewards: { type: RewardType; value: number; probability: number; description: string | null }[]) {
    const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
    let random = Math.random() * totalProbability;

    for (const reward of rewards) {
      random -= reward.probability;
      if (random <= 0) {
        return reward;
      }
    }

    return rewards[0];
  }

  // ============================================
  // REFERRAL - Client
  // ============================================

  /**
   * Récupérer mon code de parrainage
   */
  async getMyReferral(userId: string): Promise<ReferralResponse | null> {
    const referral = await gamificationRepository.getReferral(userId);
    if (!referral) {
      return null;
    }

    return {
      code: referral.code,
      totalReferrals: referral.totalReferrals,
      successfulReferrals: referral.successfulReferrals,
      totalEarned: referral.totalEarned,
    };
  }

  /**
   * Générer un code de parrainage
   */
  async generateReferralCode(userId: string): Promise<ReferralResponse> {
    const existing = await gamificationRepository.getReferral(userId);
    if (existing) {
      throw createConflictError('Vous avez déjà un code de parrainage');
    }

    // Générer un code unique
    const code = this.generateUniqueCode();
    const referral = await gamificationRepository.createReferral(userId, code);

    return {
      code: referral.code,
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarned: 0,
    };
  }

  /**
   * Utiliser un code de parrainage
   */
  async useReferralCode(userId: string, code: string) {
    const referral = await gamificationRepository.findReferralByCode(code);
    if (!referral) {
      throw createNotFoundError('Code de parrainage');
    }

    if (referral.referrerId === userId) {
      throw createBadRequestError("Vous ne pouvez pas utiliser votre propre code");
    }

    // Ajouter des points au parrain et au filleul
    await Promise.all([
      this.addPoints(referral.referrerId, REFERRAL_BONUS_REFERRER, `Parrainage: nouveau filleul`),
      this.addPoints(userId, REFERRAL_BONUS_REFERRED, `Bonus de bienvenue parrainage`),
    ]);

    // Incrémenter le compteur
    await gamificationRepository.incrementReferralCount(referral.id, true, REFERRAL_BONUS_REFERRER);

    // Déclencher les missions de parrainage pour le parrain (asynchrone)
    setImmediate(async () => {
      const referralData = await gamificationRepository.getReferral(referral.referrerId);
      const referralCount = referralData?.successfulReferrals ?? 1;
      await this.checkAndUpdateMissions(referral.referrerId, 'REFERRAL_COUNT', 1);
      await this.checkAndGrantBadges(referral.referrerId, 'REFERRAL_COUNT', referralCount);
    });

    return {
      message: 'Code de parrainage appliqué avec succès',
      pointsEarned: REFERRAL_BONUS_REFERRED,
    };
  }

  /**
   * Générer un code unique
   */
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ============================================
  // LEADERBOARD - Client
  // ============================================

  /**
   * Récupérer le leaderboard
   */
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntryResponse[]> {
    const { period, limit } = query;

    if (period === 'monthly') {
      const now = new Date();
      const monthlyLeaderboard = await gamificationRepository.getMonthlyLeaderboard(
        now.getFullYear(),
        now.getMonth() + 1,
        limit,
      );

      // Mapper monthlyPoints vers totalPoints pour compatibilité client existant
      return monthlyLeaderboard.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        userName: entry.userName,
        userAvatar: entry.userAvatar,
        totalPoints: entry.monthlyPoints,
        badgeCount: entry.badgeCount,
      }));
    }

    // weekly non implémenté → fallback lifetime
    return gamificationRepository.getLeaderboard(query);
  }

  /**
   * Récupérer le leaderboard mensuel (admin)
   */
  async getMonthlyLeaderboardAdmin(year?: number, month?: number, limit = 20): Promise<MonthlyLeaderboardEntryResponse[]> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth() + 1;

    return gamificationRepository.getMonthlyLeaderboard(targetYear, targetMonth, limit);
  }

  /**
   * Distribuer les récompenses mensuelles du classement
   */
  async distributeMonthlyRewards(adminUserId: string, input?: DistributeLeaderboardRewardsInput): Promise<DistributeRewardsResult> {
    const now = new Date();
    const targetYear = input?.year ?? now.getFullYear();
    const targetMonth = input?.month ?? now.getMonth() + 1;

    // 1. Vérifier si déjà distribué
    const existing = await gamificationRepository.getMonthlyDistribution(targetYear, targetMonth);
    if (existing) {
      throw createConflictError('Récompenses déjà distribuées pour ce mois');
    }

    // 2. Récupérer les configs actives
    const configs = await gamificationRepository.getLeaderboardConfigs();

    // 3. Calculer le classement mensuel (top 100 pour couvrir toutes les configs)
    const leaderboard = await gamificationRepository.getMonthlyLeaderboard(targetYear, targetMonth, 100);

    // 4. Distribuer les récompenses
    const winners: DistributeRewardsResult['winners'] = [];
    const monthName = new Date(targetYear, targetMonth - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    for (const config of configs) {
      const winner = leaderboard.find((entry) => entry.rank === config.rank);
      if (!winner) continue;

      let userRewardId: string | null = null;

      if (config.rewardType === RewardType.POINTS) {
        await this.addPoints(winner.userId, config.rewardValue, `Classement mensuel - ${monthName} - Top ${config.rank}`);
        userRewardId = null;
      } else {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);
        const userReward = await gamificationRepository.createUserReward({
          userId: winner.userId,
          type: config.rewardType,
          value: config.rewardValue,
          source: `Classement mensuel - ${monthName} - Top ${config.rank}`,
          expiresAt,
        });
        userRewardId = userReward.id;
      }

      winners.push({
        rank: config.rank,
        userId: winner.userId,
        userName: winner.userName,
        monthlyPoints: winner.monthlyPoints,
        rewardType: config.rewardType,
        rewardValue: config.rewardValue,
        userRewardId,
      });
    }

    // 5. Marquer le mois comme distribué
    const distribution = await gamificationRepository.createMonthlyDistribution(targetYear, targetMonth, adminUserId);

    return {
      year: targetYear,
      month: targetMonth,
      distributedAt: distribution.distributedAt,
      winners,
    };
  }

  // ============================================
  // ADMIN - Badges
  // ============================================

  /**
   * Liste des badges (admin)
   */
  async listBadges(query: ListQuery) {
    const { badges, total, page, limit } = await gamificationRepository.findAllBadges(query);

    return {
      data: badges.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        requirementType: badge.requirementType,
        requirementTarget: badge.requirementTarget,
        rewardType: badge.rewardType,
        rewardValue: badge.rewardValue,
        earnedCount: badge.earnedCount,
        status: badge.status,
        usersCount: badge._count?.users || 0,
      })),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Créer un badge
   */
  async createBadge(data: CreateBadgeInput): Promise<BadgeResponse> {
    const badge = await gamificationRepository.createBadge(data);
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      requirementType: badge.requirementType,
      requirementTarget: badge.requirementTarget,
      rewardType: badge.rewardType,
      rewardValue: badge.rewardValue,
      earnedCount: badge.earnedCount,
      status: badge.status,
    };
  }

  /**
   * Modifier un badge
   */
  async updateBadge(badgeId: string, data: UpdateBadgeInput): Promise<BadgeResponse> {
    const badge = await gamificationRepository.findBadgeById(badgeId);
    if (!badge) {
      throw createNotFoundError('Badge');
    }

    const updated = await gamificationRepository.updateBadge(badgeId, data);
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      icon: updated.icon,
      category: updated.category,
      rarity: updated.rarity,
      requirementType: updated.requirementType,
      requirementTarget: updated.requirementTarget,
      rewardType: updated.rewardType,
      rewardValue: updated.rewardValue,
      earnedCount: updated.earnedCount,
      status: updated.status,
    };
  }

  /**
   * Supprimer un badge
   */
  async deleteBadge(badgeId: string): Promise<{ message: string }> {
    const badge = await gamificationRepository.findBadgeById(badgeId);
    if (!badge) {
      throw createNotFoundError('Badge');
    }

    await gamificationRepository.deleteBadge(badgeId);
    return { message: 'Badge supprimé avec succès' };
  }

  // ============================================
  // ADMIN - Missions
  // ============================================

  /**
   * Liste des missions (admin)
   */
  async listMissions(query: ListQuery) {
    const { missions, total, page, limit } = await gamificationRepository.findAllMissions(query);

    return {
      data: missions.map((mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        icon: mission.icon,
        targetValue: mission.targetValue,
        rewardType: mission.rewardType,
        rewardValue: mission.rewardValue,
        startDate: mission.startDate,
        endDate: mission.endDate,
        status: mission.status,
        completionsCount: mission.completionsCount,
        usersCount: mission._count?.users || 0,
      })),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Créer une mission
   */
  async createMission(data: CreateMissionInput): Promise<MissionResponse> {
    const mission = await gamificationRepository.createMission(data);
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      type: mission.type,
      icon: mission.icon,
      targetValue: mission.targetValue,
      rewardType: mission.rewardType,
      rewardValue: mission.rewardValue,
      startDate: mission.startDate,
      endDate: mission.endDate,
      status: mission.status,
      completionsCount: mission.completionsCount,
    };
  }

  /**
   * Modifier une mission
   */
  async updateMission(missionId: string, data: UpdateMissionInput): Promise<MissionResponse> {
    const mission = await gamificationRepository.findMissionById(missionId);
    if (!mission) {
      throw createNotFoundError('Mission');
    }

    const updated = await gamificationRepository.updateMission(missionId, data);
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      type: updated.type,
      icon: updated.icon,
      targetValue: updated.targetValue,
      rewardType: updated.rewardType,
      rewardValue: updated.rewardValue,
      startDate: updated.startDate,
      endDate: updated.endDate,
      status: updated.status,
      completionsCount: updated.completionsCount,
    };
  }

  /**
   * Supprimer une mission
   */
  async deleteMission(missionId: string): Promise<{ message: string }> {
    const mission = await gamificationRepository.findMissionById(missionId);
    if (!mission) {
      throw createNotFoundError('Mission');
    }

    await gamificationRepository.deleteMission(missionId);
    return { message: 'Mission supprimée avec succès' };
  }

  // ============================================
  // ADMIN - Mystery Boxes
  // ============================================

  /**
   * Liste des mystery boxes (admin)
   */
  async listMysteryBoxes(query: ListQuery) {
    const { boxes, total, page, limit } = await gamificationRepository.findAllMysteryBoxes(query);

    return {
      data: boxes.map((box) => {
        const boxWithRewards = box;
        return {
          id: box.id,
          name: box.name,
          description: box.description,
          icon: box.icon,
          cost: box.cost,
          rarity: box.rarity,
          status: box.status,
          openedCount: box.openedCount,
          rewards: boxWithRewards.possibleRewards.map((r) => ({
            type: r.type,
            value: r.value,
            probability: r.probability,
            description: r.description,
          })),
        };
      }),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Créer une mystery box
   */
  async createMysteryBox(data: CreateMysteryBoxInput): Promise<MysteryBoxResponse> {
    const box = await gamificationRepository.createMysteryBox(data);
    return {
      id: box.id,
      name: box.name,
      description: box.description,
      icon: box.icon,
      cost: box.cost,
      rarity: box.rarity,
      status: box.status,
      openedCount: box.openedCount,
      rewards: box.possibleRewards.map((r) => ({
        type: r.type,
        value: r.value,
        probability: r.probability,
        description: r.description,
      })),
    };
  }

  /**
   * Modifier une mystery box
   */
  async updateMysteryBox(boxId: string, data: UpdateMysteryBoxInput): Promise<MysteryBoxResponse> {
    const box = await gamificationRepository.findMysteryBoxById(boxId);
    if (!box) {
      throw createNotFoundError('Mystery Box');
    }

    const updated = await gamificationRepository.updateMysteryBox(boxId, data);
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      icon: updated.icon,
      cost: updated.cost,
      rarity: updated.rarity,
      status: updated.status,
      openedCount: updated.openedCount,
      rewards: updated.possibleRewards.map((r) => ({
        type: r.type,
        value: r.value,
        probability: r.probability,
        description: r.description,
      })),
    };
  }

  /**
   * Supprimer une mystery box
   */
  async deleteMysteryBox(boxId: string): Promise<{ message: string }> {
    const box = await gamificationRepository.findMysteryBoxById(boxId);
    if (!box) {
      throw createNotFoundError('Mystery Box');
    }

    await gamificationRepository.deleteMysteryBox(boxId);
    return { message: 'Mystery Box supprimée avec succès' };
  }

  // ============================================
  // ADMIN - Points
  // ============================================

  /**
   * Attribuer des points manuellement
   */
  async grantPoints(data: GrantPointsInput) {
    const newBalance = await this.addPoints(data.userId, data.points, data.reason);
    return {
      message: `${data.points} points attribués avec succès`,
      newBalance,
    };
  }

  // ============================================
  // ADMIN - Stats
  // ============================================

  /**
   * Statistiques globales
   */
  async getStats(): Promise<GamificationStatsResponse> {
    return gamificationRepository.getGlobalStats();
  }

  // ============================================
  // ADMIN - Leaderboard Config
  // ============================================

  /**
   * Récupérer toutes les configurations de classement
   */
  async getLeaderboardConfigs(): Promise<LeaderboardConfigResponse[]> {
    const configs = await gamificationRepository.getAllLeaderboardConfigs();

    return configs.map((config) => ({
      id: config.id,
      rank: config.rank,
      rewardType: config.rewardType,
      rewardValue: config.rewardValue,
      isActive: config.isActive,
      createdAt: config.createdAt,
    }));
  }

  /**
   * Créer ou mettre à jour une configuration de classement
   */
  async upsertLeaderboardConfig(rank: number, data: UpdateLeaderboardConfigInput): Promise<LeaderboardConfigResponse> {
    if (data.rewardType === undefined || data.rewardValue === undefined) {
      throw createBadRequestError('rewardType et rewardValue sont requis');
    }

    const config = await gamificationRepository.upsertLeaderboardConfig(rank, {
      rewardType: data.rewardType,
      rewardValue: data.rewardValue,
      isActive: data.isActive,
    });

    return {
      id: config.id,
      rank: config.rank,
      rewardType: config.rewardType,
      rewardValue: config.rewardValue,
      isActive: config.isActive,
      createdAt: config.createdAt,
    };
  }

  /**
   * Supprimer une configuration de classement
   */
  async deleteLeaderboardConfig(rank: number): Promise<{ message: string }> {
    const config = await gamificationRepository.getLeaderboardConfigByRank(rank);
    if (!config) {
      throw createNotFoundError('Configuration de classement');
    }

    await gamificationRepository.deleteLeaderboardConfig(rank);
    return { message: 'Configuration de classement supprimée avec succès' };
  }

  // ============================================
  // TRIGGERS AUTOMATIQUES (appelés depuis d'autres services)
  // ============================================

  /**
   * Vérifier et mettre à jour la progression des missions d'un utilisateur
   * Appelé automatiquement après une commande, un avis, un parrainage, etc.
   *
   * @param userId - ID de l'utilisateur
   * @param triggerType - Type de déclencheur (ORDER_COUNT, TOTAL_SPENT, REVIEW_COUNT, ...)
   * @param value - La valeur incrémentale (ex: 1 commande, 1500 centimes dépensés)
   * @param orderId - ID de la commande (optionnel, pour TOTAL_SPENT)
   */
  async checkAndUpdateMissions(userId: string, triggerType: MissionType, value: number, orderId?: string): Promise<void> {
    try {
      const activeMissions = await gamificationRepository.findActiveMissions();
      const relevantMissions = activeMissions.filter((m) => m.type === triggerType);

      for (const mission of relevantMissions) {
        const userMission = await gamificationRepository.getOrCreateUserMission(userId, mission.id);

        // Ne pas re-traiter les missions déjà complétées et réclamées
        if (userMission.completed) continue;

        const newProgress = userMission.progress + value;
        await gamificationRepository.updateMissionProgress(userId, mission.id, newProgress);

        // Vérifier si l'objectif est atteint
        if (newProgress >= mission.targetValue && !userMission.completed) {
          await gamificationRepository.completeMission(userId, mission.id);

          // Notifier le client (persisté + socket + push) — non bloquant
          notificationService
            .sendMissionCompleteNotification(userId, mission.title, mission.rewardValue, mission.id)
            .catch(() => {});

          // Si la récompense est des points, les attribuer immédiatement à la complétion
          // (les autres types de récompenses sont distribués lors du claim explicite par l'utilisateur)
          if (mission.rewardType === RewardType.POINTS && mission.rewardValue > 0) {
            await this.addPoints(userId, mission.rewardValue, `Mission complétée : ${mission.title}`, orderId);
            // Marquer automatiquement comme claimed pour POINTS (pas besoin d'action utilisateur)
            await gamificationRepository.claimMissionReward(userId, mission.id);
          }
        }
      }
    } catch (err) {
      // Ne pas faire échouer la requête principale pour une erreur de gamification
      logger.error({ err, userId, triggerType }, 'Erreur lors de la mise à jour des missions');
    }
  }

  /**
   * Vérifier et attribuer automatiquement les badges à un utilisateur
   * Appelé après chaque action significative
   */
  async checkAndGrantBadges(userId: string, requirementType: MissionType, value: number): Promise<void> {
    try {
      const allBadges = await gamificationRepository.findActiveBadges();
      const relevantBadges = allBadges.filter(
        (b) => b.requirementType === requirementType && b.requirementTarget != null,
      );

      for (const badge of relevantBadges) {
        if (badge.requirementTarget == null) continue;
        if (value < badge.requirementTarget) continue;

        const alreadyHas = await gamificationRepository.userHasBadge(userId, badge.id);
        if (alreadyHas) continue;

        await gamificationRepository.grantBadge(userId, badge.id);

        // Notifier le client (persisté + socket + push) — non bloquant
        notificationService.sendBadgeNotification(userId, badge.name, badge.id).catch(() => {});

        if (!badge.rewardType || !badge.rewardValue || badge.rewardValue <= 0) continue;

        if (badge.rewardType === RewardType.POINTS) {
          await this.addPoints(userId, badge.rewardValue, `Badge débloqué : ${badge.name}`);
        } else {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);
          await gamificationRepository.createUserReward({
            userId,
            type: badge.rewardType,
            value: badge.rewardValue,
            source: `Badge : ${badge.name}`,
            expiresAt,
          });
        }
      }
    } catch (err) {
      logger.error({ err, userId, requirementType }, 'Erreur lors de la vérification des badges');
    }
  }

  /**
   * Mettre à jour le streak de commandes d'un utilisateur et vérifier les missions
   */
  async updateStreakAndCheck(userId: string): Promise<void> {
    try {
      const existing = await gamificationRepository.getStreak(userId);
      const now = new Date();

      let newStreak = 1;
      if (existing) {
        const lastDate = existing.lastOrderDate;
        if (lastDate) {
          const diffDays = Math.floor(
            (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 1) {
            newStreak = existing.currentStreak + 1;
          } else if (diffDays === 0) {
            newStreak = existing.currentStreak;
          }
          // sinon diffDays > 1 → streak reset à 1
        }
      }

      await gamificationRepository.updateStreak(userId, { currentStreak: newStreak, lastOrderDate: now });

      const streak = await gamificationRepository.getStreak(userId);
      if (streak) {
        await this.checkAndUpdateMissions(userId, MissionType.STREAK_DAYS, streak.currentStreak);
        await this.checkAndGrantBadges(userId, MissionType.STREAK_DAYS, streak.currentStreak);
      }
    } catch (err) {
      logger.error({ err, userId }, 'Erreur lors de la mise à jour du streak');
    }
  }

  // ============================================
  // USER REWARDS
  // ============================================

  /**
   * Récupérer les bons de récompense disponibles d'un utilisateur
   */
  async getUserRewards(userId: string): Promise<UserRewardResponse[]> {
    const rewards = await gamificationRepository.getUserRewards(userId);

    return rewards.map((r) => ({
      id: r.id,
      type: r.type,
      value: r.value,
      status: r.status,
      source: r.source,
      expiresAt: r.expiresAt,
    }));
  }
}

export { GamificationService };
export const gamificationService = new GamificationService();
