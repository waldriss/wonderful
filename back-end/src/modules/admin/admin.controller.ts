import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AnalyticsQuery } from './admin.dto';

/**
 * Controller pour les endpoints admin
 */
export class AdminController {
  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================

  /**
   * GET /api/admin/dashboard
   * Statistiques du dashboard
   */
  getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * GET /api/admin/analytics
   * Vue d'ensemble analytics
   */
  getAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AnalyticsQuery;
    const result = await adminService.getAnalyticsOverview(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/admin/analytics/revenue
   * Graphique de revenus
   */
  getRevenueChart = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as AnalyticsQuery;
    const result = await adminService.getRevenueChart(query);

    res.status(200).json({
      success: true,
      data: result.data,
    });
  });

  /**
   * GET /api/admin/analytics/top-products
   * Top produits
   */
  getTopProducts = asyncHandler(async (req: Request, res: Response) => {
    const { limit = '10', startDate, endDate } = req.query;
    const result = await adminService.getTopProducts(
      Number(limit),
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json({
      success: true,
      data: result.data,
    });
  });

  /**
   * GET /api/admin/analytics/top-customers
   * Top clients
   */
  getTopCustomers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = '10', startDate, endDate } = req.query;
    const result = await adminService.getTopCustomers(
      Number(limit),
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json({
      success: true,
      data: result.data,
    });
  });

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * GET /api/admin/settings
   * Liste des paramètres
   */
  getAllSettings = asyncHandler(async (_req: Request, res: Response) => {
    const result = await adminService.getAllSettings();

    res.status(200).json({
      success: true,
      data: result.settings,
    });
  });

  /**
   * GET /api/admin/settings/:key
   * Récupérer un paramètre
   */
  getSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await adminService.getSetting(key);

    res.status(200).json({
      success: true,
      data: setting,
    });
  });

  /**
   * POST /api/admin/settings
   * Créer ou modifier un paramètre
   */
  upsertSetting = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.upsertSetting(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * DELETE /api/admin/settings/:key
   * Supprimer un paramètre
   */
  deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const result = await adminService.deleteSetting(key);

    res.status(200).json(result);
  });

  // ============================================
  // SYSTEM HEALTH
  // ============================================

  /**
   * GET /api/admin/health
   * Santé du système
   */
  getSystemHealth = asyncHandler(async (_req: Request, res: Response) => {
    const health = await adminService.getSystemHealth();

    res.status(200).json({
      success: true,
      data: health,
    });
  });
}

export const adminController = new AdminController();
