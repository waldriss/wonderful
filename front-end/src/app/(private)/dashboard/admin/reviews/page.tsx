"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star,
  Search,
  Check,
  X,
  Trash2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminReviews, useAdminReviewStats } from "@/lib/api/admin/queries";
import {
  useUpdateReviewStatus,
  useDeleteAdminReview,
} from "@/lib/api/admin/mutations";
import type { ReviewStatusAPI } from "@/lib/api/admin/types";
import { resolveAppImage } from "@/lib/resolve-image";

function resolveImg(src: string | null | undefined): string {
  return resolveAppImage(src);
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: reviewsData, isLoading, isError, error, refetch } = useAdminReviews({
    page: currentPage,
    limit: 10,
    status: statusFilter !== "all" ? (statusFilter as ReviewStatusAPI) : undefined,
    search: searchQuery || undefined,
  });
  const { data: reviewStats } = useAdminReviewStats();
  const updateStatus = useUpdateReviewStatus();
  const deleteReview = useDeleteAdminReview();

  const reviews = reviewsData?.data ?? [];
  const meta = reviewsData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const getStatusConfig = (status: ReviewStatusAPI) => {
    switch (status) {
      case "APPROVED": return { label: "Approuvé", color: "text-green-600 bg-green-100" };
      case "PENDING": return { label: "En attente", color: "text-yellow-600 bg-yellow-100" };
      case "REJECTED": return { label: "Rejeté", color: "text-red-600 bg-red-100" };
      default: return { label: status, color: "text-gray-600 bg-gray-100" };
    }
  };

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: "APPROVED" });
  };

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: "REJECTED" });
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteReview.mutate(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn("w-4 h-4", i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200")}
      />
    ));

  const stats = {
    total: reviewStats?.total ?? meta?.total ?? 0,
    pending: reviewStats?.byStatus?.PENDING ?? 0,
    approved: reviewStats?.byStatus?.APPROVED ?? 0,
    rejected: reviewStats?.byStatus?.REJECTED ?? 0,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <Star className="w-8 h-8 text-secondary" />
            Gestion Avis
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">{meta?.total ?? 0} avis au total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => refetch()}
          className="h-10 px-5 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Actualiser
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-secondary-850" },
          { label: "En attente", value: stats.pending, color: "text-yellow-600" },
          { label: "Approuvés", value: stats.approved, color: "text-green-600" },
          { label: "Rejetés", value: stats.rejected, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
            <p className="text-sm font-sans text-secondary-850/60 mb-1">{s.label}</p>
            <p className={cn("text-2xl font-sans font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
            <input
              type="text"
              placeholder="Rechercher par client ou produit..."
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
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-3">
            <Star className="w-12 h-12 text-red-300 mx-auto" />
            <p className="font-sans text-red-500 font-semibold">Erreur lors du chargement des avis</p>
            <p className="font-sans text-secondary-850/50 text-sm">{(error as Error)?.message}</p>
            <button
              onClick={() => refetch()}
              className="text-secondary underline font-sans text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
            <p className="font-sans text-secondary-850/60">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary/5">
            {reviews.map((review, index) => {
              const statusConfig = getStatusConfig(review.status);
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-6 hover:bg-secondary/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* User avatar */}
                      <div className="w-10 h-10 rounded-full bg-secondary/20 overflow-hidden shrink-0">
                        {review.user.image ? (
                          <Image
                            src={resolveImg(review.user.image)}
                            alt={review.user.name ?? "User"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-sm">
                            {review.user.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-sans font-semibold text-secondary-850">{review.user.name ?? "Anonyme"}</p>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-sans font-semibold", statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Product */}
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={resolveImg(review.product.image)}
                            alt={review.product.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded object-cover"
                            unoptimized
                          />
                          <p className="text-sm font-sans text-secondary-850/70">{review.product.name}</p>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-2">{renderStars(review.rating)}</div>

                        {/* Review text */}
                        {review.comment && (
                          <p className="font-sans text-secondary-850/80 text-sm leading-relaxed">{review.comment}</p>
                        )}

                        <p className="text-xs text-secondary-850/40 font-sans mt-2">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {review.status !== "APPROVED" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprove(review.id)}
                          disabled={updateStatus.isPending}
                          title="Approuver"
                          className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      {review.status !== "REJECTED" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(review.id)}
                          disabled={updateStatus.isPending}
                          title="Rejeter"
                          className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(review.id)}
                        disabled={deleteReview.isPending}
                        title="Supprimer"
                        className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/10">
            <p className="text-sm font-sans text-secondary-850/60">
              Page {currentPage} sur {totalPages} • {meta?.total} avis
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

      {/* Confirmation suppression */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-secondary/20 rounded-3xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-sans font-bold text-secondary-850">Supprimer l&apos;avis ?</h2>
                <p className="text-sm font-sans text-secondary-850/60">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmDelete}
                disabled={deleteReview.isPending}
                className="flex-1 h-11 bg-red-500 text-white rounded-full font-sans font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                {deleteReview.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </motion.button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
