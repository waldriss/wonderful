import { Request, Response } from 'express';
import { gamificationService } from './gamification.service';
import { asyncHandler } from '../../utils/asyncHandler';
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
  UpdateLeaderboardConfigInput,
  DistributeLeaderboardRewardsInput,
} from './gamification.dto';

/**
 * Controller pour les endpoints de gamification
 */
export class GamificationController {
  // ============================================
  // OVERVIEW - Client
  // ============================================

  /**
   * GET /api/gamification
   * Vue d'ensemble gamification
   */
  getOverview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const overview = await gamificationService.getOverview(userId);

    res.status(200).json({
      success: true,
      data: overview,
    });
  });

  // ============================================
  // POINTS - Client
  // ============================================

  /**
   * GET /api/gamification/points
   * Solde de points
   */
  getPointsBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const points = await gamificationService.getPointsBalance(userId);

    res.status(200).json({
      success: true,
      data: points,
    });
  });

  /**
   * GET /api/gamification/points/history
   * Historique des points
   */
  getPointsHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;
    const result = await gamificationService.getPointsHistory(
      userId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/gamification/points/use
   * Utiliser des points
   */
  usePoints = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { points, orderId } = req.body;
    const result = await gamificationService.usePoints(userId, points, orderId);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  // ============================================
  // BADGES - Client
  // ============================================

  /**
   * GET /api/gamification/badges
   * Liste des badges avec progression
   */
  getBadgesWithProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const badges = await gamificationService.getBadges(userId);

    res.status(200).json({
      success: true,
      data: badges,
    });
  });

  /**
   * GET /api/gamification/badges/mine
   * Mes badges obtenus
   */
  getMyBadges = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const badges = await gamificationService.getMyBadges(userId);

    res.status(200).json({
      success: true,
      data: badges,
    });
  });

  // ============================================
  // MISSIONS - Client
  // ============================================

  /**
   * GET /api/gamification/missions
   * Missions actives avec progression
   */
  getMissionsWithProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const missions = await gamificationService.getMissions(userId);

    res.status(200).json({
      success: true,
      data: missions,
    });
  });

  /**
   * POST /api/gamification/missions/:id/claim
   * Réclamer une récompense de mission
   */
  claimMissionReward = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await gamificationService.claimMissionReward(userId, id);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  // ============================================
  // MYSTERY BOXES - Client
  // ============================================

  /**
   * GET /api/gamification/mystery-boxes
   * Mystery boxes disponibles
   */
  getAvailableMysteryBoxes = asyncHandler(async (req: Request, res: Response) => {
    const boxes = await gamificationService.getMysteryBoxes();

    res.status(200).json({
      success: true,
      data: boxes,
    });
  });

  /**
   * GET /api/gamification/mystery-boxes/mine
   * Mystery boxes non ouvertes de l'utilisateur
   */
  getMyMysteryBoxes = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const boxes = await gamificationService.getMyMysteryBoxes(userId);

    res.status(200).json({
      success: true,
      data: boxes,
    });
  });

  /**
   * POST /api/gamification/mystery-boxes/:id/buy
   * Acheter une mystery box
   */
  buyMysteryBox = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await gamificationService.buyMysteryBox(userId, id);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/gamification/mystery-boxes/:id/open
   * Ouvrir une mystery box
   */
  openMysteryBox = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const reward = await gamificationService.openMysteryBox(userId, id);

    res.status(200).json({
      success: true,
      data: reward,
    });
  });

  // ============================================
  // STREAK - Client
  // ============================================

  /**
   * GET /api/gamification/streak
   * Streak actuel
   */
  getStreak = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const overview = await gamificationService.getOverview(userId);

    res.status(200).json({
      success: true,
      data: overview.streak,
    });
  });

  // ============================================
  // REWARDS (bons de réduction/avantages) - Client
  // ============================================

  /**
   * GET /api/gamification/rewards
   * Bons disponibles de l'utilisateur (réductions, livraison gratuite)
   */
  getMyRewards = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const rewards = await gamificationService.getUserRewards(userId);

    res.status(200).json({
      success: true,
      data: rewards,
    });
  });

  // ============================================
  // REFERRAL - Client
  // ============================================

  /**
   * GET /api/gamification/referral
   * Mon code de parrainage
   */
  getMyReferralCode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const referral = await gamificationService.getMyReferral(userId);

    res.status(200).json({
      success: true,
      data: referral,
    });
  });

  /**
   * POST /api/gamification/referral/generate
   * Générer un code de parrainage
   */
  generateReferralCode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const referral = await gamificationService.generateReferralCode(userId);

    res.status(201).json({
      success: true,
      data: referral,
    });
  });

  /**
   * POST /api/gamification/referral/use
   * Utiliser un code de parrainage
   */
  useReferralCode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { code } = req.body;
    const result = await gamificationService.useReferralCode(userId, code);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  // ============================================
  // LEADERBOARD - Client
  // ============================================

  /**
   * GET /api/gamification/leaderboard
   * Classement des points
   */
  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as LeaderboardQuery;
    const leaderboard = await gamificationService.getLeaderboard(query);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  });

  /**
   * GET /api/gamification/leaderboard/configs
   * Configurations des récompenses de classement (lecture publique)
   */
  getLeaderboardConfigsPublic = asyncHandler(async (req: Request, res: Response) => {
    const configs = await gamificationService.getLeaderboardConfigs();

    res.status(200).json({
      success: true,
      data: configs,
    });
  });

  // ============================================
  // ADMIN - Badges
  // ============================================

  /**
   * GET /api/admin/gamification/badges
   * Liste des badges (Admin)
   */
  listBadges = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListQuery;
    const result = await gamificationService.listBadges(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/admin/gamification/badges
   * Créer un badge
   */
  createBadge = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateBadgeInput;
    const badge = await gamificationService.createBadge(data);

    res.status(201).json({
      success: true,
      message: 'Badge créé avec succès',
      data: badge,
    });
  });

  /**
   * PUT /api/admin/gamification/badges/:id
   * Modifier un badge
   */
  updateBadge = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateBadgeInput;
    const badge = await gamificationService.updateBadge(id, data);

    res.status(200).json({
      success: true,
      message: 'Badge mis à jour avec succès',
      data: badge,
    });
  });

  /**
   * DELETE /api/admin/gamification/badges/:id
   * Supprimer un badge
   */
  deleteBadge = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await gamificationService.deleteBadge(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // ============================================
  // ADMIN - Missions
  // ============================================

  /**
   * GET /api/admin/gamification/missions
   * Liste des missions (Admin)
   */
  listMissions = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListQuery;
    const result = await gamificationService.listMissions(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/admin/gamification/missions
   * Créer une mission
   */
  createMission = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateMissionInput;
    const mission = await gamificationService.createMission(data);

    res.status(201).json({
      success: true,
      message: 'Mission créée avec succès',
      data: mission,
    });
  });

  /**
   * PUT /api/admin/gamification/missions/:id
   * Modifier une mission
   */
  updateMission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateMissionInput;
    const mission = await gamificationService.updateMission(id, data);

    res.status(200).json({
      success: true,
      message: 'Mission mise à jour avec succès',
      data: mission,
    });
  });

  /**
   * DELETE /api/admin/gamification/missions/:id
   * Supprimer une mission
   */
  deleteMission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await gamificationService.deleteMission(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // ============================================
  // ADMIN - Mystery Boxes
  // ============================================

  /**
   * GET /api/admin/gamification/mystery-boxes
   * Liste des mystery boxes (Admin)
   */
  listMysteryBoxes = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListQuery;
    const result = await gamificationService.listMysteryBoxes(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/admin/gamification/mystery-boxes
   * Créer une mystery box
   */
  createMysteryBox = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateMysteryBoxInput;
    const box = await gamificationService.createMysteryBox(data);

    res.status(201).json({
      success: true,
      message: 'Mystery Box créée avec succès',
      data: box,
    });
  });

  /**
   * PUT /api/admin/gamification/mystery-boxes/:id
   * Modifier une mystery box
   */
  updateMysteryBox = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateMysteryBoxInput;
    const box = await gamificationService.updateMysteryBox(id, data);

    res.status(200).json({
      success: true,
      message: 'Mystery Box mise à jour avec succès',
      data: box,
    });
  });

  /**
   * DELETE /api/admin/gamification/mystery-boxes/:id
   * Supprimer une mystery box
   */
  deleteMysteryBox = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await gamificationService.deleteMysteryBox(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // ============================================
  // ADMIN - Points & Stats
  // ============================================

  /**
   * POST /api/admin/gamification/points/grant
   * Attribuer des points manuellement
   */
  grantPoints = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as GrantPointsInput;
    const result = await gamificationService.grantPoints(data);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/admin/gamification/stats
   * Statistiques de gamification
   */
  getGamificationStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await gamificationService.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // ============================================
  // ADMIN - Leaderboard Config
  // ============================================

  /**
   * GET /api/admin/gamification/leaderboard-configs
   * Liste des configurations de classement
   */
  listLeaderboardConfigs = asyncHandler(async (req: Request, res: Response) => {
    const configs = await gamificationService.getLeaderboardConfigs();

    res.status(200).json({
      success: true,
      data: configs,
    });
  });

  /**
   * PUT /api/admin/gamification/leaderboard-configs/:rank
   * Créer ou mettre à jour une configuration de classement
   */
  upsertLeaderboardConfig = asyncHandler(async (req: Request, res: Response) => {
    const rank = Number(req.params.rank);
    const data = req.body as UpdateLeaderboardConfigInput;
    const config = await gamificationService.upsertLeaderboardConfig(rank, data);

    res.status(200).json({
      success: true,
      message: 'Configuration de classement enregistrée avec succès',
      data: config,
    });
  });

  /**
   * DELETE /api/admin/gamification/leaderboard-configs/:rank
   * Supprimer une configuration de classement
   */
  deleteLeaderboardConfig = asyncHandler(async (req: Request, res: Response) => {
    const rank = Number(req.params.rank);
    const result = await gamificationService.deleteLeaderboardConfig(rank);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  /**
   * GET /api/admin/gamification/leaderboard/monthly
   * Classement mensuel (admin)
   */
  getMonthlyLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const leaderboard = await gamificationService.getMonthlyLeaderboardAdmin(year, month, limit);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  });

  /**
   * POST /api/admin/gamification/leaderboard/distribute-rewards
   * Distribuer les récompenses mensuelles
   */
  distributeMonthlyRewards = asyncHandler(async (req: Request, res: Response) => {
    const adminUserId = req.user!.id;
    const data = req.body as DistributeLeaderboardRewardsInput;
    const result = await gamificationService.distributeMonthlyRewards(adminUserId, data);

    res.status(200).json({
      success: true,
      message: 'Récompenses distribuées avec succès',
      data: result,
    });
  });
}

export const gamificationController = new GamificationController();
