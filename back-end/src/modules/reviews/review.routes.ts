import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate, requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validation';
import {
  createReviewSchema,
  updateReviewSchema,
  listProductReviewsQuerySchema,
  listReviewsAdminQuerySchema,
  changeReviewStatusSchema,
  reviewIdParamSchema,
  productIdParamSchema,
} from './review.dto';

// ============================================
// ROUTES CLIENT
// ============================================

const router = Router();

/**
 * GET /api/reviews/product/:productId
 * Avis d'un produit (Public - pas besoin d'auth)
 */
router.get(
  '/product/:productId',
  validateParams(productIdParamSchema),
  validateQuery(listProductReviewsQuerySchema),
  reviewController.getProductReviews
);

// Routes nécessitant une authentification
router.use(authenticate, requireAuth);

/**
 * POST /api/reviews
 * Créer un avis
 */
router.post(
  '/',
  validateBody(createReviewSchema),
  reviewController.createReview
);

/**
 * GET /api/reviews/mine
 * Mes avis
 */
router.get('/mine', reviewController.getMyReviews);

/**
 * PUT /api/reviews/:id
 * Modifier mon avis
 */
router.put(
  '/:id',
  validateParams(reviewIdParamSchema),
  validateBody(updateReviewSchema),
  reviewController.updateMyReview
);

/**
 * DELETE /api/reviews/:id
 * Supprimer mon avis
 */
router.delete(
  '/:id',
  validateParams(reviewIdParamSchema),
  reviewController.deleteMyReview
);

export const reviewRoutes = router;

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

// Toutes les routes admin nécessitent une authentification admin
adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/reviews
 * Liste des avis
 */
adminRouter.get(
  '/',
  validateQuery(listReviewsAdminQuerySchema),
  reviewController.listReviewsAdmin
);

/**
 * GET /api/admin/reviews/stats
 * Statistiques des avis
 */
adminRouter.get('/stats', reviewController.getReviewsStats);

/**
 * PATCH /api/admin/reviews/:id/status
 * Approuver/Rejeter un avis
 */
adminRouter.patch(
  '/:id/status',
  validateParams(reviewIdParamSchema),
  validateBody(changeReviewStatusSchema),
  reviewController.changeReviewStatus
);

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis
 */
adminRouter.delete(
  '/:id',
  validateParams(reviewIdParamSchema),
  reviewController.deleteReview
);

export const adminReviewRoutes = adminRouter;
