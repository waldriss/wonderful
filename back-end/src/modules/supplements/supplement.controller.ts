import { Request, Response } from 'express';
import { supplementService } from './supplement.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Controller pour les endpoints suppléments
 */
export class SupplementController {
  /**
   * GET /api/supplements
   * Liste des suppléments actifs (public)
   */
  listActiveSupplements = asyncHandler(async (_req: Request, res: Response) => {
    const supplements = await supplementService.listActiveSupplements();
    res.status(200).json({ success: true, data: supplements });
  });

  /**
   * GET /api/admin/supplements
   * Liste de tous les suppléments (admin)
   */
  listSupplements = asyncHandler(async (_req: Request, res: Response) => {
    const supplements = await supplementService.listSupplements();
    res.status(200).json({ success: true, data: supplements });
  });

  /**
   * GET /api/admin/supplements/:id
   * Détails d'un supplément (admin)
   */
  getSupplement = asyncHandler(async (req: Request, res: Response) => {
    const supplement = await supplementService.getSupplement(req.params.id);
    res.status(200).json({ success: true, data: supplement });
  });

  /**
   * POST /api/admin/supplements
   * Créer un supplément
   */
  createSupplement = asyncHandler(async (req: Request, res: Response) => {
    const supplement = await supplementService.createSupplement(req.body);
    res.status(201).json({
      success: true,
      message: 'Supplément créé avec succès',
      data: supplement,
    });
  });

  /**
   * PUT /api/admin/supplements/:id
   * Modifier un supplément
   */
  updateSupplement = asyncHandler(async (req: Request, res: Response) => {
    const supplement = await supplementService.updateSupplement(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Supplément mis à jour avec succès',
      data: supplement,
    });
  });

  /**
   * DELETE /api/admin/supplements/:id
   * Supprimer un supplément
   */
  deleteSupplement = asyncHandler(async (req: Request, res: Response) => {
    const result = await supplementService.deleteSupplement(req.params.id);
    res.status(200).json(result);
  });
}

export const supplementController = new SupplementController();