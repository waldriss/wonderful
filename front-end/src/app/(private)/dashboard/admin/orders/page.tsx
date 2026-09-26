"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  Truck,
  Check,
  X,
  Clock,
  Package,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  RefreshCcw,
  Loader2,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  ShieldCheck,
  ShieldAlert,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOrders, useAdminOrderDetail } from "@/lib/api/admin/queries";
import { useUpdateOrderStatus, useUpdatePhoneConfirmation, useUpdateCustomerOrderTrust } from "@/lib/api/admin/mutations";
import type { OrderStatusAPI, PaymentStatusAPI, AdminOrderDetail, PhoneConfirmationStatus, CustomerOrderTrustStatus, UpdateCustomerOrderTrustData } from "@/lib/api/admin/types";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordersData, isLoading, refetch } = useAdminOrders({
    page: currentPage,
    limit: 10,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
    sortBy: "newest",
  });
  const { data: selectedOrder, isLoading: detailLoading } = useAdminOrderDetail(
    selectedOrderId ?? ""
  );
  const updateStatus = useUpdateOrderStatus();
  const updatePhoneConfirmation = useUpdatePhoneConfirmation();
  const updateCustomerTrust = useUpdateCustomerOrderTrust();

  const orders = ordersData?.data ?? [];
  const meta = ordersData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const getStatusConfig = (status: OrderStatusAPI) => {
    switch (status) {
      case "PENDING": return { label: "En attente", color: "bg-yellow-500", icon: Clock };
      case "CONFIRMED": return { label: "Confirmée", color: "bg-blue-500", icon: Check };
      case "PREPARING": return { label: "En préparation", color: "bg-orange-500", icon: ChefHat };
      case "IN_TRANSIT": return { label: "En livraison", color: "bg-purple-500", icon: Truck };
      case "DELIVERED": return { label: "Livrée", color: "bg-green-500", icon: Check };
      case "CANCELLED": return { label: "Annulée", color: "bg-red-500", icon: X };
      default: return { label: status, color: "bg-gray-500", icon: Package };
    }
  };

  const getPaymentStatusConfig = (status: PaymentStatusAPI) => {
    switch (status) {
      case "PAID": return { label: "Payée", color: "text-green-600 bg-green-100" };
      case "PENDING": return { label: "En attente", color: "text-yellow-600 bg-yellow-100" };
      case "REFUNDED": return { label: "Remboursée", color: "text-blue-600 bg-blue-100" };
      case "FAILED": return { label: "Échouée", color: "text-red-600 bg-red-100" };
      default: return { label: status, color: "text-gray-600 bg-gray-100" };
    }
  };

  const getNextStatus = (currentStatus: OrderStatusAPI): OrderStatusAPI | null => {
    const workflow: Record<OrderStatusAPI, OrderStatusAPI | null> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "IN_TRANSIT",
      IN_TRANSIT: "DELIVERED",
      DELIVERED: null,
      CANCELLED: null,
    };
    return workflow[currentStatus];
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatusAPI) => {
    updateStatus.mutate({ id: orderId, data: { status: newStatus } });
  };

  const getPhoneConfirmationConfig = (status: PhoneConfirmationStatus) => {
    switch (status) {
      case "CONFIRMED": return { label: "Confirmé", color: "text-green-600 bg-green-100", icon: PhoneCall };
      case "NO_RESPONSE": return { label: "Sans réponse", color: "text-yellow-600 bg-yellow-100", icon: PhoneMissed };
      case "DECLINED": return { label: "Refusé", color: "text-red-600 bg-red-100", icon: PhoneOff };
      case "PENDING": default: return { label: "En attente", color: "text-gray-500 bg-gray-100", icon: Phone };
    }
  };

  const getTrustConfig = (status: CustomerOrderTrustStatus) => {
    switch (status) {
      case "VERIFIED": return { label: "Client vérifié", color: "text-green-600", icon: ShieldCheck };
      case "UNRELIABLE": return { label: "Non fiable", color: "text-red-500", icon: ShieldAlert };
      default: return null;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    updateStatus.mutate({ id: orderId, data: { status: "CANCELLED" } });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const stats = {
    total: meta?.total ?? 0,
    pending: orders.filter(o => o.status === "PENDING").length,
    inProgress: orders.filter(o => ["CONFIRMED", "PREPARING", "IN_TRANSIT"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    cancelled: orders.filter(o => o.status === "CANCELLED").length,
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
            <ShoppingCart className="w-8 h-8 text-secondary" />
            Gestion Commandes
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {meta?.total ?? 0} commandes au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-10 px-5 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="h-10 px-5 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualiser
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Total</p>
          <p className="text-2xl font-sans font-bold text-secondary-850">{stats.total}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">En attente</p>
          <p className="text-2xl font-sans font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">En cours</p>
          <p className="text-2xl font-sans font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Livrées</p>
          <p className="text-2xl font-sans font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Annulées</p>
          <p className="text-2xl font-sans font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-12 pl-12 pr-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Tous statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmées</option>
            <option value="PREPARING">En préparation</option>
            <option value="IN_TRANSIT">En livraison</option>
            <option value="DELIVERED">Livrées</option>
            <option value="CANCELLED">Annulées</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
            <p className="font-sans text-secondary-850/60">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary/10 bg-secondary/5">
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Commande</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Livraison</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Paiement</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Tél.</th>
                  <th className="text-right px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                  const nextStatus = getNextStatus(order.status);
                  const StatusIcon = statusConfig.icon;
                  const phoneConfig = order.phoneConfirmation
                    ? getPhoneConfirmationConfig(order.phoneConfirmation.status)
                    : getPhoneConfirmationConfig("PENDING");
                  const PhoneIcon = phoneConfig.icon;
                  const trustConfig = order.user?.orderTrustStatus
                    ? getTrustConfig(order.user.orderTrustStatus)
                    : null;

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-sans font-semibold text-secondary-850">{order.orderNumber}</p>
                          <p className="font-sans text-xs text-secondary-850/60">{formatDate(order.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-sans font-medium text-secondary-850">{order.user.name ?? "—"}</p>
                            {trustConfig && (
                              <trustConfig.icon
                                className={cn("w-3.5 h-3.5 shrink-0", trustConfig.color)}
                              />
                            )}
                          </div>
                          <p className="font-sans text-xs text-secondary-850/60">{order.user.phone ?? order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-sans text-sm text-secondary-850">{order.deliveryCity}</p>
                          <p className="font-sans text-xs text-secondary-850/60">{formatDate(order.deliveryDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans font-semibold text-secondary">{order.total.toLocaleString()} DA</p>
                        <p className="font-sans text-xs text-secondary-850/60">{order.items.length} article(s)</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-sans font-semibold", paymentConfig.color)}>
                          {paymentConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-sans font-semibold text-white inline-flex items-center gap-1",
                          statusConfig.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn("px-2 py-1 rounded-full text-xs font-sans font-semibold inline-flex items-center gap-1", phoneConfig.color)}
                          title={order.phoneConfirmation?.confirmedNumber ? `N° : ${order.phoneConfirmation.confirmedNumber}` : undefined}
                        >
                          <PhoneIcon className="w-3 h-3" />
                          {phoneConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedOrderId(order.id)}
                            className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {nextStatus && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStatusChange(order.id, nextStatus)}
                              disabled={updateStatus.isPending}
                              title={`Passer à "${getStatusConfig(nextStatus).label}"`}
                              className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity",
                                getStatusConfig(nextStatus).color
                              )}
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                          )}
                          {order.status === "PENDING" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={updateStatus.isPending}
                              className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/10">
            <p className="text-sm font-sans text-secondary-850/60">
              Page {currentPage} sur {totalPages} • {meta?.total} commandes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Panel */}
      {selectedOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-secondary/20 rounded-3xl p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto"
          >
            {detailLoading || !selectedOrder ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              </div>
            ) : (
              <OrderDetailPanel
                order={selectedOrder}
                onClose={() => setSelectedOrderId(null)}
                onStatusChange={handleStatusChange}
                onCancel={handleCancelOrder}
                getStatusConfig={getStatusConfig}
                getPaymentStatusConfig={getPaymentStatusConfig}
                getNextStatus={getNextStatus}
                getPhoneConfirmationConfig={getPhoneConfirmationConfig}
                getTrustConfig={getTrustConfig}
                onPhoneConfirmation={(id, data) => updatePhoneConfirmation.mutate({ id, data })}
                onTrustUpdate={(userId, data) => updateCustomerTrust.mutate({ id: userId, data })}
                formatDate={formatDate}
                isPending={updateStatus.isPending}
                isPhoneConfirmPending={updatePhoneConfirmation.isPending}
                isTrustPending={updateCustomerTrust.isPending}
              />
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// ORDER DETAIL PANEL
// ============================================================

interface OrderDetailPanelProps {
  order: AdminOrderDetail;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatusAPI) => void;
  onCancel: (id: string) => void;
  getStatusConfig: (s: OrderStatusAPI) => { label: string; color: string; icon: React.ElementType };
  getPaymentStatusConfig: (s: PaymentStatusAPI) => { label: string; color: string };
  getNextStatus: (s: OrderStatusAPI) => OrderStatusAPI | null;
  getPhoneConfirmationConfig: (s: PhoneConfirmationStatus) => { label: string; color: string; icon: React.ElementType };
  getTrustConfig: (s: CustomerOrderTrustStatus) => { label: string; color: string; icon: React.ElementType } | null;
  onPhoneConfirmation: (id: string, data: { status: PhoneConfirmationStatus; phoneNumber?: string; note?: string }) => void;
  onTrustUpdate: (userId: string, data: UpdateCustomerOrderTrustData) => void;
  formatDate: (d: string | null) => string;
  isPending: boolean;
  isPhoneConfirmPending: boolean;
  isTrustPending: boolean;
}

function OrderDetailPanel({
  order,
  onClose,
  onStatusChange,
  onCancel,
  getStatusConfig,
  getPaymentStatusConfig,
  getNextStatus,
  getPhoneConfirmationConfig,
  getTrustConfig,
  onPhoneConfirmation,
  onTrustUpdate,
  formatDate,
  isPending,
  isPhoneConfirmPending,
  isTrustPending,
}: OrderDetailPanelProps) {
  const [phoneNote, setPhoneNote] = useState(order.phoneConfirmation?.note ?? "");
  const [phoneNumber, setPhoneNumber] = useState(order.phoneConfirmation?.confirmedNumber ?? order.user.phone ?? "");
  const [trustNote, setTrustNote] = useState(order.user.orderTrustNote ?? "");
  const statusConfig = getStatusConfig(order.status);
  const nextStatus = getNextStatus(order.status);
  const phoneConfig = getPhoneConfirmationConfig(order.phoneConfirmation?.status ?? "PENDING");
  const trustConfig = getTrustConfig(order.user.orderTrustStatus ?? "NONE");

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-sans font-bold text-secondary-850">{order.orderNumber}</h2>
          <p className="text-sm text-secondary-850/60 font-sans">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("px-3 py-1 rounded-full text-sm font-sans font-semibold text-white", statusConfig.color)}>
            {statusConfig.label}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
          <h3 className="font-sans font-semibold text-secondary-850 mb-2 flex items-center gap-2">
            Client
            {trustConfig && (
              <span className={cn("inline-flex items-center gap-1 text-xs font-sans font-medium", trustConfig.color)}>
                <trustConfig.icon className="w-3.5 h-3.5" />
                {trustConfig.label}
              </span>
            )}
          </h3>
          <p className="font-sans font-medium text-secondary-850">{order.user.name ?? "—"}</p>
          <p className="text-sm text-secondary-850/60 font-sans">{order.user.email}</p>
          {order.user.phone && (
            <p className="text-sm font-sans font-medium text-secondary mt-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {order.user.phone}
            </p>
          )}
          {order.user.orderTrustNote && (
            <p className="text-xs text-secondary-850/50 font-sans mt-1 italic">{order.user.orderTrustNote}</p>
          )}
        </div>
        <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
          <h3 className="font-sans font-semibold text-secondary-850 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            Livraison
          </h3>
          <p className="text-sm text-secondary-850 font-sans">{order.deliveryAddress}</p>
          <p className="text-sm text-secondary-850/60 font-sans">{order.deliveryCity}, {order.deliveryPostalCode}</p>
          {order.deliveryDate && (
            <p className="text-sm text-secondary font-sans font-medium mt-1">
              {formatDate(order.deliveryDate)}{order.deliveryTimeSlot ? ` • ${order.deliveryTimeSlot}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-4">
        <h3 className="font-sans font-semibold text-secondary-850 mb-3">Articles</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-secondary/5 last:border-0">
              <div>
                <p className="font-sans font-medium text-secondary-850">{item.productName}</p>
                <p className="text-sm text-secondary-850/60 font-sans">Qté: {item.quantity} × {item.unitPrice.toLocaleString()} DA</p>
                {item.supplements && item.supplements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.supplements.map((s) => (
                      <span key={s.supplementId} className="text-[11px] font-sans text-secondary-850/60 bg-primary-100/60 border border-secondary/10 rounded px-1.5 py-0.5">
                        + {s.quantity}× {s.name} ({s.price.toLocaleString()} DA)
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="font-sans font-semibold text-secondary">{item.totalPrice.toLocaleString()} DA</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-secondary/10 space-y-1">
          {order.subtotal !== null && (
            <div className="flex justify-between text-sm font-sans text-secondary-850/70">
              <span>Sous-total</span>
              <span>{order.subtotal.toLocaleString()} DA</span>
            </div>
          )}
          {order.deliveryFee !== null && (
            <div className="flex justify-between text-sm font-sans text-secondary-850/70">
              <span>Livraison</span>
              <span>{order.deliveryFee === 0 ? "Gratuite" : `${order.deliveryFee.toLocaleString()} DA`}</span>
            </div>
          )}
          {order.discount !== null && order.discount > 0 && (
            <div className="flex justify-between text-sm font-sans text-green-600">
              <span>Réduction{order.promoCode ? ` (${order.promoCode})` : ""}</span>
              <span>-{order.discount.toLocaleString()} DA</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-secondary/10">
            <p className="font-sans font-semibold text-secondary-850">Total</p>
            <p className="text-xl font-sans font-bold text-secondary">{order.total.toLocaleString()} DA</p>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-4">
        <h3 className="font-sans font-semibold text-secondary-850 mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-secondary" />
          Paiement
        </h3>
        <div className="flex items-center justify-between">
          <p className="font-sans text-secondary-850">
            {order.paymentMethod === "CARD" ? "Carte bancaire" : "Espèces"}
          </p>
          <span className={cn("px-3 py-1 rounded-full text-sm font-sans font-semibold", getPaymentStatusConfig(order.paymentStatus).color)}>
            {getPaymentStatusConfig(order.paymentStatus).label}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.deliveryNotes && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-4">
          <p className="text-sm font-sans text-yellow-800">📝 {order.deliveryNotes}</p>
        </div>
      )}

      {/* Customer Trust */}
      <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-4">
        <h3 className="font-sans font-semibold text-secondary-850 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-secondary" />
          Fiabilité client
          {(() => {
            const tc = getTrustConfig(order.user.orderTrustStatus ?? "NONE");
            return tc ? (
              <span className={cn("ml-auto inline-flex items-center gap-1 text-xs font-sans font-semibold", tc.color)}>
                <tc.icon className="w-3.5 h-3.5" />{tc.label}
              </span>
            ) : null;
          })()}
        </h3>
        <input
          type="text"
          value={trustNote}
          onChange={(e) => setTrustNote(e.target.value)}
          placeholder="Note sur ce client (optionnel)"
          className="w-full h-9 px-3 mb-3 bg-white/50 border border-secondary/20 rounded-lg text-sm font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
        />
        <div className="grid grid-cols-3 gap-2">
          {(["VERIFIED", "NONE", "UNRELIABLE"] as const).map((s) => {
            const cfg = s === "VERIFIED"
              ? { label: "Vérifié", color: "text-green-600 bg-green-50 border-green-200", icon: ShieldCheck }
              : s === "UNRELIABLE"
              ? { label: "Non fiable", color: "text-red-500 bg-red-50 border-red-200", icon: ShieldAlert }
              : { label: "Neutre", color: "text-gray-500 bg-gray-50 border-gray-200", icon: Shield };
            const isActive = (order.user.orderTrustStatus ?? "NONE") === s;
            return (
              <button
                key={s}
                disabled={isTrustPending}
                onClick={() => onTrustUpdate(order.user.id, { orderTrustStatus: s, orderTrustNote: trustNote || undefined })}
                className={cn(
                  "h-9 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1 border-2",
                  isActive ? cfg.color : "border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                )}
              >
                {isTrustPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <cfg.icon className="w-3 h-3" />}
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone Confirmation */}
      <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-4">
        <h3 className="font-sans font-semibold text-secondary-850 mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-secondary" />
          Confirmation téléphonique
          <span className={cn("ml-auto px-2 py-0.5 rounded-full text-xs font-sans font-semibold inline-flex items-center gap-1", phoneConfig.color)}>
            <phoneConfig.icon className="w-3 h-3" />
            {phoneConfig.label}
          </span>
        </h3>
        {order.phoneConfirmation?.confirmedAt && (
          <p className="text-xs text-secondary-850/60 font-sans mb-2">
            Confirmé le {formatDate(order.phoneConfirmation.confirmedAt)}
            {order.phoneConfirmation.confirmedNumber ? ` • ${order.phoneConfirmation.confirmedNumber}` : ""}
          </p>
        )}
        <div className="space-y-2 mt-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Numéro de téléphone utilisé"
            className="w-full h-9 px-3 bg-white/50 border border-secondary/20 rounded-lg text-sm font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
          <input
            type="text"
            value={phoneNote}
            onChange={(e) => setPhoneNote(e.target.value)}
            placeholder="Note (optionnel)"
            className="w-full h-9 px-3 bg-white/50 border border-secondary/20 rounded-lg text-sm font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(["CONFIRMED", "DECLINED"] as const).map((s) => {
              const cfg = getPhoneConfirmationConfig(s);
              const isActive = order.phoneConfirmation?.status === s;
              return (
                <button
                  key={s}
                  disabled={isPhoneConfirmPending}
                  onClick={() => onPhoneConfirmation(order.id, { status: s, phoneNumber: phoneNumber || undefined, note: phoneNote || undefined })}
                  className={cn(
                    "h-9 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1 border-2",
                    isActive
                      ? cn(cfg.color, "border-current opacity-100")
                      : "border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                  )}
                >
                  {isPhoneConfirmPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <cfg.icon className="w-3 h-3" />}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-5">
        <h3 className="font-sans font-semibold text-secondary-850 mb-4">Historique</h3>
        <div className="space-y-3">
          {order.statusHistory.map((entry, index) => {
            const config = getStatusConfig(entry.status);
            const Icon = config.icon;
            return (
              <div key={entry.id ?? index} className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-medium text-secondary-850">{config.label}</p>
                  <p className="text-xs text-secondary-850/60 font-sans">
                    {formatDate(entry.timestamp)}{entry.changedBy ? ` • ${entry.changedBy}` : ""}
                  </p>
                  {entry.note && <p className="text-xs text-secondary-850/50 font-sans mt-0.5">{entry.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {nextStatus && (
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={cn(
              "flex-1 h-12 rounded-full font-sans font-semibold transition-colors duration-200 flex items-center justify-center gap-2 text-white",
              getStatusConfig(nextStatus).color
            )}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Passer à &quot;{getStatusConfig(nextStatus).label}&quot;
          </motion.button>
          {order.status === "PENDING" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isPending}
              onClick={() => onCancel(order.id)}
              className="h-12 px-5 bg-red-100 border-2 border-red-200 text-red-600 rounded-full font-sans font-semibold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </motion.button>
          )}
        </div>
      )}
    </>
  );
}
