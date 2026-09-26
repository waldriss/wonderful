import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDATION
// ============================================

/**
 * Schema pour les paramètres d'analytics
 */
export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

/**
 * Schema pour créer/modifier un paramètre
 */
export const upsertSettingSchema = z.object({
  key: z.string().min(1, 'Clé requise').max(100, 'Clé trop longue'),
  value: z.any(),
  description: z.string().max(500, 'Description trop longue').optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Schema pour les logs d'activité
 */
export const activityLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Schema pour l'export de données
 */
export const exportDataSchema = z.object({
  type: z.enum(['users', 'orders', 'products', 'subscriptions', 'analytics']),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  filters: z.record(z.any()).optional(),
});

// ============================================
// TYPES
// ============================================

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
export type ActivityLogsQuery = z.infer<typeof activityLogsQuerySchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface DashboardStatsResponse {
  // Ventes
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;

  // Utilisateurs
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  usersChange: number;

  // Abonnements
  activeSubscriptions: number;
  subscriptionsChange: number;
  subscriptionRevenue: number;

  // Produits
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Gamification
  totalPointsDistributed: number;
  activeMissions: number;
}

export interface RevenueChartDataResponse {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface TopProductsResponse {
  id: string;
  name: string;
  image: string | null;
  totalSold: number;
  revenue: number;
}

export interface TopCustomersResponse {
  id: string;
  name: string | null;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderStatusDistributionResponse {
  status: string;
  count: number;
  percentage: number;
}

export interface AnalyticsOverviewResponse {
  stats: DashboardStatsResponse;
  revenueChart: RevenueChartDataResponse[];
  topProducts: TopProductsResponse[];
  topCustomers: TopCustomersResponse[];
  orderStatusDistribution: OrderStatusDistributionResponse[];
  recentActivity: ActivityLogResponse[];
}

export interface SettingResponse {
  id: string;
  key: string;
  value: any;
  description: string | null;
  isPublic: boolean;
  updatedAt: Date;
}

export interface ActivityLogResponse {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
  redis: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  lastChecked: Date;
}
