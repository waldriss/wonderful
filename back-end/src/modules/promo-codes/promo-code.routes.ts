import { Router } from 'express';
import { promoCodeController } from './promo-code.controller';
import { validateBody, validateQuery } from '../../middlewares/validation';
import { requireAdmin } from '../../middlewares/auth.middleware';
import {
  validatePromoCodeSchema,
  listPromoCodesQuerySchema,
  createPromoCodeSchema,
  updatePromoCodeSchema,
  changePromoCodeStatusSchema,
} from './promo-code.dto';

const router = Router();

// ============================================
// ROUTES CLIENT (authentifié)
// ============================================

/**
 * POST /api/promo-codes/validate
 * Valider un code promo
 */
router.post('/validate', validateBody(validatePromoCodeSchema), promoCodeController.validatePromoCode);

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

/**
 * GET /api/admin/promo-codes
 * Liste des codes promo
 */
adminRouter.get('/', requireAdmin, validateQuery(listPromoCodesQuerySchema), promoCodeController.listPromoCodes);

/**
 * POST /api/admin/promo-codes
 * Créer un code promo
 */
adminRouter.post('/', requireAdmin, validateBody(createPromoCodeSchema), promoCodeController.createPromoCode);

/**
 * PUT /api/admin/promo-codes/:id
 * Modifier un code promo
 */
adminRouter.put('/:id', requireAdmin, validateBody(updatePromoCodeSchema), promoCodeController.updatePromoCode);

/**
 * DELETE /api/admin/promo-codes/:id
 * Supprimer un code promo
 */
adminRouter.delete('/:id', requireAdmin, promoCodeController.deletePromoCode);

/**
 * PATCH /api/admin/promo-codes/:id/status
 * Activer/Désactiver un code promo
 */
adminRouter.patch('/:id/status', requireAdmin, validateBody(changePromoCodeStatusSchema), promoCodeController.changePromoCodeStatus);

export { router as promoCodeRoutes, adminRouter as adminPromoCodeRoutes };
