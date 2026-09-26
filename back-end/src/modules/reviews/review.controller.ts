import { Request, Response } from 'express';
import { reviewService } from './review.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ReviewStatus } from '@prisma/client';

/**
 * Controller pour les endpoints avis
 */
export class ReviewController {
  // ============================================
  // ROUTES CLIENT
  // ============================================

  /**
   * POST /api/reviews
   * Créer un avis
   */
  createReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const review = await reviewService.createReview(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: review,
    });
  });

  /**
   * GET /api/reviews/product/:productId
   * Avis d'un produit
   */
  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await reviewService.getProductReviews(productId, req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/reviews/mine
   * Mes avis
   */
  getMyReviews = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const reviews = await reviewService.getMyReviews(userId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  });

  /**
   * PUT /api/reviews/:id
   * Modifier mon avis
   */
  updateMyReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const review = await reviewService.updateMyReview(userId, id, req.body);

    res.status(200).json({
      success: true,
      message: 'Avis mis à jour avec succès',
      data: review,
    });
  });

  /**
   * DELETE /api/reviews/:id
   * Supprimer mon avis
   */
  deleteMyReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await reviewService.deleteMyReview(userId, id);

    res.status(200).json(result);
  });

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * GET /api/admin/reviews
   * Liste des avis (Admin)
   */
  listReviewsAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewService.listReviewsAdmin(req.query as any);

    res.status(200).json(result);
  });

  /**
   * PATCH /api/admin/reviews/:id/status
   * Approuver/Rejeter un avis
   */
  changeReviewStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await reviewService.changeReviewStatus(id, status as ReviewStatus);

    res.status(200).json(result);
  });

  /**
   * DELETE /api/admin/reviews/:id
   * Supprimer un avis (Admin)
   */
  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await reviewService.deleteReview(id);

    res.status(200).json(result);
  });

  /**
   * GET /api/admin/reviews/stats
   * Statistiques des avis
   */
  getReviewsStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await reviewService.getReviewsStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export const reviewController = new ReviewController();
