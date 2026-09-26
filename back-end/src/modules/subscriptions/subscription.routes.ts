import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import { validateBody, validateQuery } from '../../middlewares/validation';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import {
  subscribeSchema,
  updateSubscriptionSchema,
  pauseSubscriptionSchema,
  createPlanSchema,
  updatePlanSchema,
  changePlanStatusSchema,
  listSubscriptionsQuerySchema,
  adminSubscriptionActionSchema,
} from './subscription.dto';

const router = Router();

// ============================================
// ROUTES CLIENT - Plans (publiques)
// ============================================

/**
 * GET /api/subscriptions/plans
 * Liste des plans disponibles
 */
router.get('/plans', subscriptionController.getPlans);

/**
 * GET /api/subscriptions/plans/:id
 * Détail d'un plan
 */
router.get('/plans/:id', subscriptionController.getPlanById);

// ============================================
// ROUTES CLIENT - Subscriptions (authentifiées)
// ============================================

/**
 * POST /api/subscriptions
 * Souscrire à un abonnement
 */
router.post(
  '/',
  requireAuth,
  validateBody(subscribeSchema),
  subscriptionController.subscribe
);

/**
 * GET /api/subscriptions/me
 * Mon abonnement actuel
 */
router.get('/me', requireAuth, subscriptionController.getMySubscription);

/**
 * GET /api/subscriptions/history
 * Historique de mes abonnements
 */
router.get('/history', requireAuth, subscriptionController.getMySubscriptionHistory);

/**
 * PUT /api/subscriptions/me
 * Modifier mon abonnement
 */
router.put(
  '/me',
  requireAuth,
  validateBody(updateSubscriptionSchema),
  subscriptionController.updateMySubscription
);

/**
 * POST /api/subscriptions/me/pause
 * Mettre en pause mon abonnement
 */
router.post(
  '/me/pause',
  requireAuth,
  validateBody(pauseSubscriptionSchema),
  subscriptionController.pauseMySubscription
);

/**
 * POST /api/subscriptions/me/resume
 * Reprendre mon abonnement
 */
router.post('/me/resume', requireAuth, subscriptionController.resumeMySubscription);

/**
 * POST /api/subscriptions/me/cancel
 * Annuler mon abonnement
 */
router.post('/me/cancel', requireAuth, subscriptionController.cancelMySubscription);

// ============================================
// ROUTES ADMIN
// ============================================
const adminRouter = Router();

// --- Plans ---

/**
 * GET /api/admin/subscriptions/plans
 * Liste tous les plans
 */
adminRouter.get('/plans', requireAdmin, subscriptionController.getAllPlans);

/**
 * POST /api/admin/subscriptions/plans
 * Créer un plan
 */
adminRouter.post(
  '/plans',
  requireAdmin,
  validateBody(createPlanSchema),
  subscriptionController.createPlan
);

/**
 * PUT /api/admin/subscriptions/plans/:id
 * Modifier un plan
 */
adminRouter.put(
  '/plans/:id',
  requireAdmin,
  validateBody(updatePlanSchema),
  subscriptionController.updatePlan
);

/**
 * DELETE /api/admin/subscriptions/plans/:id
 * Supprimer un plan
 */
adminRouter.delete('/plans/:id', requireAdmin, subscriptionController.deletePlan);

/**
 * PATCH /api/admin/subscriptions/plans/:id/status
 * Activer/Désactiver un plan
 */
adminRouter.patch(
  '/plans/:id/status',
  requireAdmin,
  validateBody(changePlanStatusSchema),
  subscriptionController.changePlanStatus
);

// --- Subscriptions ---

/**
 * GET /api/admin/subscriptions
 * Liste des abonnements
 */
adminRouter.get(
  '/',
  requireAdmin,
  validateQuery(listSubscriptionsQuerySchema),
  subscriptionController.listSubscriptions
);

/**
 * GET /api/admin/subscriptions/stats
 * Statistiques des abonnements
 */
adminRouter.get('/stats', requireAdmin, subscriptionController.getSubscriptionStats);

/**
 * GET /api/admin/subscriptions/:id
 * Détail d'un abonnement
 */
adminRouter.get('/:id', requireAdmin, subscriptionController.getSubscriptionById);

/**
 * POST /api/admin/subscriptions/:id/action
 * Action admin (pause/resume/cancel)
 */
adminRouter.post(
  '/:id/action',
  requireAdmin,
  validateBody(adminSubscriptionActionSchema),
  subscriptionController.adminSubscriptionAction
);

export const subscriptionRoutes = router;
export const adminSubscriptionRoutes = adminRouter;
