import prisma from '../../lib/prisma';
import { Prisma, SubscriptionStatus, SubscriptionPlan, Subscription } from '@prisma/client';
import { CreatePlanInput, UpdatePlanInput, SubscribeInput, ListSubscriptionsQuery } from './subscription.dto';

/**
 * Repository pour les opérations de base de données des abonnements
 */
export class SubscriptionRepository {
  // ============================================
  // PLANS
  // ============================================

  /**
   * Trouver un plan par ID
   */
  async findPlanById(id: string) {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  /**
   * Récupérer tous les plans actifs (pour client)
   */
  async findActivePlans() {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { basePrice: 'asc' },
    });
  }

  /**
   * Récupérer tous les plans (pour admin)
   */
  async findAllPlans() {
    return prisma.subscriptionPlan.findMany({
      orderBy: { basePrice: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  /**
   * Créer un plan
   */
  async createPlan(data: CreatePlanInput) {
    return prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        basePrice: data.basePrice,
        maxProducts: data.maxProducts,
        features: data.features || [],
        discount: data.discount,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Modifier un plan
   */
  async updatePlan(id: string, data: UpdatePlanInput) {
    return prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Supprimer un plan
   */
  async deletePlan(id: string) {
    return prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  /**
   * Compter les abonnements actifs d'un plan
   */
  async countActiveSubscriptionsByPlan(planId: string): Promise<number> {
    return prisma.subscription.count({
      where: {
        planId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  /**
   * Trouver un abonnement par ID
   */
  async findById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Trouver l'abonnement actif d'un utilisateur
   */
  async findActiveByUserId(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        plan: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer l'historique des abonnements d'un utilisateur
   */
  async findByUserId(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Créer un abonnement
   */
  async create(data: SubscribeInput & { userId: string }) {
    return prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        deliveryAddress: data.deliveryAddress,
        deliveryDays: data.deliveryDays,
        deliveryTimeSlot: data.deliveryTimeSlot,
        paymentMethod: data.paymentMethod as 'CARD' | 'CASH',
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });
  }

  /**
   * Modifier un abonnement
   */
  async update(id: string, data: Prisma.SubscriptionUpdateInput) {
    return prisma.subscription.update({
      where: { id },
      data,
      include: {
        plan: true,
      },
    });
  }

  /**
   * Mettre en pause un abonnement
   */
  async pause(id: string, pauseReason?: string) {
    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
        pauseReason,
      },
      include: {
        plan: true,
      },
    });
  }

  /**
   * Reprendre un abonnement
   */
  async resume(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
        pauseReason: null,
      },
      include: {
        plan: true,
      },
    });
  }

  /**
   * Annuler un abonnement
   */
  async cancel(id: string, cancelReason?: string) {
    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason,
      },
      include: {
        plan: true,
      },
    });
  }

  /**
   * Récupérer les abonnements avec filtres et pagination (admin)
   */
  async findMany(query: ListSubscriptionsQuery) {
    const { page, limit, status, planId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (planId) {
      where.planId = planId;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const orderBy: Prisma.SubscriptionOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit };
  }

  /**
   * Récupérer les statistiques des abonnements
   */
  async getStats() {
    const [
      totalSubscriptions,
      statusCounts,
      planDistribution,
      activeSubscriptions,
    ] = await Promise.all([
      // Total
      prisma.subscription.count(),

      // Par statut
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Distribution par plan
      prisma.subscription.groupBy({
        by: ['planId'],
        where: { status: { in: ['ACTIVE', 'PAUSED'] } },
        _count: true,
      }),

      // Abonnements actifs avec plan pour calcul revenus
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
    ]);

    // Calculer les revenus mensuels
    const monthlyRevenue = activeSubscriptions.reduce(
      (sum: number, sub) => sum + sub.plan.basePrice,
      0
    );

    return {
      totalSubscriptions,
      statusCounts,
      planDistribution,
      monthlyRevenue,
    };
  }

  /**
   * Récupérer les abonnements à renouveler
   */
  async findDueForRenewal(date: Date) {
    return prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: date },
      },
      include: {
        plan: true,
        user: true,
      },
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();
