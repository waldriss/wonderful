import { Router } from 'express';
import { gamificationController } from './gamification.controller';
import { validateBody, validateQuery } from '../../middlewares/validation';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import {
  usePointsSchema,
  referralSchema,
  createBadgeSchema,
  updateBadgeSchema,
  createMissionSchema,
  updateMissionSchema,
  createMysteryBoxSchema,
  updateMysteryBoxSchema,
  grantPointsSchema,
  listQuerySchema,
  leaderboardQuerySchema,
  updateLeaderboardConfigSchema,
  distributeLeaderboardRewardsSchema,
} from './gamification.dto';

const router = Router();

// ============================================
// ROUTES CLIENT (authentifiées)
// ============================================

// Overview
router.get('/', requireAuth, gamificationController.getOverview);

// Points
router.get('/points', requireAuth, gamificationController.getPointsBalance);
router.get('/points/history', requireAuth, gamificationController.getPointsHistory);
router.post(
  '/points/use',
  requireAuth,
  validateBody(usePointsSchema),
  gamificationController.usePoints
);

// Badges
router.get('/badges', requireAuth, gamificationController.getBadgesWithProgress);
router.get('/badges/mine', requireAuth, gamificationController.getMyBadges);

// Missions
router.get('/missions', requireAuth, gamificationController.getMissionsWithProgress);
router.post('/missions/:id/claim', requireAuth, gamificationController.claimMissionReward);

// Mystery Boxes
router.get('/mystery-boxes', requireAuth, gamificationController.getAvailableMysteryBoxes);
router.get('/mystery-boxes/mine', requireAuth, gamificationController.getMyMysteryBoxes);
router.post('/mystery-boxes/:id/buy', requireAuth, gamificationController.buyMysteryBox);
router.post('/mystery-boxes/:id/open', requireAuth, gamificationController.openMysteryBox);

// Streak
router.get('/streak', requireAuth, gamificationController.getStreak);

// Rewards (bons de réduction / livraison gratuite)
router.get('/rewards', requireAuth, gamificationController.getMyRewards);

// Referral
router.get('/referral', requireAuth, gamificationController.getMyReferralCode);
router.post('/referral/generate', requireAuth, gamificationController.generateReferralCode);
router.post(
  '/referral/use',
  requireAuth,
  validateBody(referralSchema),
  gamificationController.useReferralCode
);

// Leaderboard
router.get(
  '/leaderboard',
  requireAuth,
  validateQuery(leaderboardQuerySchema),
  gamificationController.getLeaderboard
);
router.get('/leaderboard/configs', requireAuth, gamificationController.getLeaderboardConfigsPublic);

// ============================================
// ROUTES ADMIN
// ============================================
const adminRouter = Router();

// Badges
adminRouter.get(
  '/badges',
  requireAdmin,
  validateQuery(listQuerySchema),
  gamificationController.listBadges
);
adminRouter.post(
  '/badges',
  requireAdmin,
  validateBody(createBadgeSchema),
  gamificationController.createBadge
);
adminRouter.put(
  '/badges/:id',
  requireAdmin,
  validateBody(updateBadgeSchema),
  gamificationController.updateBadge
);
adminRouter.delete('/badges/:id', requireAdmin, gamificationController.deleteBadge);

// Missions
adminRouter.get(
  '/missions',
  requireAdmin,
  validateQuery(listQuerySchema),
  gamificationController.listMissions
);
adminRouter.post(
  '/missions',
  requireAdmin,
  validateBody(createMissionSchema),
  gamificationController.createMission
);
adminRouter.put(
  '/missions/:id',
  requireAdmin,
  validateBody(updateMissionSchema),
  gamificationController.updateMission
);
adminRouter.delete('/missions/:id', requireAdmin, gamificationController.deleteMission);

// Mystery Boxes
adminRouter.get(
  '/mystery-boxes',
  requireAdmin,
  validateQuery(listQuerySchema),
  gamificationController.listMysteryBoxes
);
adminRouter.post(
  '/mystery-boxes',
  requireAdmin,
  validateBody(createMysteryBoxSchema),
  gamificationController.createMysteryBox
);
adminRouter.put(
  '/mystery-boxes/:id',
  requireAdmin,
  validateBody(updateMysteryBoxSchema),
  gamificationController.updateMysteryBox
);
adminRouter.delete('/mystery-boxes/:id', requireAdmin, gamificationController.deleteMysteryBox);

// Points Management
adminRouter.post(
  '/points/grant',
  requireAdmin,
  validateBody(grantPointsSchema),
  gamificationController.grantPoints
);

// Stats
adminRouter.get('/stats', requireAdmin, gamificationController.getGamificationStats);

// Config récompenses classement
adminRouter.get('/leaderboard-configs', requireAdmin, gamificationController.listLeaderboardConfigs);
adminRouter.put(
  '/leaderboard-configs/:rank',
  requireAdmin,
  validateBody(updateLeaderboardConfigSchema),
  gamificationController.upsertLeaderboardConfig
);
adminRouter.delete('/leaderboard-configs/:rank', requireAdmin, gamificationController.deleteLeaderboardConfig);

// Classement mensuel admin + distribution (Phase 2)
adminRouter.get('/leaderboard/monthly', requireAdmin, gamificationController.getMonthlyLeaderboard);
adminRouter.post(
  '/leaderboard/distribute-rewards',
  requireAdmin,
  validateBody(distributeLeaderboardRewardsSchema),
  gamificationController.distributeMonthlyRewards
);

export const gamificationRoutes = router;
export const adminGamificationRoutes = adminRouter;
