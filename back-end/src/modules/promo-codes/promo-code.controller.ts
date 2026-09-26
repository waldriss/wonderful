import { Request, Response } from 'express';
import { promoCodeService } from './promo-code.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ListPromoCodesQueryDto } from './promo-code.dto';

/**
 * Controller pour les endpoints codes promo
 */
class PromoCodeController {
  // ============================================
  // ROUTE CLIENT
  // ============================================

  /**
   * POST /api/promo-codes/validate
   * Valider un code promo
   */
  validatePromoCode = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await promoCodeService.validatePromoCode(userId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * GET /api/admin/promo-codes
   * Liste des codes promo
   */
  listPromoCodes = asyncHandler(async (req: Request, res: Response) => {
    const result = await promoCodeService.listPromoCodes(req.query as unknown as ListPromoCodesQueryDto);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/admin/promo-codes
   * Créer un code promo
   */
  createPromoCode = asyncHandler(async (req: Request, res: Response) => {
    const promoCode = await promoCodeService.createPromoCode(req.body);

    res.status(201).json({
      success: true,
      message: 'Code promo créé avec succès',
      data: promoCode,
    });
  });

  /**
   * PUT /api/admin/promo-codes/:id
   * Modifier un code promo
   */
  updatePromoCode = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promoCode = await promoCodeService.updatePromoCode(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Code promo mis à jour avec succès',
      data: promoCode,
    });
  });

  /**
   * DELETE /api/admin/promo-codes/:id
   * Supprimer un code promo
   */
  deletePromoCode = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await promoCodeService.deletePromoCode(id);

    res.status(200).json(result);
  });

  /**
   * PATCH /api/admin/promo-codes/:id/status
   * Activer/Désactiver un code promo
   */
  changePromoCodeStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await promoCodeService.changePromoCodeStatus(id, status);

    res.status(200).json(result);
  });
}

export { PromoCodeController };
export const promoCodeController = new PromoCodeController();
