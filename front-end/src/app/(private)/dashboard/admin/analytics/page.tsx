"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
  Repeat,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStats, useRevenueChart, useTopProducts, useTopCustomers, useAnalyticsOverview } from "@/lib/api/admin";
import type { AnalyticsPeriod } from "@/lib/api/admin";
import { formatOrderStatusLabel } from "@/lib/product-labels";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart({ period });
  const { data: topProductsList, isLoading: productsLoading } = useTopProducts(5);
  const { data: topCustomersList, isLoading: customersLoading } = useTopCustomers(5);
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview({ period });

  const revenueChartData = revenueData ?? [];
  const topProducts = topProductsList ?? [];
  const topCustomers = topCustomersList ?? [];
  const orderStatusDist = overview?.orderStatusDistribution ?? [];

  const maxRevenue = revenueChartData.length > 0
    ? Math.max(...revenueChartData.map(d => d.revenue), 1)
    : 1;

  const isLoading = statsLoading || revenueLoading || productsLoading || customersLoading || overviewLoading;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-secondary" />
            Statistiques
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Vue d&apos;ensemble des performances
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary-850/40" />}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
            className="h-10 px-4 bg-card border-2 border-secondary/10 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="day">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </motion.button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Chiffre d'affaires",
            value: stats?.totalRevenue ?? 0,
            change: stats?.revenueChange ?? 0,
            icon: DollarSign,
            format: "currency" as const,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Commandes",
            value: stats?.totalOrders ?? 0,
            change: stats?.ordersChange ?? 0,
            icon: ShoppingCart,
            format: "number" as const,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Clients totaux",
            value: stats?.totalUsers ?? 0,
            change: stats?.usersChange ?? 0,
            icon: Users,
            format: "number" as const,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            label: "Panier moyen",
            value: stats?.averageOrderValue ?? 0,
            change: stats?.aovChange ?? 0,
            icon: Package,
            format: "currency" as const,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border-2 border-secondary/10 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              {statsLoading ? (
                <span className="w-12 h-5 bg-secondary/10 rounded animate-pulse" />
              ) : (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-sans font-semibold",
                  kpi.change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {kpi.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <p className="text-sm font-sans text-secondary-850/60 mb-1">{kpi.label}</p>
            {statsLoading ? (
              <span className="inline-block w-24 h-7 bg-secondary/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-sans font-bold text-secondary-850">
                {kpi.format === "currency" ? `${formatCurrency(kpi.value)} DA` : kpi.value.toLocaleString()}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Revenus par période
          </h3>
          {!revenueLoading && revenueChartData.length > 0 && (
            <p className="text-sm font-sans text-secondary-850/60">
              Total: {formatCurrency(revenueChartData.reduce((acc, d) => acc + d.revenue, 0))} DA
            </p>
          )}
        </div>
        
        <div className="flex items-end gap-3 h-48">
          {revenueLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-secondary/10 rounded-t-lg animate-pulse"
                  style={{ height: `${(i + 1) * 20}px` }}
                />
                <span className="w-6 h-3 bg-secondary/10 rounded animate-pulse" />
              </div>
            ))
          ) : revenueChartData.length === 0 ? (
            <div className="w-full flex items-center justify-center text-secondary-850/40 font-sans text-sm">
              Aucune donnée pour cette période
            </div>
          ) : (
            revenueChartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative" style={{ height: '160px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / maxRevenue) * 160}px` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="w-full bg-secondary rounded-t-lg absolute bottom-0"
                  />
                </div>
                <p className="text-xs font-sans text-secondary-850/60 truncate w-full text-center">
                  {data.period}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            Produits les plus vendus
          </h3>
          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-secondary/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
              Aucune donnée disponible
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-sans font-bold text-sm",
                      index === 0 ? "bg-yellow-100 text-yellow-600" :
                      index === 1 ? "bg-gray-100 text-gray-600" :
                      index === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-secondary/10 text-secondary-850"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-sans font-medium text-secondary-850">{product.name}</p>
                      <p className="text-xs text-secondary-850/60 font-sans">{product.totalSold} vendus</p>
                    </div>
                  </div>
                  <p className="font-sans font-semibold text-secondary">{formatCurrency(product.revenue)} DA</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Meilleurs clients
          </h3>
          {customersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-secondary/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topCustomers.length === 0 ? (
            <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
              Aucune donnée disponible
            </p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-sans font-bold text-sm",
                      index === 0 ? "bg-yellow-100 text-yellow-600" :
                      index === 1 ? "bg-gray-100 text-gray-600" :
                      index === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-secondary/10 text-secondary-850"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-sans font-medium text-secondary-850">
                        {customer.name ?? customer.email}
                      </p>
                      <p className="text-xs text-secondary-850/60 font-sans">
                        {customer.totalOrders} commandes
                      </p>
                    </div>
                  </div>
                  <p className="font-sans font-semibold text-secondary">
                    {formatCurrency(customer.totalSpent)} DA
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-secondary" />
            Distribution des statuts commandes
          </h3>
          {overviewLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-secondary/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orderStatusDist.length === 0 ? (
            <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
              Aucune donnée disponible
            </p>
          ) : (
            <div className="space-y-3">
              {orderStatusDist.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-sans">
                    <span className="text-secondary-850/70 capitalize">
                      {formatOrderStatusLabel(item.status)}
                    </span>
                    <span className="font-semibold text-secondary-850">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-secondary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Overview */}
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg mb-4 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-secondary" />
            Aperçu abonnements
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-xl text-center">
              {statsLoading ? (
                <div className="h-8 bg-green-200/50 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-sans font-bold text-green-600">
                  {stats?.activeSubscriptions ?? 0}
                </p>
              )}
              <p className="text-xs font-sans text-green-700">Abonnés actifs</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              {statsLoading ? (
                <div className="h-8 bg-blue-200/50 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-sans font-bold text-blue-600">
                  {stats?.subscriptionsChange ?? 0 >= 0 ? '+' : ''}{stats?.subscriptionsChange ?? 0}%
                </p>
              )}
              <p className="text-xs font-sans text-blue-700">Évolution</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-secondary-850/70 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Revenus abonnements
              </span>
              {statsLoading ? (
                <span className="w-20 h-5 bg-secondary/10 rounded animate-pulse" />
              ) : (
                <span className="font-sans font-bold text-secondary">
                  {formatCurrency(stats?.subscriptionRevenue ?? 0)} DA
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-secondary-850/70">Utilisateurs actifs</span>
              {statsLoading ? (
                <span className="w-16 h-5 bg-secondary/10 rounded animate-pulse" />
              ) : (
                <span className="font-sans font-semibold text-secondary-850">
                  {stats?.activeUsers ?? 0}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-secondary-850/70">Nouveaux aujourd&apos;hui</span>
              {statsLoading ? (
                <span className="w-12 h-5 bg-secondary/10 rounded animate-pulse" />
              ) : (
                <span className="font-sans font-semibold text-green-600">
                  +{stats?.newUsersToday ?? 0}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
