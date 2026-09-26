import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Repository pour les opérations de base de données admin
 */
export class AdminRepository {
  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Statistiques de ventes
   */
  async getSalesStats(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalRevenue, totalOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { ...where, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { ...where, status: { not: 'CANCELLED' } } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum?.total || 0,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum?.total || 0) / totalOrders : 0,
    };
  }

  /**
   * Statistiques utilisateurs
   */
  async getUserStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(todayStart);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [totalUsers, newUsersToday, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: { gte: lastWeek },
            },
          },
        },
      }),
    ]);

    return { totalUsers, newUsersToday, activeUsers };
  }

  /**
   * Statistiques abonnements
   */
  async getSubscriptionStats() {
    const [activeSubscriptions, subscriptions] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
    ]);

    return {
      activeSubscriptions,
      subscriptionRevenue: subscriptions.reduce((sum, s) => sum + s.plan.basePrice, 0),
    };
  }

  /**
   * Statistiques produits
   */
  async getProductStats() {
    const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'ACTIVE', stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { status: 'ACTIVE', stock: 0 } }),
    ]);

    return { totalProducts, lowStockProducts, outOfStockProducts };
  }

  /**
   * Revenus par période (graphique)
   */
  async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year', startDate?: Date, endDate?: Date) {
    const now = new Date();
    const defaultStartDate = new Date(now);
    
    switch (period) {
      case 'day':
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        break;
      case 'week':
        defaultStartDate.setDate(defaultStartDate.getDate() - 12 * 7);
        break;
      case 'month':
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
        break;
      case 'year':
        defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 5);
        break;
    }

    const start = startDate || defaultStartDate;
    const end = endDate || now;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par période
    const grouped = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      let key: string;
      const date = new Date(order.createdAt);

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
      }

      const existing = grouped.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries()).map(([periodKey, data]) => ({
      period: periodKey,
      revenue: data.revenue,
      orders: data.orders,
      averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
    }));
  }

  /**
   * Top produits vendus
   */
  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderItemWhereInput = {};
    if (startDate || endDate) {
      where.order = { createdAt: {} };
      if (startDate) (where.order.createdAt as Prisma.DateTimeFilter).gte = startDate;
      if (endDate) (where.order.createdAt as Prisma.DateTimeFilter).lte = endDate;
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return topProducts.map((tp) => {
      const product = productMap.get(tp.productId);
      const quantity = tp._sum?.quantity || 0;
      const price = tp._sum?.price || 0;
      return {
        id: tp.productId,
        name: product?.name || 'Inconnu',
        image: product?.image || null,
        totalSold: quantity,
        revenue: quantity * price,
      };
    });
  }

  /**
   * Top clients
   */
  async getTopCustomers(limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = { status: { not: 'CANCELLED' } };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where,
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const userIds = topCustomers.map((c) => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return topCustomers.map((tc) => {
      const user = userMap.get(tc.userId);
      return {
        id: tc.userId,
        name: user?.name || null,
        email: user?.email || 'Inconnu',
        totalOrders: tc._count._all,
        totalSpent: tc._sum.total || 0,
      };
    });
  }

  /**
   * Distribution des statuts de commande
   */
  async getOrderStatusDistribution(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const distribution = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const total = distribution.reduce((sum, d) => sum + d._count._all, 0);

    return distribution.map((d) => ({
      status: d.status,
      count: d._count._all,
      percentage: total > 0 ? Math.round((d._count._all / total) * 100) : 0,
    }));
  }

  // ============================================
  // APP SETTINGS
  // ============================================

  /**
   * Récupérer tous les paramètres
   */
  async getAllSettings() {
    return prisma.appSettings.findMany({
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Récupérer un paramètre par clé
   */
  async getSettingByKey(key: string) {
    return prisma.appSettings.findUnique({ where: { key } });
  }

  /**
   * Créer ou modifier un paramètre
   */
  async upsertSetting(data: { key: string; value: Prisma.InputJsonValue }) {
    return prisma.appSettings.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        value: data.value,
      },
      update: {
        value: data.value,
      },
    });
  }

  /**
   * Supprimer un paramètre
   */
  async deleteSetting(key: string) {
    return prisma.appSettings.delete({ where: { key } });
  }

  // ============================================
  // SYSTEM HEALTH
  // ============================================

  /**
   * Vérifier la connexion à la base de données
   */
  async checkDatabaseConnection(): Promise<{ status: 'connected' | 'disconnected'; latency: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'connected', latency: Date.now() - start };
    } catch {
      return { status: 'disconnected', latency: 0 };
    }
  }

  /**
   * Obtenir des statistiques générales du système
   */
  async getSystemStats() {
    const [usersCount, ordersCount, productsCount, subscriptionsCount] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.subscription.count(),
    ]);

    return {
      users: usersCount,
      orders: ordersCount,
      products: productsCount,
      subscriptions: subscriptionsCount,
    };
  }
}

export const adminRepository = new AdminRepository();
