import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validation';
import {
  updateProfileSchema,
  updateAvatarSchema,
  addressSchema,
  listCustomersQuerySchema,
  changeUserStatusSchema,
  changeUserRoleSchema,
  updateCustomerOrderTrustSchema,
  userIdParamSchema,
} from './user.dto';

const router = Router();

// ============================================
// ROUTES CLIENT - PROFIL UTILISATEUR
// ============================================

// Toutes les routes client nécessitent une authentification
router.use(authenticate, requireAuth);

/**
 * GET /api/users/profile
 * Récupérer le profil de l'utilisateur connecté
 */
router.get('/profile', userController.getProfile);

/**
 * PATCH /api/users/profile
 * Mettre à jour le profil utilisateur
 */
router.patch(
  '/profile',
  validateBody(updateProfileSchema),
  userController.updateProfile
);

/**
 * PATCH /api/users/profile/avatar
 * Mettre à jour l'avatar utilisateur
 */
router.patch(
  '/profile/avatar',
  validateBody(updateAvatarSchema),
  userController.updateAvatar
);

/**
 * PUT /api/users/profile/address
 * Mettre à jour l'adresse utilisateur
 */
router.put(
  '/profile/address',
  validateBody(addressSchema),
  userController.updateAddress
);

/**
 * GET /api/users/dashboard
 * Récupérer les données du dashboard utilisateur
 */
router.get('/dashboard', userController.getDashboard);

/**
 * GET /api/users/nutrition
 * Récupérer les stats nutritionnelles
 */
router.get('/nutrition', userController.getNutrition);

export const userRoutes = router;

// ============================================
// ROUTES ADMIN - GESTION DES CLIENTS
// ============================================

const adminRouter = Router();

// Toutes les routes admin nécessitent une authentification admin
adminRouter.use(authenticate, requireAdmin);

/**
 * GET /api/admin/customers
 * Liste des clients (paginated, filtrable)
 */
adminRouter.get(
  '/',
  validateQuery(listCustomersQuerySchema),
  userController.listCustomers
);

/**
 * GET /api/admin/customers/export
 * Exporter les clients en CSV
 * Note: Cette route doit être AVANT /:id pour éviter les conflits
 */
adminRouter.get('/export', userController.exportCustomers);

/**
 * GET /api/admin/customers/:id
 * Détails d'un client
 */
adminRouter.get(
  '/:id',
  validateParams(userIdParamSchema),
  userController.getCustomerDetails
);

/**
 * PATCH /api/admin/customers/:id/status
 * Changer le statut d'un client
 */
adminRouter.patch(
  '/:id/status',
  validateParams(userIdParamSchema),
  validateBody(changeUserStatusSchema),
  userController.changeCustomerStatus
);

/**
 * PATCH /api/admin/users/:id/role
 * Changer le rôle d'un utilisateur
 */
adminRouter.patch(
  '/:id/role',
  validateParams(userIdParamSchema),
  validateBody(changeUserRoleSchema),
  userController.changeCustomerRole
);

/**
 * PATCH /api/admin/customers/:id/order-trust
 * Mettre à jour le statut de confiance commande
 */
adminRouter.patch(
  '/:id/order-trust',
  validateParams(userIdParamSchema),
  validateBody(updateCustomerOrderTrustSchema),
  userController.updateCustomerOrderTrust
);

export const adminCustomerRoutes = adminRouter;
