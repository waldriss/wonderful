import { Router } from 'express';
import { deliveryZoneController } from './delivery-zone.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams } from '../../middlewares/validation';
import {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
  deliveryZoneIdParamSchema,
} from './delivery-zone.dto';

// ============================================
// ROUTE PUBLIQUE (zones actives pour le checkout)
// ============================================

const publicRouter = Router();

/**
 * GET /api/delivery-zones
 * Liste des zones de livraison actives
 */
publicRouter.get('/', deliveryZoneController.listActiveZones);

export const deliveryZoneRoutes = publicRouter;

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/delivery-zones
 */
adminRouter.get('/', deliveryZoneController.listZones);

/**
 * POST /api/admin/delivery-zones
 */
adminRouter.post(
  '/',
  validateBody(createDeliveryZoneSchema),
  deliveryZoneController.createZone
);

/**
 * GET /api/admin/delivery-zones/:id
 */
adminRouter.get(
  '/:id',
  validateParams(deliveryZoneIdParamSchema),
  deliveryZoneController.getZone
);

/**
 * PUT /api/admin/delivery-zones/:id
 */
adminRouter.put(
  '/:id',
  validateParams(deliveryZoneIdParamSchema),
  validateBody(updateDeliveryZoneSchema),
  deliveryZoneController.updateZone
);

/**
 * DELETE /api/admin/delivery-zones/:id
 */
adminRouter.delete(
  '/:id',
  validateParams(deliveryZoneIdParamSchema),
  deliveryZoneController.deleteZone
);

export const adminDeliveryZoneRoutes = adminRouter;
