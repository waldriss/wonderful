import { Router } from 'express';
import { supplementController } from './supplement.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams } from '../../middlewares/validation';
import {
  createSupplementSchema,
  updateSupplementSchema,
  supplementIdParamSchema,
} from './supplement.dto';

// ============================================
// ROUTE PUBLIQUE (suppléments actifs)
// ============================================

const publicRouter = Router();

/**
 * GET /api/supplements
 * Liste des suppléments actifs
 */
publicRouter.get('/', supplementController.listActiveSupplements);

export const supplementRoutes = publicRouter;

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/supplements
 * Liste de tous les suppléments (actifs et inactifs)
 */
adminRouter.get('/', supplementController.listSupplements);

/**
 * POST /api/admin/supplements
 * Créer un supplément
 */
adminRouter.post(
  '/',
  validateBody(createSupplementSchema),
  supplementController.createSupplement
);

/**
 * GET /api/admin/supplements/:id
 */
adminRouter.get(
  '/:id',
  validateParams(supplementIdParamSchema),
  supplementController.getSupplement
);

/**
 * PUT /api/admin/supplements/:id
 */
adminRouter.put(
  '/:id',
  validateParams(supplementIdParamSchema),
  validateBody(updateSupplementSchema),
  supplementController.updateSupplement
);

/**
 * DELETE /api/admin/supplements/:id
 */
adminRouter.delete(
  '/:id',
  validateParams(supplementIdParamSchema),
  supplementController.deleteSupplement
);

export const adminSupplementRoutes = adminRouter;