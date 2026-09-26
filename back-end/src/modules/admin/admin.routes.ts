import { Router } from 'express';
import { adminController } from './admin.controller';
import { validateQuery, validateBody } from '../../middlewares/validation';
import { requireAdmin, requireSuperAdmin } from '../../middlewares/auth.middleware';
import { analyticsQuerySchema, upsertSettingSchema } from './admin.dto';

const router = Router();

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * GET /api/admin/dashboard
 * Statistiques du dashboard
 */
router.get('/dashboard', requireAdmin, adminController.getDashboardStats);

/**
 * GET /api/admin/analytics
 * Vue d'ensemble analytics
 */
router.get(
  '/analytics',
  requireAdmin,
  validateQuery(analyticsQuerySchema),
  adminController.getAnalyticsOverview
);

/**
 * GET /api/admin/analytics/revenue
 * Graphique de revenus
 */
router.get(
  '/analytics/revenue',
  requireAdmin,
  validateQuery(analyticsQuerySchema),
  adminController.getRevenueChart
);

/**
 * GET /api/admin/analytics/top-products
 * Top produits
 */
router.get('/analytics/top-products', requireAdmin, adminController.getTopProducts);

/**
 * GET /api/admin/analytics/top-customers
 * Top clients
 */
router.get('/analytics/top-customers', requireAdmin, adminController.getTopCustomers);

// ============================================
// SETTINGS
// ============================================

/**
 * GET /api/admin/settings
 * Liste des paramètres
 */
router.get('/settings', requireAdmin, adminController.getAllSettings);

/**
 * GET /api/admin/settings/:key
 * Récupérer un paramètre
 */
router.get('/settings/:key', requireAdmin, adminController.getSetting);

/**
 * POST /api/admin/settings
 * Créer ou modifier un paramètre
 */
router.post(
  '/settings',
  requireSuperAdmin,
  validateBody(upsertSettingSchema),
  adminController.upsertSetting
);

/**
 * DELETE /api/admin/settings/:key
 * Supprimer un paramètre
 */
router.delete('/settings/:key', requireSuperAdmin, adminController.deleteSetting);

// ============================================
// SYSTEM HEALTH
// ============================================

/**
 * GET /api/admin/health
 * Vérifier l'état du système
 */
router.get('/health', requireAdmin, adminController.getSystemHealth);

export default router;
