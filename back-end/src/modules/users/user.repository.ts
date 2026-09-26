import { Prisma, UserStatus, UserRole } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ListCustomersQueryDto } from './user.dto';

/**
 * Repository pour les opérations de base de données utilisateur
 */
export class UserRepository {
  /**
   * Récupérer un utilisateur par ID avec son profil complet
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        address: true,
        points: true,
        streak: true,
        _count: {
          select: {
            orders: true,
            favorites: true,
            badges: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer un utilisateur par email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        address: true,
      },
    });
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(
    id: string,
    data: Prisma.UserUpdateInput
  ) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        address: true,
      },
    });
  }

  /**
   * Mettre à jour la date de dernière connexion
   */
  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Créer ou mettre à jour l'adresse utilisateur
   */
  async upsertAddress(
    userId: string,
    data: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ) {
    return prisma.address.upsert({
      where: { userId },
      create: {
        ...data,
        userId,
      },
      update: data,
    });
  }

  /**
   * Récupérer l'adresse utilisateur
   */
  async getAddress(userId: string) {
    return prisma.address.findUnique({
      where: { userId },
    });
  }

  /**
   * Supprimer l'adresse utilisateur
   */
  async deleteAddress(userId: string) {
    return prisma.address.delete({
      where: { userId },
    });
  }

  /**
   * Récupérer les statistiques du dashboard utilisateur
   */
  async getDashboardStats(userId: string) {
    const [orders, points, streak, badges, favorites] = await Promise.all([
      prisma.order.aggregate({
        where: { userId },
        _count: true,
        _sum: { total: true },
      }),
      prisma.pointsAccount.findUnique({
        where: { userId },
        select: { availablePoints: true },
      }),
      prisma.streak.findUnique({
        where: { userId },
        select: { currentStreak: true },
      }),
      prisma.userBadge.count({
        where: { userId },
      }),
      prisma.favorite.count({
        where: { userId },
      }),
    ]);

    return {
      totalOrders: orders._count,
      totalSpent: orders._sum.total || 0,
      totalPoints: points?.availablePoints || 0,
      currentStreak: streak?.currentStreak || 0,
      badgesCount: badges,
      favoritesCount: favorites,
    };
  }

  /**
   * Récupérer les commandes récentes
   */
  async getRecentOrders(userId: string, limit: number = 5) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });
  }

  /**
   * Récupérer l'abonnement actif avec ses produits
   */
  async getActiveSubscription(userId: string) {
    return prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          select: { name: true },
        },
        products: {
          take: 5,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                category: true,
                nutrition: {
                  select: { calories: true },
                },
                mealTypes: {
                  select: { name: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Liste paginée des clients (Admin)
   */
  async findCustomers(query: ListCustomersQueryDto) {
    const { page, limit, search, status, role, sortBy, sortOrder, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: Prisma.UserWhereInput = {
      role: role || { in: [UserRole.CUSTOMER] }, // Par défaut, uniquement les customers
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    // Requêtes parallèles pour la liste et le total
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { orders: true },
          },
          orders: {
            select: { total: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transformer les données pour inclure totalSpent
    const data = customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      image: customer.image,
      role: customer.role,
      status: customer.status,
      createdAt: customer.createdAt,
      lastLoginAt: customer.lastLoginAt,
      ordersCount: customer._count.orders,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
    }));

    return { data, total };
  }

  /**
   * Récupérer les détails d'un client (Admin)
   */
  async findCustomerDetails(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        address: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        points: true,
        badges: {
          include: {
            badge: true,
          },
        },
        streak: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            favorites: true,
            badges: true,
          },
        },
      },
    });
  }

  /**
   * Changer le statut d'un utilisateur (Admin)
   */
  async updateStatus(id: string, status: UserStatus) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Changer le rôle d'un utilisateur (Admin)
   */
  async updateRole(id: string, role: UserRole) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Exporter les clients en CSV (récupérer toutes les données)
   */
  async findAllCustomersForExport(filters?: {
    status?: UserStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.UserWhereInput = {
      role: UserRole.CUSTOMER,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    return prisma.user.findMany({
      where,
      include: {
        address: true,
        orders: {
          select: { total: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupérer les données nutritionnelles issues des commandes livrées
   */
  async getNutritionData(userId: string, dateFrom?: Date) {
    const where: Prisma.OrderWhereInput = {
      userId,
      status: 'DELIVERED',
    };
    if (dateFrom) {
      where.createdAt = { gte: dateFrom };
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                category: true,
                nutrition: true,
              },
            },
          },
        },
      },
    });
  }
}

export const userRepository = new UserRepository();
