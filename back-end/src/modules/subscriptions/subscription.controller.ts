import { Request, Response } from 'express';
import { subscriptionService } from './subscription.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Controller pour les endpoints abonnements
 */
export class SubscriptionController {
  // ============================================
  // ROUTES CLIENT - Plans
  // ============================================

  /**
   * GET /api/subscriptions/plans
   * Liste des plans disponibles
   */
  getPlans = asyncHandler(async (_req: Request, res: Response) => {
    const result = await subscriptionService.getPlans();

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/subscriptions/plans/:id
   * Détail d'un plan
   */
  getPlanById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await subscriptionService.getPlanById(id);

    res.status(200).json({
      success: true,
      data: plan,
    });
  });

  // ============================================
  // ROUTES CLIENT - Subscriptions
  // ============================================

  /**
   * POST /api/subscriptions
   * Souscrire à un abonnement
   */
  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const subscription = await subscriptionService.subscribe(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Abonnement souscrit avec succès',
      data: subscription,
    });
  });

  /**
   * GET /api/subscriptions/me
   * Mon abonnement actuel
   */
  getMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const subscription = await subscriptionService.getMySubscription(userId);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  });

  /**
   * GET /api/subscriptions/history
   * Historique de mes abonnements
   */
  getMySubscriptionHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await subscriptionService.getMySubscriptionHistory(userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * PUT /api/subscriptions/me
   * Modifier mon abonnement
   */
  updateMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const subscription = await subscriptionService.updateMySubscription(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Abonnement mis à jour',
      data: subscription,
    });
  });

  /**
   * POST /api/subscriptions/me/pause
   * Mettre en pause mon abonnement
   */
  pauseMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await subscriptionService.pauseMySubscription(userId, req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/subscriptions/me/resume
   * Reprendre mon abonnement
   */
  resumeMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await subscriptionService.resumeMySubscription(userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/subscriptions/me/cancel
   * Annuler mon abonnement
   */
  cancelMySubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { reason } = req.body;
    const result = await subscriptionService.cancelMySubscription(userId, reason);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  // ============================================
  // ROUTES ADMIN - Plans
  // ============================================

  /**
   * GET /api/admin/subscriptions/plans
   * Liste tous les plans (admin)
   */
  getAllPlans = asyncHandler(async (_req: Request, res: Response) => {
    const result = await subscriptionService.getAllPlans();

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/admin/subscriptions/plans
   * Créer un plan
   */
  createPlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await subscriptionService.createPlan(req.body);

    res.status(201).json({
      success: true,
      message: 'Plan créé avec succès',
      data: plan,
    });
  });

  /**
   * PUT /api/admin/subscriptions/plans/:id
   * Modifier un plan
   */
  updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await subscriptionService.updatePlan(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Plan mis à jour',
      data: plan,
    });
  });

  /**
   * DELETE /api/admin/subscriptions/plans/:id
   * Supprimer un plan
   */
  deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await subscriptionService.deletePlan(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * PATCH /api/admin/subscriptions/plans/:id/status
   * Activer/Désactiver un plan
   */
  changePlanStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const result = await subscriptionService.changePlanStatus(id, isActive);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  // ============================================
  // ROUTES ADMIN - Subscriptions
  // ============================================

  /**
   * GET /api/admin/subscriptions
   * Liste des abonnements
   */
  listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const result = await subscriptionService.listSubscriptions(req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/admin/subscriptions/stats
   * Statistiques des abonnements
   */
  getSubscriptionStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await subscriptionService.getSubscriptionStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * GET /api/admin/subscriptions/:id
   * Détail d'un abonnement
   */
  getSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscription = await subscriptionService.getSubscriptionById(id);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  });

  /**
   * POST /api/admin/subscriptions/:id/action
   * Action admin (pause/resume/cancel)
   */
  adminSubscriptionAction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action, reason } = req.body;
    const result = await subscriptionService.adminSubscriptionAction(id, action, reason);

    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export const subscriptionController = new SubscriptionController();
