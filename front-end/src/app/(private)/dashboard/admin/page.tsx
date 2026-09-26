"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  Star,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStats, useRevenueChart, useTopProducts, useAdminOrders } from "@/lib/api/admin";
import { resolveAppImage } from "@/lib/resolve-image";

export default function AdminDashboardPage() {
  const revenueSkeletonHeights = [32, 48, 56, 40, 68, 52, 44, 60];

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart({ period: 'month' });
  const { data: topProductsData, isLoading: productsLoading } = useTopProducts(5);
  const { data: recentOrdersData, isLoading: ordersLoading } = useAdminOrders({ limit: 5, sortBy: 'newest' });

  const recentOrders = recentOrdersData?.data ?? [];
  const topProducts = topProductsData ?? [];
  const revenueChartData = revenueData ?? [];

  const isLoading = statsLoading || revenueLoading || productsLoading || ordersLoading;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
      case "pending": return { label: "En attente", color: "bg-yellow-500" };
      case "CONFIRMED":
      case "confirmed": return { label: "Confirmée", color: "bg-blue-500" };
      case "PREPARING":
      case "preparing": return { label: "Préparation", color: "bg-orange-500" };
      case "IN_TRANSIT":
      case "in_transit": return { label: "En livraison", color: "bg-purple-500" };
      case "DELIVERED":
      case "delivered": return { label: "Livrée", color: "bg-green-500" };
      case "CANCELLED":
      case "cancelled": return { label: "Annulée", color: "bg-red-500" };
      default: return { label: status, color: "bg-gray-500" };
    }
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(iso).toLocaleDateString('fr-FR');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const maxRevenue = revenueChartData.length > 0
    ? Math.max(...revenueChartData.map(d => d.revenue))
    : 1;

  // Alertes dynamiques basées sur les stats réelles
  const alerts = stats ? [
    ...(stats.lowStockProducts > 0 ? [{
      type: "stock",
      message: `${stats.lowStockProducts} produit(s) avec stock faible`,
      severity: "warning"
    }] : []),
    ...(stats.outOfStockProducts > 0 ? [{
      type: "stock",
      message: `${stats.outOfStockProducts} produit(s) en rupture de stock`,
      severity: "error"
    }] : []),
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850">
            Tableau de bord
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Bienvenue ! Voici un aperçu de votre activité
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-sans text-secondary-850/60">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Dernière mise à jour: À l&apos;instant
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Revenue */}
        <motion.div
          variants={itemVariants}
          className="bg-card border-2 border-secondary/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm font-sans font-semibold",
              (stats?.revenueChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {(stats?.revenueChange ?? 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(stats?.revenueChange ?? 0)}%
            </div>
          </div>
          <p className="text-sm font-sans font-medium text-secondary-850/60 mb-1">
            Revenus ce mois
          </p>
          <p className="text-2xl font-sans font-bold text-secondary-850">
            {statsLoading ? (
              <span className="inline-block w-24 h-7 bg-secondary/10 rounded animate-pulse" />
            ) : (
              `${(stats?.totalRevenue ?? 0).toLocaleString()} DA`
            )}
          </p>
          <p className="text-xs font-sans text-secondary-850/50 mt-2">
            Panier moyen: {(stats?.averageOrderValue ?? 0).toLocaleString()} DA
          </p>
        </motion.div>

        {/* Orders */}
        <motion.div
          variants={itemVariants}
          className="bg-card border-2 border-secondary/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <Link 
              href="/dashboard/admin/orders"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm font-sans font-medium text-secondary-850/60 mb-1">
            Commandes ce mois
          </p>
          <p className="text-2xl font-sans font-bold text-secondary-850">
            {statsLoading ? (
              <span className="inline-block w-16 h-7 bg-secondary/10 rounded animate-pulse" />
            ) : (
              stats?.totalOrders ?? 0
            )}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-sans">
            <span className={cn(
              "flex items-center gap-1",
              (stats?.ordersChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {(stats?.ordersChange ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stats?.ordersChange ?? 0)}% vs mois dernier
            </span>
          </div>
        </motion.div>

        {/* Customers */}
        <motion.div
          variants={itemVariants}
          className="bg-card border-2 border-secondary/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <Link 
              href="/dashboard/admin/customers"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm font-sans font-medium text-secondary-850/60 mb-1">
            Clients totaux
          </p>
          <p className="text-2xl font-sans font-bold text-secondary-850">
            {statsLoading ? (
              <span className="inline-block w-20 h-7 bg-secondary/10 rounded animate-pulse" />
            ) : (
              (stats?.totalUsers ?? 0).toLocaleString()
            )}
          </p>
          <p className="text-xs font-sans text-secondary-850/50 mt-2">
            +{stats?.newUsersToday ?? 0} aujourd&apos;hui · {stats?.activeSubscriptions ?? 0} abonnés
          </p>
        </motion.div>

        {/* Products */}
        <motion.div
          variants={itemVariants}
          className="bg-card border-2 border-secondary/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <Link 
              href="/dashboard/admin/products"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm font-sans font-medium text-secondary-850/60 mb-1">
            Produits actifs
          </p>
          <p className="text-2xl font-sans font-bold text-secondary-850">
            {statsLoading ? (
              <span className="inline-block w-12 h-7 bg-secondary/10 rounded animate-pulse" />
            ) : (
              stats?.totalProducts ?? 0
            )}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-sans">
            {(stats?.lowStockProducts ?? 0) > 0 && (
              <span className="text-yellow-600">{stats?.lowStockProducts} stock faible</span>
            )}
            {(stats?.outOfStockProducts ?? 0) > 0 && (
              <span className="text-red-600">{stats?.outOfStockProducts} rupture</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Charts & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-sans font-bold text-secondary-850">
              Revenus du mois
            </h2>
            <Link
              href="/dashboard/admin/analytics"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Analytics
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {revenueLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-secondary/10 rounded-t-lg animate-pulse"
                    style={{ height: `${revenueSkeletonHeights[i % revenueSkeletonHeights.length]}%` }}
                  />
                  <span className="w-6 h-3 bg-secondary/10 rounded animate-pulse" />
                </div>
              ))
            ) : revenueChartData.length === 0 ? (
              <div className="w-full flex items-center justify-center text-secondary-850/40 font-sans text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              revenueChartData.slice(-8).map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-secondary/10 rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="w-full bg-secondary rounded-t-lg mt-auto"
                      style={{ marginTop: 'auto' }}
                    />
                  </div>
                  <span className="text-xs font-sans text-secondary-850/60 truncate w-full text-center">
                    {data.period}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-secondary/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full" />
              <span className="text-sm font-sans text-secondary-850/60">Revenus</span>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <h2 className="text-lg font-sans font-bold text-secondary-850 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Alertes
          </h2>

          <div className="space-y-3">
            {statsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 bg-secondary/10 rounded-xl animate-pulse" />
              ))
            ) : alerts.length === 0 ? (
              <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
                Aucune alerte
              </p>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-xl border-2 text-sm font-sans",
                    alert.severity === "error" && "bg-red-50 border-red-200 text-red-700",
                    alert.severity === "warning" && "bg-yellow-50 border-yellow-200 text-yellow-700",
                    alert.severity === "info" && "bg-blue-50 border-blue-200 text-blue-700"
                  )}
                >
                  {alert.message}
                </div>
              ))
            )}
          </div>

          <Link
            href="/dashboard/admin/products"
            className="block mt-4 text-sm font-sans font-semibold text-secondary hover:underline text-center"
          >
            Gérer le stock →
          </Link>
        </motion.div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-sans font-bold text-secondary-850 flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              Commandes récentes
            </h2>
            <Link 
              href="/dashboard/admin/orders"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Tout voir
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {ordersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-secondary/10 rounded-xl animate-pulse" />
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
                Aucune commande
              </p>
            ) : (
              recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status ?? "PENDING");
                const customerName = order.user?.name ?? order.user?.email ?? 'Client';

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 bg-white/30 rounded-xl border border-secondary/10 hover:border-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans font-semibold text-secondary-850 text-sm">
                          {order.id}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-sans font-semibold text-white",
                          statusConfig.color
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-850/60 font-sans truncate">
                        {customerName} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans font-bold text-secondary-850">
                        {order.total?.toFixed(2)} DA
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-secondary-850/30" />
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-sans font-bold text-secondary-850 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top produits
            </h2>
            <Link 
              href="/dashboard/admin/analytics"
              className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              Analytics
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-secondary/10 rounded-xl animate-pulse" />
              ))
            ) : topProducts.length === 0 ? (
              <p className="text-sm font-sans text-secondary-850/50 text-center py-4">
                Aucune donnée disponible
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 bg-white/30 rounded-xl border border-secondary/10"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-secondary/10 rounded-lg font-sans font-bold text-secondary text-sm">
                    {index + 1}
                  </div>
                  {product.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={resolveAppImage(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-secondary/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-secondary-850 text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-secondary-850/60 font-sans">
                      {product.totalSold} vendus
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-secondary text-sm">
                      {product.revenue.toLocaleString()} DA
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
      >
        <h2 className="text-lg font-sans font-bold text-secondary-850 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Nouvelle commande", href: "/dashboard/admin/orders", icon: ShoppingCart },
            { label: "Ajouter produit", href: "/dashboard/admin/products", icon: Package },
            { label: "Voir avis", href: "/dashboard/admin/reviews", icon: Star },
            { label: "Envoyer notification", href: "/dashboard/admin/marketing", icon: ArrowUpRight },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white/30 rounded-xl border-2 border-secondary/10 hover:border-secondary/30 hover:bg-white/50 transition-all duration-200 group"
            >
              <action.icon className="w-5 h-5 text-secondary" />
              <span className="font-sans font-medium text-secondary-850 text-sm group-hover:text-secondary transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
