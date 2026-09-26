import { Router } from 'express';
import { orderController } from './order.controller';
import { cartController } from './cart.controller';
import { authenticate, requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validation';
import {
  createOrderSchema,
  listMyOrdersQuerySchema,
  listOrdersAdminQuerySchema,
  changeOrderStatusSchema,
  orderIdParamSchema,
  updatePhoneConfirmationSchema,
  addCartItemSchema,
  updateCartItemQuantitySchema,
  mergeCartSchema,
} from './order.dto';

// ============================================
// ROUTES CLIENT
// ============================================

const router = Router();

/**
 * POST /api/orders
 * Créer une commande — accessible aux invités ET aux utilisateurs authentifiés
 */
router.post(
  '/',
  authenticate,
  validateBody(createOrderSchema),
  orderController.createOrder
);

// Toutes les autres routes commandes nécessitent une authentification
router.use(authenticate, requireAuth);

// ============================================
// ROUTES PANIER (CART)
// ============================================

/**
 * GET /api/orders/cart
 * Récupérer le panier
 */
router.get('/cart', cartController.getCart);

/**
 * POST /api/orders/cart/merge
 * Fusionner panier local → serveur (doit être AVANT /cart/:itemId)
 */
router.post(
  '/cart/merge',
  validateBody(mergeCartSchema),
  cartController.mergeCart
);

/**
 * POST /api/orders/cart
 * Ajouter un item au panier (avec suppléments optionnels)
 */
router.post(
  '/cart',
  validateBody(addCartItemSchema),
  cartController.addItem
);

/**
 * DELETE /api/orders/cart
 * Vider le panier
 */
router.delete('/cart', cartController.clearCart);

/**
 * PATCH /api/orders/cart/:itemId
 * Mettre à jour la quantité d'une ligne précise
 */
router.patch(
  '/cart/:itemId',
  validateBody(updateCartItemQuantitySchema),
  cartController.updateItemQuantity
);

/**
 * DELETE /api/orders/cart/:itemId
 * Retirer une ligne précise du panier
 */
router.delete('/cart/:itemId', cartController.removeItem);

/**
 * GET /api/orders
 * Mes commandes (historique)
 */
router.get(
  '/',
  validateQuery(listMyOrdersQuerySchema),
  orderController.getMyOrders
);

/**
 * GET /api/orders/:id
 * Détails d'une commande
 */
router.get(
  '/:id',
  validateParams(orderIdParamSchema),
  orderController.getOrder
);

/**
 * POST /api/orders/:id/cancel
 * Annuler une commande
 */
router.post(
  '/:id/cancel',
  validateParams(orderIdParamSchema),
  orderController.cancelOrder
);

export const orderRoutes = router;

// ============================================
// ROUTES ADMIN
// ============================================

const adminRouter = Router();

// Routes admin nécessitent une authentification admin
adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/orders
 * Liste des commandes
 */
adminRouter.get(
  '/',
  validateQuery(listOrdersAdminQuerySchema),
  orderController.listOrdersAdmin
);

/**
 * GET /api/admin/orders/export
 * Exporter les commandes en CSV
 * Note: Cette route doit être AVANT /:id
 */
adminRouter.get('/export', orderController.exportOrders);

/**
 * GET /api/admin/orders/stats
 * Statistiques des commandes
 */
adminRouter.get('/stats', orderController.getOrderStats);

/**
 * GET /api/admin/orders/:id
 * Détails d'une commande
 */
adminRouter.get(
  '/:id',
  validateParams(orderIdParamSchema),
  orderController.getOrderAdmin
);

/**
 * PATCH /api/admin/orders/:id/status
 * Changer le statut d'une commande
 */
adminRouter.patch(
  '/:id/status',
  validateParams(orderIdParamSchema),
  validateBody(changeOrderStatusSchema),
  orderController.changeOrderStatus
);

/**
 * PATCH /api/admin/orders/:id/phone-confirmation
 * Mettre à jour la confirmation téléphonique
 */
adminRouter.patch(
  '/:id/phone-confirmation',
  validateParams(orderIdParamSchema),
  validateBody(updatePhoneConfirmationSchema),
  orderController.updatePhoneConfirmation
);

export const adminOrderRoutes = adminRouter;
