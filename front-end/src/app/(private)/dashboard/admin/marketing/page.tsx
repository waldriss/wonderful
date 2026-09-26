"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Percent,
  DollarSign,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPromoCodes } from "@/lib/api/admin/queries";
import {
  useCreatePromoCode,
  useUpdatePromoCode,
  useDeletePromoCode,
  useTogglePromoCodeStatus,
} from "@/lib/api/admin/mutations";
import type {
  PromoCodeTypeAPI,
  PromoCodeStatusAPI,
  AdminPromoCode,
  CreatePromoCodeData,
} from "@/lib/api/admin/types";

// ─── Zod schema ─────────────────────────────────────────────────────────────

const promoCodeSchema = z.object({
  code: z.string().min(3, "Minimum 3 caractères").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_DELIVERY"] as const),
  value: z.coerce.number().min(0, "Valeur positive requise").default(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().min(1).nullable().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  isActive: z.boolean().default(true),
  applicableTo: z.enum(["ALL", "FIRST_ORDER", "SUBSCRIPTION"] as const).default("ALL"),
});

type PromoFormInput = z.input<typeof promoCodeSchema>;
type PromoFormData = z.output<typeof promoCodeSchema>;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromoCode | null>(null);

  const { data: promoData, isLoading, refetch } = useAdminPromoCodes({
    page: currentPage,
    limit: 10,
    status: statusFilter !== "all" ? (statusFilter as PromoCodeStatusAPI) : undefined,
    search: searchQuery || undefined,
  });

  const createPromo = useCreatePromoCode();
  const updatePromo = useUpdatePromoCode();
  const deletePromo = useDeletePromoCode();
  const toggleStatus = useTogglePromoCodeStatus();

  const promoCodes = promoData?.data ?? [];
  const meta = promoData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const getStatusConfig = (status: PromoCodeStatusAPI) => {
    switch (status) {
      case "ACTIVE": return { label: "Actif", color: "text-green-600 bg-green-100" };
      case "INACTIVE": return { label: "Inactif", color: "text-gray-600 bg-gray-100" };
      case "EXPIRED": return { label: "Expiré", color: "text-red-600 bg-red-100" };
      default: return { label: status, color: "text-gray-600 bg-gray-100" };
    }
  };

  const getTypeConfig = (type: PromoCodeTypeAPI) => {
    switch (type) {
      case "PERCENTAGE": return { label: "Pourcentage", icon: Percent, suffix: "%" };
      case "FIXED": return { label: "Montant fixe", icon: DollarSign, suffix: " DA" };
      case "FREE_DELIVERY": return { label: "Livraison gratuite", icon: Truck, suffix: "" };
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleToggle = (promo: AdminPromoCode) => {
    const newStatus: PromoCodeStatusAPI = promo.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    toggleStatus.mutate({ id: promo.id, data: { status: newStatus } });
  };

  const handleDelete = (id: string) => {
    deletePromo.mutate(id);
  };

  const openCreate = () => {
    setEditingPromo(null);
    setShowModal(true);
  };

  const openEdit = (promo: AdminPromoCode) => {
    setEditingPromo(promo);
    setShowModal(true);
  };

  const stats = {
    total: meta?.total ?? 0,
    active: promoCodes.filter(p => p.status === "ACTIVE").length,
    inactive: promoCodes.filter(p => p.status === "INACTIVE").length,
    expired: promoCodes.filter(p => p.status === "EXPIRED").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <Tag className="w-8 h-8 text-secondary" />
            Codes Promo
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">{meta?.total ?? 0} codes au total</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="h-10 px-4 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualiser
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau code
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-secondary-850" },
          { label: "Actifs", value: stats.active, color: "text-green-600" },
          { label: "Inactifs", value: stats.inactive, color: "text-gray-600" },
          { label: "Expirés", value: stats.expired, color: "text-red-600" },
        ].map(s => (
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
              placeholder="Rechercher par code..."
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
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="EXPIRED">Expirés</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
            <p className="font-sans text-secondary-850/60">Aucun code promo trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary/10 bg-secondary/5">
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Code</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Type / Valeur</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Utilisations</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Validité</th>
                  <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Statut</th>
                  <th className="text-right px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo, index) => {
                  const statusConfig = getStatusConfig(promo.status);
                  const typeConfig = getTypeConfig(promo.type);
                  const TypeIcon = typeConfig.icon;

                  return (
                    <motion.tr
                      key={promo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-sans font-bold text-secondary tracking-wider">{promo.code}</p>
                          {promo.description && (
                            <p className="font-sans text-xs text-secondary-850/60 mt-0.5">{promo.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-secondary" />
                          <div>
                            <p className="font-sans text-sm text-secondary-850">{typeConfig.label}</p>
                            {promo.type !== "FREE_DELIVERY" && (
                              <p className="font-sans font-semibold text-secondary">
                                {promo.value}{typeConfig.suffix}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-secondary-850">
                          {promo.usedCount} / {promo.maxUses ?? "∞"}
                        </p>
                        {promo.minOrderAmount && (
                          <p className="font-sans text-xs text-secondary-850/60">
                            Min: {promo.minOrderAmount.toLocaleString()} DA
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {promo.validFrom && (
                            <p className="font-sans text-xs text-secondary-850/60">
                              Dès le {formatDate(promo.validFrom)}
                            </p>
                          )}
                          {promo.validUntil && (
                            <p className="font-sans text-sm text-secondary-850">
                              Jusqu&apos;au {formatDate(promo.validUntil)}
                            </p>
                          )}
                          {!promo.validFrom && !promo.validUntil && (
                            <p className="font-sans text-sm text-secondary-850/40">Sans limite</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-sans font-semibold", statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggle(promo)}
                            disabled={toggleStatus.isPending || promo.status === "EXPIRED"}
                            title={promo.status === "ACTIVE" ? "Désactiver" : "Activer"}
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                              promo.status === "ACTIVE"
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                              "disabled:opacity-40"
                            )}
                          >
                            {promo.status === "ACTIVE"
                              ? <ToggleRight className="w-4 h-4" />
                              : <ToggleLeft className="w-4 h-4" />
                            }
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(promo)}
                            className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(promo.id)}
                            disabled={deletePromo.isPending}
                            className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
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
              Page {currentPage} sur {totalPages} • {meta?.total} codes
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

      {/* Create / Edit Modal */}
      {showModal && (
        <PromoModal
          editing={editingPromo}
          onClose={() => setShowModal(false)}
          onCreate={(data) =>
            createPromo.mutate(data, { onSuccess: () => setShowModal(false) })
          }
          onUpdate={(id, data) =>
            updatePromo.mutate({ id, data }, { onSuccess: () => setShowModal(false) })
          }
          isPending={createPromo.isPending || updatePromo.isPending}
        />
      )}
    </motion.div>
  );
}

// ─── Promo Modal ─────────────────────────────────────────────────────────────

interface PromoModalProps {
  editing: AdminPromoCode | null;
  onClose: () => void;
  onCreate: (data: CreatePromoCodeData) => void;
  onUpdate: (id: string, data: Partial<CreatePromoCodeData>) => void;
  isPending: boolean;
}

function PromoModal({ editing, onClose, onCreate, onUpdate, isPending }: PromoModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromoFormInput, unknown, PromoFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: editing
      ? {
          code: editing.code,
          description: editing.description ?? undefined,
          type: editing.type,
          value: editing.value,
          minOrderAmount: editing.minOrderAmount ?? undefined,
          maxUses: editing.maxUses ?? undefined,
          validFrom: editing.validFrom ? editing.validFrom.slice(0, 10) : undefined,
          validUntil: editing.validUntil ? editing.validUntil.slice(0, 10) : undefined,
          isActive: editing.status === "ACTIVE",
          applicableTo: editing.applicableTo ?? "ALL",
        }
      : { type: "PERCENTAGE", isActive: true, applicableTo: "ALL", value: 0 },
  });

  const selectedType = watch("type");

  const onSubmit = (data: PromoFormData) => {
    const payload: CreatePromoCodeData = {
      code: data.code,
      description: data.description,
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount,
      maxUses: data.maxUses ?? null,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      status: data.isActive ? "ACTIVE" : "INACTIVE",
      applicableTo: data.applicableTo,
    };
    if (editing) {
      onUpdate(editing.id, payload);
    } else {
      onCreate(payload);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-secondary/20 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-sans font-bold text-secondary-850">
            {editing ? "Modifier le code" : "Nouveau code promo"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Code *</label>
            <input
              {...register("code")}
              placeholder="ex: SUMMER20"
              className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans font-bold tracking-wider uppercase text-secondary focus:outline-none focus:border-secondary transition-colors"
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Description</label>
            <input
              {...register("description")}
              placeholder="Description optionnelle..."
              className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Type *</label>
            <select
              {...register("type")}
              className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (DA)</option>
              <option value="FREE_DELIVERY">Livraison gratuite</option>
            </select>
          </div>

          {/* Value */}
          {selectedType !== "FREE_DELIVERY" && (
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">
                Valeur * {selectedType === "PERCENTAGE" ? "(%)" : "(DA)"}
              </label>
              <input
                {...register("value")}
                type="number"
                min={0}
                max={selectedType === "PERCENTAGE" ? 100 : undefined}
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Min order */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Commande min (DA)</label>
              <input
                {...register("minOrderAmount")}
                type="number"
                min={0}
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            {/* Max uses */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Max utilisations</label>
              <input
                {...register("maxUses")}
                type="number"
                min={1}
                placeholder="Illimité"
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valid from */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Valide dès</label>
              <input
                {...register("validFrom")}
                type="date"
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            {/* Valid until */}
            <div>
              <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Expire le</label>
              <input
                {...register("validUntil")}
                type="date"
                className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          {/* Applicable to */}
          <div>
            <label className="block text-sm font-sans font-semibold text-secondary-850 mb-1">Applicable à</label>
            <select
              {...register("applicableTo")}
              className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="ALL">Tous les clients</option>
              <option value="FIRST_ORDER">Première commande</option>
              <option value="SUBSCRIPTION">Abonnement</option>
            </select>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              {...register("isActive")}
              type="checkbox"
              id="isActive"
              className="w-4 h-4 accent-secondary"
            />
            <label htmlFor="isActive" className="text-sm font-sans font-semibold text-secondary-850 cursor-pointer">
              Code actif immédiatement
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Enregistrer" : "Créer le code"}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 bg-secondary/10 border-2 border-secondary/20 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
