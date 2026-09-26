import { Prisma, OrderStatus, PaymentStatus, PaymentMethod, PhoneConfirmationStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import {
  CreateOrderDto,
  ListMyOrdersQueryDto,
  ListOrdersAdminQueryDto,
  UpdatePhoneConfirmationDto,
} from './order.dto';

/**
 * Repository pour les opérations de base de données commandes
 */
export class OrderRepository {
  /**
   * Include standard pour les commandes
   */
  private readonly orderInclude = {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        supplements: true,
      },
    },
    statusHistory: {
      orderBy: { timestamp: 'desc' as const },
    },
    promoCode: {
      select: { code: true },
    },
  };

  /**
   * Générer un numéro de commande unique
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CMD-${year}`;

    // Récupérer le dernier numéro de commande de l'année
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: { startsWith: prefix },
      },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Récupérer une commande par ID
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        ...this.orderInclude,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            orderTrustStatus: true,
            orderTrustNote: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer une commande par numéro
   */
  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: this.orderInclude,
    });
  }

  /**
   * Créer une commande
   */
  async create(
    userId: string,
    data: {
      orderNumber: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
        supplements?: Array<{ supplementId: string; name: string; price: number; quantity: number }>;
      }>;
      subtotal: number;
      deliveryFee: number;
      discount: number;
      total: number;
      deliveryAddress: string;
      deliveryCity: string;
      deliveryPostalCode: string;
      deliveryDate?: Date;
      deliveryTimeSlot?: string;
      deliveryNotes?: string;
      paymentMethod: PaymentMethod;
      promoCodeId?: string;
      userRewardId?: string;
      gamificationDiscount?: number;
      deliveryZoneId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // Créer la commande
      const order = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          userId,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          discount: data.discount,
          total: data.total,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPostalCode: data.deliveryPostalCode,
          deliveryDate: data.deliveryDate,
          deliveryTimeSlot: data.deliveryTimeSlot,
          deliveryNotes: data.deliveryNotes,
          paymentMethod: data.paymentMethod,
          promoCodeId: data.promoCodeId,
          userRewardId: data.userRewardId,
          gamificationDiscount: data.gamificationDiscount ?? 0,
          deliveryZoneId: data.deliveryZoneId,
          items: {
            // createMany ne supporte pas les relations imbriquées :
            // on utilise create pour attacher les suppléments figés à chaque item
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              supplements: item.supplements?.length
                ? {
                    create: item.supplements.map((s) => ({
                      supplementId: s.supplementId,
                      name: s.name,
                      price: s.price,
                      quantity: s.quantity,
                    })),
                  }
                : undefined,
            })),
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              changedBy: 'Système',
            },
          },
        },
        include: this.orderInclude,
      });

      // Mettre à jour le stock des produits
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Incrémenter l'utilisation du code promo si utilisé
      if (data.promoCodeId) {
        await tx.promoCode.update({
          where: { id: data.promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateStatus(id: string, status: OrderStatus, note?: string, changedBy?: string) {
    return prisma.$transaction(async (tx) => {
      // Mettre à jour le statut
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      // Ajouter à l'historique
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note,
          changedBy,
        },
      });

      return order;
    });
  }

  /**
   * Mettre à jour le statut de paiement
   */
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        ...(paymentStatus === PaymentStatus.PAID && { paidAt: new Date() }),
      },
    });
  }

  /**
   * Annuler une commande (restaurer le stock)
   */
  async cancel(id: string, reason?: string, changedBy?: string) {
    return prisma.$transaction(async (tx) => {
      // Récupérer la commande avec ses items
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) return null;

      // Restaurer le stock des produits
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Mettre à jour le statut
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Ajouter à l'historique
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          note: reason,
          changedBy,
        },
      });

      return updatedOrder;
    });
  }

  /**
   * Liste des commandes d'un utilisateur
   */
  async findByUser(userId: string, query: ListMyOrdersQueryDto) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Liste des commandes (Admin)
   */
  async findManyAdmin(query: ListOrdersAdminQueryDto) {
    const {
      page,
      limit,
      status,
      paymentStatus,
      search,
      dateFrom,
      dateTo,
      userId,
      sortBy,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (userId) where.userId = userId;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    let orderBy: Prisma.OrderOrderByWithRelationInput;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'total-high':
        orderBy = { total: 'desc' };
        break;
      case 'total-low':
        orderBy = { total: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          ...this.orderInclude,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              orderTrustStatus: true,
              orderTrustNote: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Mettre à jour la confirmation téléphonique d'une commande
   */
  async updatePhoneConfirmation(
    id: string,
    dto: UpdatePhoneConfirmationDto
  ) {
    return prisma.order.update({
      where: { id },
      data: {
        phoneConfirmationStatus: dto.status,
        phoneConfirmedAt: dto.status === PhoneConfirmationStatus.CONFIRMED ? new Date() : undefined,
        phoneConfirmedNumber: dto.phoneNumber ?? undefined,
        phoneConfirmationNote: dto.note ?? undefined,
      },
      include: {
        ...this.orderInclude,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            orderTrustStatus: true,
            orderTrustNote: true,
          },
        },
      },
    });
  }

  /**
   * Statistiques des commandes
   */
  async getStats(dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.OrderWhereInput = {};

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const [
      total,
      byStatus,
      revenue,
      avgOrderValue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where,
        _avg: { total: true },
      }),
    ]);

    const statusCounts: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    byStatus.forEach((s) => {
      statusCounts[s.status] = s._count;
    });

    return {
      totalOrders: total,
      byStatus: statusCounts,
      totalRevenue: revenue._sum.total || 0,
      averageOrderValue: Math.round(avgOrderValue._avg.total || 0),
    };
  }

  /**
   * Exporter les commandes (pour CSV)
   */
  async findForExport(filters?: {
    status?: OrderStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
  }

  /**
   * Compter le nombre total de commandes d'un utilisateur (pour les badges)
   */
  async countUserOrders(userId: string): Promise<number> {
    return prisma.order.count({
      where: { userId, status: { notIn: ['CANCELLED'] } },
    });
  }
}

export const orderRepository = new OrderRepository();
