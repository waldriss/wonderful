"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Ban,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  CreditCard,
  Clock,
  Trophy,
  TrendingUp,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminUsers, useAdminUser } from "@/lib/api/admin/queries";
import { useChangeUserStatus, useChangeUserRole, useUpdateCustomerOrderTrust } from "@/lib/api/admin/mutations";
import { exportCustomersCSV } from "@/lib/api/admin/clientRequests";
import type { AdminCustomer, AdminUserListParams, UserStatus, CustomerOrderTrustStatus } from "@/lib/api/admin/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Actif", color: "bg-green-500" },
  INACTIVE: { label: "Inactif", color: "bg-gray-500" },
  SUSPENDED: { label: "Suspendu", color: "bg-red-500" },
};

const SUBSCRIPTION_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Actif", color: "text-green-600 bg-green-100" },
  PAUSED: { label: "En pause", color: "text-yellow-600 bg-yellow-100" },
  CANCELLED: { label: "Annulé", color: "text-red-600 bg-red-100" },
};

function getInitials(customer: AdminCustomer): string {
  const first = customer.firstName?.[0] ?? customer.name?.[0] ?? "?";
  const last = customer.lastName?.[0] ?? "";
  return (first + last).toUpperCase();
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const params: AdminUserListParams = {
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const { data, isLoading } = useAdminUsers(params);
  const { data: selectedCustomer, isLoading: isLoadingDetail } = useAdminUser(
    selectedCustomerId ?? ""
  );
  const changeStatus = useChangeUserStatus();
  const changeRole = useChangeUserRole();
  const updateTrust = useUpdateCustomerOrderTrust();

  const customers = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  async function handleExport() {
    setIsExporting(true);
    try {
      const csv = await exportCustomersCSV({ status: statusFilter || undefined });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clients-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  }

  function handleStatusChange(id: string, status: UserStatus) {
    changeStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success("Statut mis à jour"),
        onError: () => toast.error("Erreur lors du changement de statut"),
      }
    );
  }

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
            <Users className="w-8 h-8 text-secondary" />
            Gestion Clients
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {isLoading ? "Chargement..." : `${total} clients au total`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          disabled={isExporting}
          className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2 disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Exporter CSV
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 pl-12 pr-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary-850/60" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | "");
                setCurrentPage(1);
              }}
              className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="INACTIVE">Inactifs</option>
              <option value="SUSPENDED">Suspendus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card border-2 border-secondary/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/5 border-b-2 border-secondary/10">
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Client</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Email</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Rôle</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Commandes</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Total dépensé</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Statut</th>
                <th className="text-left p-4 font-sans font-semibold text-secondary-850 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-secondary-850/50 font-sans">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const statusConfig = STATUS_CONFIG[customer.status] ?? STATUS_CONFIG.INACTIVE;
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-secondary/10 hover:bg-white/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-sans font-bold text-sm">
                            {getInitials(customer)}
                          </div>
                          <div>
                            <p className="font-sans font-semibold text-secondary-850">
                              {customer.firstName ?? ""} {customer.lastName ?? customer.name ?? ""}
                            </p>
                            <p className="text-xs text-secondary-850/60 font-sans">
                              Inscrit le{" "}
                              {new Date(customer.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-sans text-secondary-850 text-sm">{customer.email}</p>
                        <p className="text-xs text-secondary-850/60 font-sans">{customer.phone ?? "-"}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-sans font-medium text-secondary-850/70 bg-secondary/10 px-2 py-1 rounded-full">
                          {customer.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-sans font-medium text-secondary-850 text-sm">
                          {customer.ordersCount}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-sans font-semibold text-secondary-850 text-sm">
                          {customer.totalSpent.toLocaleString("fr-FR")} DA
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-sans font-semibold text-white",
                            statusConfig.color
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedCustomerId(customer.id)}
                            className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {customer.status !== "SUSPENDED" ? (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(customer.id, "SUSPENDED")}
                              className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                              title="Suspendre"
                            >
                              <Ban className="w-4 h-4" />
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(customer.id, "ACTIVE")}
                              className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                              title="Réactiver"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t-2 border-secondary/10">
          <p className="text-sm font-sans text-secondary-850/60">
            Page {currentPage} sur {totalPages} · {total} clients
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 bg-white/30 border-2 border-secondary/20 rounded-lg flex items-center justify-center text-secondary-850/60 hover:border-secondary/40 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="px-4 py-2 bg-secondary text-white rounded-lg font-sans font-semibold text-sm">
              {currentPage}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-9 h-9 bg-white/30 border-2 border-secondary/20 rounded-lg flex items-center justify-center text-secondary-850/60 hover:border-secondary/40 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedCustomerId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {isLoadingDetail || !selectedCustomer ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-sans font-bold text-xl">
                      {(selectedCustomer.firstName?.[0] ?? selectedCustomer.name?.[0] ?? "?").toUpperCase()}
                      {(selectedCustomer.lastName?.[0] ?? "").toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-sans font-bold text-secondary-850">
                        {selectedCustomer.firstName ?? ""} {selectedCustomer.lastName ?? selectedCustomer.name ?? ""}
                      </h2>
                      <p className="text-sm text-secondary-850/60 font-sans">
                        Client depuis le{" "}
                        {new Date(selectedCustomer.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerId(null)}
                    className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-secondary" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-sans text-secondary-850/60">Commandes</span>
                    </div>
                    <p className="text-xl font-sans font-bold text-secondary-850">
                      {selectedCustomer.ordersCount}
                    </p>
                  </div>
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-sans text-secondary-850/60">Dépensé</span>
                    </div>
                    <p className="text-xl font-sans font-bold text-secondary-850">
                      {selectedCustomer.totalSpent.toLocaleString("fr-FR")} DA
                    </p>
                  </div>
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-sans text-secondary-850/60">Points</span>
                    </div>
                    <p className="text-xl font-sans font-bold text-secondary">
                      {selectedCustomer.points?.available.toLocaleString("fr-FR") ?? "-"}
                    </p>
                  </div>
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-sans text-secondary-850/60">Avis</span>
                    </div>
                    <p className="text-xl font-sans font-bold text-secondary-850">
                      {selectedCustomer.reviewsCount}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
                  <h3 className="font-sans font-semibold text-secondary-850 mb-3">
                    Informations de contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
                    <div>
                      <p className="text-secondary-850/60 mb-1">Email</p>
                      <p className="text-secondary-850">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-secondary-850/60 mb-1">Téléphone</p>
                      <p className="text-secondary-850">{selectedCustomer.phone ?? "-"}</p>
                    </div>
                    {selectedCustomer.address && (
                      <div className="md:col-span-2">
                        <p className="text-secondary-850/60 mb-1">Adresse</p>
                        <p className="text-secondary-850">
                          {selectedCustomer.address.street},{" "}
                          {selectedCustomer.address.postalCode}{" "}
                          {selectedCustomer.address.city}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Trust Status */}
                {(() => {
                  const trustStatus: CustomerOrderTrustStatus = (selectedCustomer as any).orderTrustStatus ?? "NONE";
                  const trustNote: string | null = (selectedCustomer as any).orderTrustNote ?? null;
                  const trustUpdatedBy: string | null = (selectedCustomer as any).orderTrustUpdatedBy ?? null;
                  const trustUpdatedAt: string | null = (selectedCustomer as any).orderTrustUpdatedAt ?? null;
                  const trustBadges: Record<CustomerOrderTrustStatus, { label: string; color: string; icon: React.ElementType }> = {
                    VERIFIED: { label: "Client vérifié", color: "text-green-600 bg-green-100", icon: ShieldCheck },
                    UNRELIABLE: { label: "Non fiable", color: "text-red-600 bg-red-100", icon: ShieldAlert },
                    NONE: { label: "Non renseigné", color: "text-gray-500 bg-gray-100", icon: Shield },
                  };
                  const badge = trustBadges[trustStatus];
                  const BadgeIcon = badge.icon;
                  return (
                    <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
                      <h3 className="font-sans font-semibold text-secondary-850 mb-3 flex items-center gap-2">
                        Fiabilité commandes
                        <span className={cn("ml-auto px-2 py-0.5 rounded-full text-xs font-sans font-semibold inline-flex items-center gap-1", badge.color)}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </h3>
                      {trustNote && (
                        <p className="text-xs text-secondary-850/60 font-sans italic mb-2">{trustNote}</p>
                      )}
                      {trustUpdatedBy && trustUpdatedAt && (
                        <p className="text-xs text-secondary-850/40 font-sans mb-3">
                          Mis à jour par {trustUpdatedBy} le{" "}
                          {new Date(trustUpdatedAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(["VERIFIED", "UNRELIABLE", "NONE"] as const).map((s) => {
                          const cfg = trustBadges[s];
                          const CfgIcon = cfg.icon;
                          return (
                            <motion.button
                              key={s}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={updateTrust.isPending || trustStatus === s}
                              onClick={() => updateTrust.mutate(
                                { id: selectedCustomer.id, data: { orderTrustStatus: s } },
                                { onSuccess: () => toast.success("Statut mis à jour") }
                              )}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border-2 transition-all",
                                trustStatus === s
                                  ? cn(cfg.color, "border-current")
                                  : "border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                              )}
                            >
                              {updateTrust.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CfgIcon className="w-3 h-3" />}
                              {s === "VERIFIED" ? "Vérifié" : s === "UNRELIABLE" ? "Non fiable" : "Réinitialiser"}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Subscription */}
                {selectedCustomer.subscription && (
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
                    <h3 className="font-sans font-semibold text-secondary-850 mb-3">Abonnement</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans font-medium text-secondary-850">
                          {selectedCustomer.subscription.planName}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-sans font-semibold",
                          SUBSCRIPTION_STATUS_CONFIG[selectedCustomer.subscription.status]?.color ??
                            "text-gray-600 bg-gray-100"
                        )}
                      >
                        {SUBSCRIPTION_STATUS_CONFIG[selectedCustomer.subscription.status]?.label ??
                          selectedCustomer.subscription.status}
                      </span>
                    </div>
                    {selectedCustomer.subscription.nextDeliveryDate && (
                      <p className="text-sm text-secondary-850/60 font-sans mt-2">
                        Prochaine livraison:{" "}
                        {new Date(
                          selectedCustomer.subscription.nextDeliveryDate
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                )}

                {/* Recent Orders */}
                {selectedCustomer.recentOrders.length > 0 && (
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
                    <h3 className="font-sans font-semibold text-secondary-850 mb-3">
                      Commandes récentes
                    </h3>
                    <div className="space-y-2">
                      {selectedCustomer.recentOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between text-sm font-sans"
                        >
                          <span className="text-secondary-850/70">#{order.orderNumber}</span>
                          <span className="text-secondary-850 font-medium">
                            {order.total.toLocaleString("fr-FR")} DA
                          </span>
                          <span className="text-secondary-850/50">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer email
                  </motion.button>
                  {selectedCustomer.status !== "SUSPENDED" ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleStatusChange(selectedCustomer.id, "SUSPENDED");
                        setSelectedCustomerId(null);
                      }}
                      className="h-10 px-5 bg-red-100 border-2 border-red-200 text-red-600 rounded-full font-sans font-semibold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Suspendre
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleStatusChange(selectedCustomer.id, "ACTIVE");
                        setSelectedCustomerId(null);
                      }}
                      className="h-10 px-5 bg-green-100 border-2 border-green-200 text-green-600 rounded-full font-sans font-semibold hover:bg-green-200 transition-colors duration-200 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Réactiver
                    </motion.button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-sans text-secondary-850/60">Rôle :</span>
                    <select
                      defaultValue={selectedCustomer.role}
                      onChange={(e) => {
                        changeRole.mutate(
                          { id: selectedCustomer.id, data: { role: e.target.value as import("@/lib/api/admin/types").UserRole } },
                          {
                            onSuccess: () => toast.success("Rôle mis à jour"),
                            onError: () => toast.error("Erreur lors du changement de rôle"),
                          }
                        );
                      }}
                      className="h-9 px-3 bg-white/30 border-2 border-secondary/20 rounded-lg font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
