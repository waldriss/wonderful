import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserStatus, UserRole } from '@prisma/client';

/**
 * Controller pour les endpoints utilisateur
 */
export class UserController {
  // ============================================
  // PROFIL UTILISATEUR (Client)
  // ============================================

  /**
   * GET /api/users/profile
   * Récupérer le profil de l'utilisateur connecté
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await userService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  /**
   * PATCH /api/users/profile
   * Mettre à jour le profil utilisateur
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await userService.updateProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profile,
    });
  });

  /**
   * PATCH /api/users/profile/avatar
   * Mettre à jour l'avatar utilisateur
   */
  updateAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { image } = req.body;
    const profile = await userService.updateAvatar(userId, image);

    res.status(200).json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      data: profile,
    });
  });

  /**
   * PUT /api/users/profile/address
   * Mettre à jour l'adresse utilisateur
   */
  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const address = await userService.updateAddress(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Adresse mise à jour avec succès',
      data: address,
    });
  });

  /**
   * GET /api/users/dashboard
   * Récupérer les données du dashboard utilisateur
   */
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dashboard = await userService.getDashboard(userId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  });

  /**
   * GET /api/users/nutrition
   * Récupérer les stats nutritionnelles
   */
  getNutrition = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const period = (req.query.period as 'week' | 'month' | 'all') || 'week';
    const nutrition = await userService.getNutrition(userId, period);

    res.status(200).json({
      success: true,
      data: nutrition,
    });
  });

  // ============================================
  // GESTION DES CLIENTS (Admin)
  // ============================================

  /**
   * GET /api/admin/customers
   * Liste des clients (paginated, filtrable)
   */
  listCustomers = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.listCustomers(req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/admin/customers/:id
   * Détails d'un client
   */
  getCustomerDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await userService.getCustomerDetails(id);

    res.status(200).json({
      success: true,
      data: customer,
    });
  });

  /**
   * PATCH /api/admin/customers/:id/status
   * Changer le statut d'un client
   */
  changeCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const result = await userService.changeCustomerStatus(id, status as UserStatus, reason);

    res.status(200).json(result);
  });

  /**
   * PATCH /api/admin/customers/:id/role
   * Changer le rôle d'un client
   */
  changeCustomerRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const result = await userService.changeCustomerRole(id, role as UserRole);

    res.status(200).json(result);
  });

  /**
   * GET /api/admin/customers/export
   * Exporter les clients en CSV
   */
  exportCustomers = asyncHandler(async (req: Request, res: Response) => {
    const { status, dateFrom, dateTo } = req.query;

    const filters = {
      status: status as UserStatus | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const csvContent = await userService.exportCustomers(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=customers-export.csv');
    res.status(200).send(csvContent);
  });

  /**
   * PATCH /api/admin/customers/:id/order-trust
   * Mettre à jour le statut de confiance commande d'un client
   */
  updateCustomerOrderTrust = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminName = req.user?.name || 'Admin';
    const result = await userService.updateCustomerOrderTrust(id, req.body, adminName);
    res.status(200).json(result);
  });
}

export const userController = new UserController();
