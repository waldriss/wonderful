import { Request, Response } from 'express';
import { favoriteService } from './favorite.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Controller pour les endpoints favoris
 */
export class FavoriteController {
  /**
   * GET /api/favorites
   * Récupérer mes favoris
   */
  getFavorites = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await favoriteService.getFavorites(userId, req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * POST /api/favorites/:productId
   * Ajouter un produit aux favoris
   */
  addFavorite = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;
    const favorite = await favoriteService.addFavorite(userId, productId);

    res.status(201).json({
      success: true,
      message: 'Produit ajouté aux favoris',
      data: favorite,
    });
  });

  /**
   * DELETE /api/favorites/:productId
   * Retirer un produit des favoris
   */
  removeFavorite = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;
    const result = await favoriteService.removeFavorite(userId, productId);

    res.status(200).json(result);
  });

  /**
   * GET /api/favorites/ids
   * Récupérer les IDs des produits favoris (pour le frontend)
   */
  getFavoriteIds = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ids = await favoriteService.getFavoriteIds(userId);

    res.status(200).json({
      success: true,
      data: ids,
    });
  });

  /**
   * GET /api/favorites/check/:productId
   * Vérifier si un produit est en favori
   */
  checkFavorite = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;
    const isFavorite = await favoriteService.isFavorite(userId, productId);

    res.status(200).json({
      success: true,
      data: { isFavorite },
    });
  });
}

export const favoriteController = new FavoriteController();
