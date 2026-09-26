"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { 
  Package, 
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  X,
  CheckCircle,
  Truck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useOrders, useOrder, useCancelOrder } from "@/lib/api/orders";
import { OrderStatus } from "@/lib/api/orders/types";
import type { Order, OrderSummary } from "@/lib/api/orders/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrders({ page, limit: 20 });
  const { data: selectedOrder, isLoading: isDetailLoading } = useOrder(selectedOrderId ?? "", !!selectedOrderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const orders: OrderSummary[] = data?.data ?? [];

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return { label: "Livré", color: "bg-green-500", icon: CheckCircle, textColor: "text-green-600" };
      case OrderStatus.IN_TRANSIT:
        return { label: "En transit", color: "bg-blue-500", icon: Truck, textColor: "text-blue-600" };
      case OrderStatus.PREPARING:
        return { label: "En préparation", color: "bg-yellow-500", icon: Package, textColor: "text-yellow-600" };
      case OrderStatus.CONFIRMED:
        return { label: "Confirmée", color: "bg-indigo-500", icon: CheckCircle, textColor: "text-indigo-600" };
      case OrderStatus.PENDING:
        return { label: "En attente", color: "bg-orange-500", icon: Clock, textColor: "text-orange-600" };
      case OrderStatus.CANCELLED:
        return { label: "Annulée", color: "bg-red-500", icon: AlertCircle, textColor: "text-red-600" };
      default:
        return { label: status, color: "bg-gray-400", icon: Package, textColor: "text-gray-600" };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "–";
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <Package className="w-8 h-8 text-secondary" />
          Mes Commandes
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Consultez l&apos;historique de vos commandes
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-medium text-secondary-850/60">Total commandes</p>
                <p className="text-3xl font-sans font-bold text-secondary-850 mt-1">{data?.meta.total ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-medium text-secondary-850/60">Montant total</p>
                <p className="text-3xl font-sans font-bold text-secondary-850 mt-1">
                  {(orders ?? []).reduce((sum, o) => sum + o.total, 0).toLocaleString()} DA
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <span className="text-xl font-sans font-bold text-secondary">DA</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-medium text-secondary-850/60">Produits achetés</p>
                <p className="text-3xl font-sans font-bold text-secondary-850 mt-1">
                  {(orders ?? []).reduce((sum, o) => sum + (o.itemsCount ?? 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-12 text-red-500 font-sans">
          Impossible de charger vos commandes. Veuillez réessayer.
        </div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-secondary-850/60 font-sans">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Aucune commande pour le moment</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={order.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedOrderId(order.id)}
                className="bg-card border-2 border-secondary/10 rounded-2xl p-6 cursor-pointer hover:border-secondary/30 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-sans font-bold text-secondary-850 text-lg">{order.orderNumber}</h3>
                      <span className={`px-3 py-1 ${statusConfig.color} text-white text-xs font-sans font-semibold rounded-full flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-sans text-secondary-850/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <span>Le {formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-secondary" />
                        <span>{order.itemsCount} produit{order.itemsCount > 1 ? "s" : ""}</span>
                      </div>
                    </div>

                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-sans font-medium text-secondary-850/60">Total</p>
                      <p className="text-2xl font-sans font-bold text-secondary">{order.total.toLocaleString()} DA</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
                    >
                      Détails <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={!data.meta.hasPrev}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-full border-2 border-secondary/20 font-sans text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="px-4 py-2 font-sans text-sm text-secondary-850/60">
            Page {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            disabled={!data.meta.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-full border-2 border-secondary/20 font-sans text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {isDetailLoading || !selectedOrder ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              </div>
            ) : (<>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-sans font-bold text-secondary-850">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-secondary-850/60 font-sans mt-1">Commandé le {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
              onClick={() => setSelectedOrderId(null)}
                className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {/* Status */}
            {(() => {
              const statusConfig = getStatusConfig(selectedOrder.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div className="mb-6 p-4 bg-white/30 rounded-xl border border-secondary/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${statusConfig.color} rounded-full flex items-center justify-center`}>
                      <StatusIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`font-sans font-bold ${statusConfig.textColor}`}>{statusConfig.label}</p>
                  </div>
                </div>
              );
            })()}

            {/* Products */}
            <div className="mb-6">
              <h3 className="text-lg font-sans font-bold text-secondary-850 mb-4">Produits commandés</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white/30 rounded-xl border border-secondary/10">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-primary-100">
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans font-semibold text-secondary-850">{item.productName}</h4>
                      <p className="text-sm text-secondary-850/60 font-sans">Quantité : {item.quantity}</p>
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
                    <div className="text-right">
                      <p className="font-sans font-bold text-secondary">{item.totalPrice.toLocaleString()} DA</p>
                      <p className="text-xs text-secondary-850/50 font-sans">{item.unitPrice.toLocaleString()} DA × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-6">
              <h3 className="text-lg font-sans font-bold text-secondary-850 mb-4">Informations de livraison</h3>
              <div className="space-y-3 text-sm font-sans">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-secondary-850">Adresse</p>
                    <p className="text-secondary-850/70">{selectedOrder.deliveryAddress}, {selectedOrder.deliveryCity} {selectedOrder.deliveryPostalCode}</p>
                  </div>
                </div>
                {selectedOrder.deliveryDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-secondary-850">Date de livraison</p>
                      <p className="text-secondary-850/70">{formatDate(selectedOrder.deliveryDate)}</p>
                    </div>
                  </div>
                )}
                {selectedOrder.deliveryTimeSlot && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-secondary-850">Créneau horaire</p>
                      <p className="text-secondary-850/70">{selectedOrder.deliveryTimeSlot}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-6 border-t-2 border-secondary/10 space-y-2">
              {selectedOrder.subtotal != null && (
                <div className="flex justify-between text-sm font-sans text-secondary-850/70">
                  <span>Sous-total</span>
                  <span>{selectedOrder.subtotal.toLocaleString()} DA</span>
                </div>
              )}
              {selectedOrder.deliveryFee != null && (
                <div className="flex justify-between text-sm font-sans text-secondary-850/70">
                  <span>Livraison</span>
                  <span>{selectedOrder.deliveryFee === 0 ? "Gratuite" : `${selectedOrder.deliveryFee.toLocaleString()} DA`}</span>
                </div>
              )}
              {selectedOrder.discount != null && selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm font-sans text-green-600">
                  <span>Réduction</span>
                  <span>-{selectedOrder.discount.toLocaleString()} DA</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-secondary/10">
                <span className="text-lg font-sans font-bold text-secondary-850">Total</span>
                <span className="text-2xl font-sans font-bold text-secondary">{selectedOrder.total.toLocaleString()} DA</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {selectedOrder.status === OrderStatus.PENDING && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isCancelling}
                  onClick={() => {
                    cancelOrder(selectedOrder.id, {
                      onSuccess: () => setSelectedOrderId(null),
                    });
                  }}
                  className="flex-1 h-12 px-6 bg-red-500 text-white rounded-full font-sans font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Annuler la commande
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOrderId(null)}
                className="flex-1 h-12 px-6 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold hover:border-secondary/40 transition-colors duration-200"
              >
                Fermer
              </motion.button>
            </div>
          </>)}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

