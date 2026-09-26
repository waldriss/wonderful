import { Router } from 'express';
import { favoriteController } from './favorite.controller';
import { authenticate, requireAuth } from '../../middlewares/auth.middleware';
import { validateParams, validateQuery } from '../../middlewares/validation';
import {
  listFavoritesQuerySchema,
  favoriteProductParamSchema,
} from './favorite.dto';

const router = Router();

// Toutes les routes favoris nécessitent une authentification
router.use(authenticate, requireAuth);

/**
 * GET /api/favorites
 * Récupérer mes favoris
 */
router.get(
  '/',
  validateQuery(listFavoritesQuerySchema),
  favoriteController.getFavorites
);

/**
 * GET /api/favorites/ids
 * Récupérer les IDs des produits favoris
 * Note: Cette route doit être AVANT /:productId
 */
router.get('/ids', favoriteController.getFavoriteIds);

/**
 * GET /api/favorites/check/:productId
 * Vérifier si un produit est en favori
 */
router.get(
  '/check/:productId',
  validateParams(favoriteProductParamSchema),
  favoriteController.checkFavorite
);

/**
 * POST /api/favorites/:productId
 * Ajouter un produit aux favoris
 */
router.post(
  '/:productId',
  validateParams(favoriteProductParamSchema),
  favoriteController.addFavorite
);

/**
 * DELETE /api/favorites/:productId
 * Retirer un produit des favoris
 */
router.delete(
  '/:productId',
  validateParams(favoriteProductParamSchema),
  favoriteController.removeFavorite
);

export const favoriteRoutes = router;
