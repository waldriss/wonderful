import { UserStatus, UserRole } from '@prisma/client';
import { userRepository } from './user.repository';
import {
  UpdateProfileDto,
  AddressDto,
  ListCustomersQueryDto,
  UserProfileResponse,
  UserDashboardResponse,
  CustomerListResponse,
  UpdateCustomerOrderTrustDto,
} from './user.dto';
import { createNotFoundError, createBadRequestError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { PaginatedResult } from '../../shared/types/pagination';
import prisma from '../../lib/prisma';

/**
 * Service pour la gestion des utilisateurs
 */
export class UserService {
  // ============================================
  // PROFIL UTILISATEUR (Client)
  // ============================================

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createNotFoundError('Utilisateur');
    }

    return this.formatUserProfile(user);
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDto
  ): Promise<UserProfileResponse> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createNotFoundError('Utilisateur');
    }

    const updatedUser = await userRepository.updateProfile(userId, data);

    return this.formatUserProfile(updatedUser);
  }

  /**
   * Mettre à jour l'avatar utilisateur
   */
  async updateAvatar(userId: string, imageUrl: string): Promise<UserProfileResponse> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createNotFoundError('Utilisateur');
    }

    const updatedUser = await userRepository.updateProfile(userId, {
      image: imageUrl,
    });

    return this.formatUserProfile(updatedUser);
  }

  /**
   * Mettre à jour l'adresse utilisateur
   */
  async updateAddress(userId: string, data: AddressDto): Promise<AddressDto> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createNotFoundError('Utilisateur');
    }

    const address = await userRepository.upsertAddress(userId, data);

    return {
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    };
  }

  /**
   * Récupérer les données du dashboard utilisateur
   */
  async getDashboard(userId: string): Promise<UserDashboardResponse> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createNotFoundError('Utilisateur');
    }

    const [stats, recentOrders, subscription] = await Promise.all([
      userRepository.getDashboardStats(userId),
      userRepository.getRecentOrders(userId),
      userRepository.getActiveSubscription(userId),
    ]);

    return {
      profile: this.formatUserProfile(user),
      stats,
      recentOrders,
      activeSubscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan.name,
            status: subscription.status,
            nextDeliveryDate: subscription.nextDeliveryDate,
          }
        : null,
      nextMeals: subscription?.products.map((sp) => ({
        id: sp.product.id,
        name: sp.product.name,
        image: sp.product.image,
        category: sp.product.category,
        calories: sp.product.nutrition?.calories ?? null,
        mealType: sp.product.mealTypes[0]?.name ?? null,
      })) ?? [],
    };
  }

  /**
   * Récupérer les stats nutritionnelles de l'utilisateur
   */
  async getNutrition(userId: string, period: 'week' | 'month' | 'all' = 'week') {
    const user = await userRepository.findById(userId);
    if (!user) throw createNotFoundError('Utilisateur');

    let dateFrom: Date | undefined;
    const now = new Date();
    if (period === 'week') {
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const orders = await userRepository.getNutritionData(userId, dateFrom);

    // Aggregate daily nutrition data
    const dailyMap = new Map<string, {
      date: string;
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      fiber: number;
      meals: number;
    }>();

    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    let totalMeals = 0;

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          meals: 0,
        });
      }

      const day = dailyMap.get(dateKey)!;

      for (const item of order.items) {
        const nutrition = item.product.nutrition;
        if (!nutrition) continue;

        const qty = item.quantity;
        day.calories += nutrition.calories * qty;
        day.proteins += nutrition.proteins * qty;
        day.carbs += nutrition.carbs * qty;
        day.fats += nutrition.fats * qty;
        day.fiber += nutrition.fiber * qty;
        day.meals += qty;

        totalCalories += nutrition.calories * qty;
        totalProteins += nutrition.proteins * qty;
        totalCarbs += nutrition.carbs * qty;
        totalFats += nutrition.fats * qty;
        totalFiber += nutrition.fiber * qty;
        totalMeals += qty;
      }
    }

    const daysCount = dailyMap.size || 1;

    return {
      period,
      summary: {
        avgCalories: Math.round(totalCalories / daysCount),
        avgProteins: Math.round(totalProteins / daysCount),
        avgCarbs: Math.round(totalCarbs / daysCount),
        avgFats: Math.round(totalFats / daysCount),
        avgFiber: Math.round(totalFiber / daysCount),
        totalMeals,
        daysTracked: dailyMap.size,
      },
      daily: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  // ============================================
  // GESTION DES CLIENTS (Admin)
  // ============================================

  /**
   * Liste paginée des clients
   */
  async listCustomers(
    query: ListCustomersQueryDto
  ): Promise<PaginatedResult<CustomerListResponse>> {
    const { data, total } = await userRepository.findCustomers(query);

    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Récupérer les détails d'un client
   */
  async getCustomerDetails(customerId: string) {
    const customer = await userRepository.findCustomerDetails(customerId);

    if (!customer) {
      throw createNotFoundError('Client');
    }

    // Calculer le total dépensé
    const totalSpent = customer.orders?.reduce((sum, order) => sum + order.total, 0) || 0;

    return {
      ...this.formatUserProfile(customer),
      orderTrustStatus: customer.orderTrustStatus,
      orderTrustNote: customer.orderTrustNote,
      orderTrustUpdatedAt: customer.orderTrustUpdatedAt,
      orderTrustUpdatedBy: customer.orderTrustUpdatedBy,
      totalSpent,
      ordersCount: customer._count.orders,
      reviewsCount: customer._count.reviews,
      favoritesCount: customer._count.favorites,
      badgesCount: customer._count.badges,
      points: customer.points
        ? {
            available: customer.points.availablePoints,
            lifetime: customer.points.lifetimeEarned,
          }
        : null,
      streak: customer.streak
        ? {
            current: customer.streak.currentStreak,
            longest: customer.streak.longestStreak,
          }
        : null,
      subscription: customer.subscription
        ? {
            id: customer.subscription.id,
            planName: customer.subscription.plan.name,
            status: customer.subscription.status,
            startDate: customer.subscription.startDate,
            nextDeliveryDate: customer.subscription.nextDeliveryDate,
          }
        : null,
      recentOrders: customer.orders,
      badges: customer.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        unlockedAt: ub.unlockedAt,
      })),
    };
  }

  /**
   * Changer le statut d'un client
   */
  async changeCustomerStatus(
    customerId: string,
    status: UserStatus,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const customer = await userRepository.findById(customerId);

    if (!customer) {
      throw createNotFoundError('Client');
    }

    if (customer.status === status) {
      throw createBadRequestError(`L'utilisateur est déjà ${status.toLowerCase()}`);
    }

    await userRepository.updateStatus(customerId, status);

    return {
      success: true,
      message: `Statut de l'utilisateur changé en ${status.toLowerCase()}`,
    };
  }

  /**
   * Changer le rôle d'un client (Admin)
   */
  async changeCustomerRole(
    customerId: string,
    role: UserRole
  ): Promise<{ success: boolean; message: string }> {
    const customer = await userRepository.findById(customerId);

    if (!customer) {
      throw createNotFoundError('Client');
    }

    if (customer.role === role) {
      throw createBadRequestError(`L'utilisateur a déjà le rôle ${role}`);
    }

    await userRepository.updateRole(customerId, role);

    return {
      success: true,
      message: `Rôle de l'utilisateur changé en ${role}`,
    };
  }

  /**
   * Mettre à jour le statut de confiance d'un client pour les commandes (Admin)
   */
  async updateCustomerOrderTrust(
    customerId: string,
    dto: UpdateCustomerOrderTrustDto,
    adminName?: string
  ): Promise<{ success: boolean; message: string }> {
    const customer = await userRepository.findById(customerId);
    if (!customer) throw createNotFoundError('Client');

    await prisma.user.update({
      where: { id: customerId },
      data: {
        orderTrustStatus: dto.orderTrustStatus,
        orderTrustNote: dto.orderTrustNote ?? null,
        orderTrustUpdatedAt: new Date(),
        orderTrustUpdatedBy: adminName ?? null,
      },
    });

    const labels: Record<string, string> = {
      VERIFIED: 'Vérifié',
      UNRELIABLE: 'Non fiable',
      NONE: 'Aucun',
    };

    return {
      success: true,
      message: `Statut de confiance commande : ${labels[dto.orderTrustStatus] ?? dto.orderTrustStatus}`,
    };
  }

  /**
   * Exporter les clients en CSV
   */
  async exportCustomers(filters?: {
    status?: UserStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<string> {
    const customers = await userRepository.findAllCustomersForExport(filters);

    // Générer le CSV
    const headers = [
      'ID',
      'Email',
      'Nom',
      'Prénom',
      'Téléphone',
      'Statut',
      'Ville',
      'Adresse',
      'Commandes',
      'Total Dépensé',
      'Date Inscription',
      'Dernière Connexion',
    ];

    const rows = customers.map((c) => [
      c.id,
      c.email,
      c.lastName || '',
      c.firstName || '',
      c.phone || '',
      c.status,
      c.address?.city || '',
      c.address?.street || '',
      c._count.orders.toString(),
      c.orders.reduce((sum, o) => sum + o.total, 0).toString(),
      c.createdAt.toISOString(),
      c.lastLoginAt?.toISOString() || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Formater les données utilisateur pour la réponse
   */
  private formatUserProfile(user: any): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      image: user.image,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      address: user.address
        ? {
            street: user.address.street,
            city: user.address.city,
            postalCode: user.address.postalCode,
            country: user.address.country,
          }
        : null,
    };
  }
}

export const userService = new UserService();
