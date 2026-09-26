import { adminRepository } from './admin.repository';
import { AnalyticsQuery } from './admin.dto';
import { createNotFoundError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

// Types for responses
interface DashboardStatsResponse {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  usersChange: number;
  activeSubscriptions: number;
  subscriptionsChange: number;
  subscriptionRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

interface TopProductResponse {
  id: string;
  name: string;
  image: string | null;
  totalSold: number;
  revenue: number;
}

interface TopCustomersResponse {
  id: string;
  name: string | null;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

interface RevenueChartData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface SettingResponse {
  key: string;
  value: unknown;
}

interface AppSetting {
  id: string;
  key: string;
  value: Prisma.JsonValue;
}

/**
 * Service pour la logique métier admin
 */
export class AdminService {
  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================

  /**
   * Statistiques du dashboard
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    // Dates pour les comparaisons
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Stats actuelles
    const [
      currentSales,
      previousSales,
      userStats,
      subscriptionStats,
      productStats,
    ] = await Promise.all([
      adminRepository.getSalesStats(thisMonthStart, now),
      adminRepository.getSalesStats(lastMonthStart, lastMonthEnd),
      adminRepository.getUserStats(),
      adminRepository.getSubscriptionStats(),
      adminRepository.getProductStats(),
    ]);

    // Calcul des variations
    const revenueChange = previousSales.totalRevenue > 0
      ? Math.round(((currentSales.totalRevenue - previousSales.totalRevenue) / previousSales.totalRevenue) * 100)
      : 0;

    const ordersChange = previousSales.totalOrders > 0
      ? Math.round(((currentSales.totalOrders - previousSales.totalOrders) / previousSales.totalOrders) * 100)
      : 0;

    const aovChange = previousSales.averageOrderValue > 0
      ? Math.round(((currentSales.averageOrderValue - previousSales.averageOrderValue) / previousSales.averageOrderValue) * 100)
      : 0;

    return {
      // Ventes
      totalRevenue: currentSales.totalRevenue,
      revenueChange,
      totalOrders: currentSales.totalOrders,
      ordersChange,
      averageOrderValue: Math.round(currentSales.averageOrderValue * 100) / 100,
      aovChange,

      // Utilisateurs
      totalUsers: userStats.totalUsers,
      newUsersToday: userStats.newUsersToday,
      activeUsers: userStats.activeUsers,
      usersChange: 0, // Simplified

      // Abonnements
      activeSubscriptions: subscriptionStats.activeSubscriptions,
      subscriptionsChange: 0, // Simplified
      subscriptionRevenue: subscriptionStats.subscriptionRevenue,

      // Produits
      totalProducts: productStats.totalProducts,
      lowStockProducts: productStats.lowStockProducts,
      outOfStockProducts: productStats.outOfStockProducts,
    };
  }

  /**
   * Vue d'ensemble analytics
   */
  async getAnalyticsOverview(query: AnalyticsQuery) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const [
      stats,
      revenueChart,
      topProducts,
      topCustomers,
      orderStatusDistribution,
    ] = await Promise.all([
      this.getDashboardStats(),
      adminRepository.getRevenueByPeriod(query.period, startDate, endDate),
      adminRepository.getTopProducts(10, startDate, endDate),
      adminRepository.getTopCustomers(10, startDate, endDate),
      adminRepository.getOrderStatusDistribution(startDate, endDate),
    ]);

    return {
      stats,
      revenueChart,
      topProducts,
      topCustomers,
      orderStatusDistribution,
    };
  }

  /**
   * Données du graphique de revenus
   */
  async getRevenueChart(query: AnalyticsQuery): Promise<{ data: RevenueChartData[] }> {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const data = await adminRepository.getRevenueByPeriod(query.period, startDate, endDate);

    return { data };
  }

  /**
   * Top produits
   */
  async getTopProducts(limit: number = 10, startDate?: string, endDate?: string): Promise<{ data: TopProductResponse[] }> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const products = await adminRepository.getTopProducts(limit, start, end);

    return { data: products };
  }

  /**
   * Top clients
   */
  async getTopCustomers(limit: number = 10, startDate?: string, endDate?: string): Promise<{ data: TopCustomersResponse[] }> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const customers = await adminRepository.getTopCustomers(limit, start, end);

    return { data: customers };
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Récupérer tous les paramètres
   */
  async getAllSettings(): Promise<{ settings: SettingResponse[] }> {
    const settings = await adminRepository.getAllSettings();

    return {
      settings: settings.map((s: AppSetting) => this.formatSettingResponse(s)),
    };
  }

  /**
   * Récupérer un paramètre
   */
  async getSetting(key: string): Promise<SettingResponse> {
    const setting = await adminRepository.getSettingByKey(key);

    if (!setting) {
      throw createNotFoundError('Paramètre non trouvé');
    }

    return this.formatSettingResponse(setting);
  }

  /**
   * Créer ou modifier un paramètre
   */
  async upsertSetting(data: { key: string; value: Prisma.InputJsonValue }): Promise<SettingResponse> {
    const setting = await adminRepository.upsertSetting(data);

    return this.formatSettingResponse(setting);
  }

  /**
   * Supprimer un paramètre
   */
  async deleteSetting(key: string): Promise<{ success: boolean; message: string }> {
    const setting = await adminRepository.getSettingByKey(key);

    if (!setting) {
      throw createNotFoundError('Paramètre non trouvé');
    }

    await adminRepository.deleteSetting(key);

    return { success: true, message: 'Paramètre supprimé avec succès' };
  }

  // ============================================
  // SYSTEM HEALTH
  // ============================================

  /**
   * Vérifier l'état du système
   */
  async getSystemHealth() {
    const [databaseStatus, systemStats] = await Promise.all([
      adminRepository.checkDatabaseConnection(),
      adminRepository.getSystemStats(),
    ]);

    return {
      status: databaseStatus.status === 'connected' ? 'healthy' : 'unhealthy',
      database: databaseStatus,
      systemStats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatSettingResponse(setting: AppSetting): SettingResponse {
    return {
      key: setting.key,
      value: setting.value,
    };
  }
}

export const adminService = new AdminService();
