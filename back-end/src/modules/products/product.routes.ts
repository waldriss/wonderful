import { Router, Request, Response, NextFunction } from 'express';
import { productController } from './product.controller';
import { authenticate, requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validation';
import { uploadProductImage, validateProductImageMagicBytes } from '../../middlewares/upload.middleware';

/**
 * Multipart/form-data sends everything as strings.
 * This middleware coerces boolean strings and parses JSON-stringified array/object fields
 * so the Zod schema receives the correct types.
 */
function parseMultipartProductBody(req: Request, _res: Response, next: NextFunction) {
  const jsonFields = ['nutrition', 'allergens', 'dietTypes', 'mealTypes', 'dietaryGoals', 'supplements'];
  // removeImages is already a JSON string; it will be parsed in the controller
  const boolFields = ['isNew', 'isOnSale', 'isBestSeller'];

  for (const field of jsonFields) {
    if (typeof req.body[field] === 'string') {
      try { req.body[field] = JSON.parse(req.body[field]); } catch { /* leave as-is, Zod will reject */ }
    }
  }

  for (const field of boolFields) {
    if (req.body[field] === 'true') req.body[field] = true;
    else if (req.body[field] === 'false') req.body[field] = false;
  }

  next();
}
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  changeProductStatusSchema,
  listProductsQuerySchema,
  productIdParamSchema,
} from './product.dto';

// ============================================
// ROUTES PUBLIQUES
// ============================================

const router = Router();

/**
 * GET /api/products/categories
 * Liste des catégories
 * Note: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get('/categories', productController.getCategories);

/**
 * GET /api/products/filters
 * Options de filtres disponibles
 */
router.get('/filters', productController.getFilters);

/**
 * GET /api/products/suggestions
 * Suggestions personnalisées (authentifié)
 */
router.get('/suggestions', authenticate, requireAuth, productController.getSuggestions);

/**
 * GET /api/products
 * Liste des produits avec filtres
 */
router.get(
  '/',
  validateQuery(listProductsQuerySchema),
  productController.listProducts
);

/**
 * GET /api/products/:id
 * Détails d'un produit
 */
router.get(
  '/:id',
  validateParams(productIdParamSchema),
  productController.getProduct
);

export const productRoutes = router;

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

// Toutes les routes admin nécessitent une authentification admin
adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/products
 * Liste des produits (admin)
 */
adminRouter.get(
  '/',
  validateQuery(listProductsQuerySchema),
  productController.listProductsAdmin
);

/**
 * POST /api/admin/products
 * Créer un produit (multipart/form-data avec image)
 */
adminRouter.post(
  '/',
  uploadProductImage,
  validateProductImageMagicBytes,
  parseMultipartProductBody,
  validateBody(createProductSchema),
  productController.createProduct
);

/**
 * GET /api/admin/products/:id
 * Détails d'un produit (admin)
 */
adminRouter.get(
  '/:id',
  validateParams(productIdParamSchema),
  productController.getProductAdmin
);

/**
 * PUT /api/admin/products/:id
 * Modifier un produit (multipart/form-data, image optionnelle)
 */
adminRouter.put(
  '/:id',
  validateParams(productIdParamSchema),
  uploadProductImage,
  validateProductImageMagicBytes,
  parseMultipartProductBody,
  validateBody(updateProductSchema),
  productController.updateProduct
);

/**
 * DELETE /api/admin/products/:id
 * Supprimer un produit
 */
adminRouter.delete(
  '/:id',
  validateParams(productIdParamSchema),
  productController.deleteProduct
);

/**
 * PATCH /api/admin/products/:id/status
 * Changer le statut d'un produit
 */
adminRouter.patch(
  '/:id/status',
  validateParams(productIdParamSchema),
  validateBody(changeProductStatusSchema),
  productController.changeProductStatus
);

/**
 * PATCH /api/admin/products/:id/stock
 * Mettre à jour le stock d'un produit
 */
adminRouter.patch(
  '/:id/stock',
  validateParams(productIdParamSchema),
  validateBody(updateStockSchema),
  productController.updateStock
);

export const adminProductRoutes = adminRouter;
