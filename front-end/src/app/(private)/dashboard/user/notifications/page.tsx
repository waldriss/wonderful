"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PushSettingsCard from "@/components/notifications/PushSettingsCard";
import {
  useNotifications,
  useUnreadCount,
} from "@/lib/api/notifications";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@/lib/api/notifications";
import type { Notification, NotificationType } from "@/lib/api/notifications";

// Configuration visuelle par type de notification
const TYPE_CONFIG: Record<NotificationType, { label: string; color: string }> = {
  BADGE_UNLOCKED: { label: "Badge", color: "bg-purple-500" },
  MISSION_COMPLETE: { label: "Mission", color: "bg-yellow-500" },
  STREAK_MILESTONE: { label: "Série", color: "bg-orange-500" },
  MYSTERY_BOX: { label: "Mystery Box", color: "bg-pink-500" },
  REFERRAL_SUCCESS: { label: "Parrainage", color: "bg-cyan-500" },
  ORDER_UPDATE: { label: "Commande", color: "bg-blue-500" },
  SUBSCRIPTION_UPDATE: { label: "Abonnement", color: "bg-indigo-500" },
  PROMO: { label: "Promo", color: "bg-green-500" },
  GENERAL: { label: "Général", color: "bg-gray-500" },
};

const ITEMS_PER_PAGE = 15;

export default function NotificationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [readFilter, setReadFilter] = useState<"all" | "unread">("all");

  // Queries
  const { data: notificationsData, isLoading, isError } = useNotifications({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(readFilter === "unread" && { read: false }),
  });
  const { data: unreadCount = 0 } = useUnreadCount();

  // Mutations
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  const notifications = notificationsData?.data ?? [];
  const meta = notificationsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeConfig = (type: NotificationType) =>
    TYPE_CONFIG[type] ?? { label: type, color: "bg-gray-500" };

  const handleOpen = (notification: Notification) => {
    // Marquer comme lue au passage, puis naviguer vers l'action
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteAll = () => {
    if (confirm("Supprimer toutes vos notifications ?")) {
      deleteAll.mutate();
    }
  };

  const isMutating =
    markAsRead.isPending ||
    markAllAsRead.isPending ||
    deleteNotification.isPending ||
    deleteAll.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <Bell className="w-8 h-8 text-secondary" />
            Mes Notifications
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Vous êtes à jour"}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead}
              disabled={isMutating || unreadCount === 0}
              className="h-10 px-4 bg-secondary/10 text-secondary rounded-full font-sans font-semibold text-sm hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer lu
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAll}
              disabled={isMutating}
              className="h-10 px-4 bg-red-100 text-red-600 rounded-full font-sans font-semibold text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Tout supprimer
            </motion.button>
          </div>
        )}
      </div>

      {/* Notifications push (appareil) */}
      <PushSettingsCard />

      {/* Filtres */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "Toutes" },
              { value: "unread", label: "Non lues" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setReadFilter(filter.value);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-full font-sans font-semibold text-sm transition-colors",
                readFilter === filter.value
                  ? "bg-secondary text-white"
                  : "bg-secondary/10 text-secondary-850/70 hover:bg-secondary/20"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <BellOff className="w-8 h-8" />
            <p className="font-sans">Erreur lors du chargement des notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-850/40 gap-2">
            <Bell className="w-8 h-8" />
            <p className="font-sans">
              {readFilter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification pour le moment"}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-secondary/5">
              {notifications.map((notification, index) => {
                const typeConfig = getTypeConfig(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleOpen(notification)}
                    className={cn(
                      "px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors cursor-pointer",
                      !notification.read && "bg-secondary/5"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0",
                          typeConfig.color
                        )}
                      >
                        {notification.icon ? (
                          <span className="text-lg">{notification.icon}</span>
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "font-sans text-secondary-850 truncate",
                              !notification.read ? "font-bold" : "font-medium"
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-secondary-850/60 font-sans mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-secondary-850/40 font-sans mt-1">
                          {formatDate(notification.createdAt)} •{" "}
                          <span className="text-secondary font-medium">
                            {typeConfig.label}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {!notification.read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead.mutate(notification.id);
                          }}
                          className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                          aria-label="Marquer comme lue"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification.mutate(notification.id);
                        }}
                        className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/10">
                <p className="text-sm font-sans text-secondary-850/60">
                  Page {meta.page} sur {meta.totalPages} ({meta.total} résultats)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
    </motion.div>
  );
}
