"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  Trash2,
  Loader2,
  AlertCircle,
  Mail,
  MailOpen,
  Check,
  Filter,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminNotifications,
  useAdminNotificationStats,
} from "@/lib/api/admin/queries";import {
  useCreateNotification,
  useSendBulkNotification,
  useDeleteNotification,
} from "@/lib/api/admin/mutations";
import type {
  NotificationTypeAPI,
  AdminNotificationListParams,
} from "@/lib/api/admin/types";

const NOTIFICATION_TYPES: { value: NotificationTypeAPI; label: string; color: string }[] = [
  { value: "GENERAL", label: "Général", color: "bg-gray-500" },
  { value: "ORDER_UPDATE", label: "Commande", color: "bg-blue-500" },
  { value: "PROMO", label: "Promo", color: "bg-green-500" },
  { value: "SUBSCRIPTION_UPDATE", label: "Abonnement", color: "bg-indigo-500" },
  { value: "BADGE_UNLOCKED", label: "Badge", color: "bg-purple-500" },
  { value: "MISSION_COMPLETE", label: "Mission", color: "bg-yellow-500" },
  { value: "STREAK_MILESTONE", label: "Série", color: "bg-orange-500" },
  { value: "MYSTERY_BOX", label: "Mystery Box", color: "bg-pink-500" },
  { value: "REFERRAL_SUCCESS", label: "Parrainage", color: "bg-cyan-500" },
];

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isBulk, setIsBulk] = useState(false);

  // Form state
  const [form, setForm] = useState({
    userId: '',
    userIds: '',
    type: 'GENERAL' as NotificationTypeAPI,
    title: '',
    message: '',
    icon: '',
    actionUrl: '',
  });

  const itemsPerPage = 20;

  // Build query params
  const queryParams: AdminNotificationListParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(typeFilter !== "all" && { type: typeFilter as NotificationTypeAPI }),
    ...(readFilter !== "all" && { read: readFilter === "read" }),
  };

  // API hooks
  const { data: notificationsData, isLoading, isError } = useAdminNotifications(queryParams);
  const { data: stats } = useAdminNotificationStats();

  // Mutations
  const createNotification = useCreateNotification();
  const sendBulk = useSendBulkNotification();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.data ?? [];
  const meta = notificationsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const getTypeConfig = (type: string) => {
    return NOTIFICATION_TYPES.find(t => t.value === type) ?? { value: type, label: type, color: "bg-gray-500" };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetForm = () => {
    setForm({ userId: '', userIds: '', type: 'GENERAL', title: '', message: '', icon: '', actionUrl: '' });
    setIsBulk(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onSuccess = () => {
      setShowCreateModal(false);
      resetForm();
    };

    if (isBulk) {
      const userIds = form.userIds.split(',').map(id => id.trim()).filter(Boolean);
      if (userIds.length === 0) return;
      sendBulk.mutate({
        userIds,
        type: form.type,
        title: form.title,
        message: form.message,
        icon: form.icon || undefined,
        actionUrl: form.actionUrl || undefined,
      }, { onSuccess });
    } else {
      if (!form.userId) return;
      createNotification.mutate({
        userId: form.userId,
        type: form.type,
        title: form.title,
        message: form.message,
        icon: form.icon || undefined,
        actionUrl: form.actionUrl || undefined,
      }, { onSuccess });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette notification ?')) {
      deleteNotification.mutate(id);
    }
  };

  const isMutating = createNotification.isPending || sendBulk.isPending;

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
            <Bell className="w-8 h-8 text-secondary" />
            Gestion Notifications
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {stats?.total ?? 0} notifications envoyées
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Envoyer notification
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-sans text-secondary-850/60">Total</p>
          </div>
          <p className="text-2xl font-sans font-bold text-secondary-850">{stats?.total ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-sans text-secondary-850/60">Non lues</p>
          </div>
          <p className="text-2xl font-sans font-bold text-red-600">{stats?.unread ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MailOpen className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-sans text-secondary-850/60">Lues</p>
          </div>
          <p className="text-2xl font-sans font-bold text-green-600">
            {stats ? stats.total - stats.unread : 0}
          </p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-sans text-secondary-850/60">Types</p>
          </div>
          <p className="text-2xl font-sans font-bold text-secondary-850">{stats?.byType?.length ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <BellRing className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-sm font-sans text-secondary-850/60">Appareils push actifs</p>
          </div>
          <p className="text-2xl font-sans font-bold text-cyan-600">
            {stats?.push?.activeSubscriptions ?? 0}
          </p>
        </div>
      </div>

      {/* Type breakdown */}
      {stats?.byType && stats.byType.length > 0 && (
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <h3 className="text-sm font-sans font-semibold text-secondary-850 mb-3">Répartition par type</h3>
          <div className="flex flex-wrap gap-3">
            {stats.byType.map((item) => {
              const config = getTypeConfig(item.type);
              return (
                <div key={item.type} className="flex items-center gap-2 px-3 py-2 bg-white/30 rounded-xl border border-secondary/10">
                  <span className={cn("w-3 h-3 rounded-full", config.color)} />
                  <span className="text-sm font-sans text-secondary-850">{config.label}</span>
                  <span className="text-sm font-sans font-bold text-secondary">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Tous types</option>
            {NOTIFICATION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={readFilter}
            onChange={(e) => { setReadFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Tous états</option>
            <option value="read">Lues</option>
            <option value="unread">Non lues</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="font-sans">Erreur lors du chargement des notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-850/40 gap-2">
            <Bell className="w-8 h-8" />
            <p className="font-sans">Aucune notification trouvée</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-secondary/5">
              {notifications.map((notif, index) => {
                const typeConfig = getTypeConfig(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors",
                      !notif.read && "bg-secondary/5"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0",
                        typeConfig.color
                      )}>
                        {notif.icon ? (
                          <span className="text-lg">{notif.icon}</span>
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-sans text-secondary-850 truncate",
                            !notif.read ? "font-bold" : "font-medium"
                          )}>
                            {notif.title}
                          </h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-sans font-semibold text-white shrink-0",
                            typeConfig.color
                          )}>
                            {typeConfig.label}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-secondary-850/60 font-sans mt-0.5 truncate">{notif.message}</p>
                        <p className="text-xs text-secondary-850/40 font-sans mt-1">
                          {formatDate(notif.createdAt)} • {notif.user?.name ?? `User: ${notif.userId.slice(0, 8)}...`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(notif.id)}
                        className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/10">
                <p className="text-sm font-sans text-secondary-850/60">
                  Page {meta.page} sur {meta.totalPages} ({meta.total} résultats)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!meta.hasPrev}
                    className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-9 h-9 rounded-lg font-sans font-semibold text-sm transition-colors",
                          currentPage === page
                            ? "bg-secondary text-white"
                            : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={!meta.hasNext}
                    className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/20 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Send Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => { setShowCreateModal(false); resetForm(); }} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-sans font-bold text-secondary-850">
                Envoyer une notification
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {/* Single / Bulk toggle */}
            <div className="bg-secondary/5 rounded-xl p-1 flex gap-1 mb-6">
              <button
                type="button"
                onClick={() => setIsBulk(false)}
                className={cn(
                  "flex-1 h-10 rounded-lg flex items-center justify-center gap-2 font-sans font-semibold text-sm transition-colors",
                  !isBulk ? "bg-secondary text-white" : "text-secondary-850/60 hover:bg-secondary/10"
                )}
              >
                <Send className="w-4 h-4" />
                Individuelle
              </button>
              <button
                type="button"
                onClick={() => setIsBulk(true)}
                className={cn(
                  "flex-1 h-10 rounded-lg flex items-center justify-center gap-2 font-sans font-semibold text-sm transition-colors",
                  isBulk ? "bg-secondary text-white" : "text-secondary-850/60 hover:bg-secondary/10"
                )}
              >
                <Users className="w-4 h-4" />
                En masse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient */}
              {isBulk ? (
                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">
                    IDs utilisateurs (séparés par virgule) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.userIds}
                    onChange={(e) => setForm(prev => ({ ...prev, userIds: e.target.value }))}
                    placeholder="user-id-1, user-id-2, user-id-3..."
                    className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">
                    ID utilisateur *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.userId}
                    onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="user-id..."
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as NotificationTypeAPI }))}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                >
                  {NOTIFICATION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Titre *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Icône (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🔔"
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">URL action</label>
                  <input
                    type="text"
                    value={form.actionUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, actionUrl: e.target.value }))}
                    placeholder="/orders/..."
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold hover:border-secondary/40 transition-colors duration-200"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isMutating}
                  className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
