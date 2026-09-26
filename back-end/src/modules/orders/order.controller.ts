import { Request, Response } from 'express';
import { orderService } from './order.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { OrderStatus, UserStatus, UserRole } from '@prisma/client';
import { createBadRequestError } from '../../utils/errors';
import prisma from '../../lib/prisma';
import { randomUUID } from 'crypto';

/**
 * Controller pour les endpoints commandes
 */
export class OrderController {
  // ============================================
  // ROUTES CLIENT
  // ============================================

  /**
   * POST /api/orders
   * Créer une commande (authentifié ou invité)
   */
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    let userId: string;

    if (req.user) {
      // Utilisateur authentifié
      userId = req.user.id;
    } else {
      // Invité — guestEmail obligatoire
      const { guestName, guestEmail, guestPhone } = req.body as {
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
      };

      if (!guestEmail) {
        throw createBadRequestError('Email requis pour passer une commande sans compte');
      }
      if (!guestName) {
        throw createBadRequestError('Nom requis pour passer une commande sans compte');
      }
      if (!guestPhone) {
        throw createBadRequestError('Numéro de téléphone requis pour passer une commande sans compte');
      }

      // Trouver ou créer un compte invité
      const existing = await prisma.user.findUnique({ where: { email: guestEmail } });
      if (existing) {
        userId = existing.id;
        // Mettre à jour le numéro de téléphone si manquant
        if (!existing.phone && guestPhone) {
          await prisma.user.update({ where: { id: existing.id }, data: { phone: guestPhone } });
        }
      } else {
        const newUser = await prisma.user.create({
          data: {
            id: randomUUID(),
            email: guestEmail,
            name: guestName,
            phone: guestPhone,
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
            emailVerified: false,
          },
        });
        userId = newUser.id;
      }
    }

    const order = await orderService.createOrder(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: order,
    });
  });

  /**
   * GET /api/orders
   * Mes commandes (historique)
   */
  getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await orderService.getMyOrders(userId, req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/orders/:id
   * Détails d'une commande
   */
  getOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const order = await orderService.getOrder(userId, id);

    res.status(200).json({
      success: true,
      data: order,
    });
  });

  /**
   * POST /api/orders/:id/cancel
   * Annuler une commande
   */
  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await orderService.cancelOrder(userId, id);

    res.status(200).json(result);
  });

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * GET /api/admin/orders
   * Liste des commandes
   */
  listOrdersAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.listOrdersAdmin(req.query as any);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/admin/orders/:id
   * Détails d'une commande
   */
  getOrderAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await orderService.getOrderAdmin(id);

    res.status(200).json({
      success: true,
      data: order,
    });
  });

  /**
   * PATCH /api/admin/orders/:id/status
   * Changer le statut d'une commande
   */
  changeOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminName = req.user?.name || 'Admin';
    
    const result = await orderService.changeOrderStatus(
      id,
      status as OrderStatus,
      note,
      adminName
    );

    res.status(200).json(result);
  });

  /**
   * GET /api/admin/orders/export
   * Exporter les commandes en CSV
   */
  exportOrders = asyncHandler(async (req: Request, res: Response) => {
    const { status, dateFrom, dateTo } = req.query;

    const filters = {
      status: status as OrderStatus | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const csvContent = await orderService.exportOrders(filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
    res.status(200).send(csvContent);
  });

  /**
   * GET /api/admin/orders/stats
   * Statistiques des commandes
   */
  getOrderStats = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;
    
    const stats = await orderService.getOrderStats(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * PATCH /api/admin/orders/:id/phone-confirmation
   * Mettre à jour la confirmation téléphonique d'une commande
   */
  updatePhoneConfirmation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await orderService.updatePhoneConfirmation(id, req.body);
    res.status(200).json(result);
  });
}

export const orderController = new OrderController();
