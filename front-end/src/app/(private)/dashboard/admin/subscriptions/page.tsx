"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { 
  CreditCard,
  Search,
  Download,
  Eye,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminSubscriptions,
  useAdminSubscriptionStats,
  useAdminSubscriptionPlans,
} from "@/lib/api/admin/queries";
import {
  useAdminSubscriptionAction,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from "@/lib/api/admin/mutations";
import type {
  AdminSubscription,
  AdminSubscriptionPlan,
  SubscriptionPlanTypeAPI,
  SubscriptionStatusAPI,
  AdminSubscriptionListParams,
} from "@/lib/api/admin/types";

type PlanFormState = {
  name: string;
  description: string;
  type: Exclude<SubscriptionPlanTypeAPI, "CUSTOM">;
  basePrice: number;
  maxProducts: number;
  features: string[];
  isActive: boolean;
};

function createInitialPlanForm(): PlanFormState {
  return {
    name: "",
    description: "",
    type: "MONTHLY",
    basePrice: 0,
    maxProducts: 0,
    features: [],
    isActive: true,
  };
}

const PLAN_TYPE_LABELS: Record<PlanFormState["type"], string> = {
  MONTHLY: "Mensuel",
  QUARTERLY: "Trimestriel",
  ANNUAL: "Annuel",
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'pause' | 'resume' | 'cancel' } | null>(null);

  // Plan form state
  const [editingPlan, setEditingPlan] = useState<AdminSubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormState>(createInitialPlanForm());

  const itemsPerPage = 10;

  // Build query params
  const queryParams: AdminSubscriptionListParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(statusFilter !== "all" && { status: statusFilter as SubscriptionStatusAPI }),
    ...(planFilter !== "all" && { planId: planFilter }),
    ...(searchQuery && { search: searchQuery }),
  };

  // API hooks
  const { data: subscriptionsData, isLoading, isError } = useAdminSubscriptions(queryParams);
  const { data: stats } = useAdminSubscriptionStats();
  const { data: plans = [], isLoading: plansLoading } = useAdminSubscriptionPlans();

  // Mutations
  const subscriptionAction = useAdminSubscriptionAction();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();

  const subscriptions = subscriptionsData?.data ?? [];
  const meta = subscriptionsData?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const visiblePlans = plans.filter((plan) => plan.type !== "CUSTOM");
  const isPlanFormPending = createPlan.isPending || updatePlan.isPending;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE": return { label: "Actif", color: "bg-green-500" };
      case "PAUSED": return { label: "En pause", color: "bg-yellow-500" };
      case "CANCELLED": return { label: "Annulé", color: "bg-red-500" };
      case "EXPIRED": return { label: "Expiré", color: "bg-gray-500" };
      case "PENDING": return { label: "En attente", color: "bg-blue-500" };
      default: return { label: status, color: "bg-gray-500" };
    }
  };

  const getPlanColor = (planName: string) => {
    const lower = planName.toLowerCase();
    if (lower.includes("premium")) return "bg-purple-500";
    if (lower.includes("standard")) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleAction = (id: string, action: 'pause' | 'resume' | 'cancel') => {
    setConfirmAction({ id, action });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    subscriptionAction.mutate(
      { id: confirmAction.id, data: { action: confirmAction.action } },
      {
        onSuccess: () => {
          setConfirmAction(null);
          setSelectedSubscription(null);
        },
      }
    );
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: planForm.name,
      description: planForm.description || undefined,
      type: planForm.type,
      basePrice: planForm.basePrice,
      maxProducts: planForm.maxProducts || undefined,
      features: planForm.features.map((feature) => feature.trim()).filter(Boolean),
      isActive: planForm.isActive,
    };

    if (editingPlan) {
      updatePlan.mutate(
        { id: editingPlan.id, data },
        { onSuccess: () => { setEditingPlan(null); resetPlanForm(); } }
      );
    } else {
      createPlan.mutate(data, { onSuccess: () => resetPlanForm() });
    }
  };

  const resetPlanForm = () => {
    setPlanForm(createInitialPlanForm());
    setEditingPlan(null);
    setIsPlanEditorOpen(false);
  };

  const openCreatePlanEditor = () => {
    setEditingPlan(null);
    setPlanForm(createInitialPlanForm());
    setIsPlanEditorOpen(true);
  };

  const startEditPlan = (plan: AdminSubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description ?? '',
      type: plan.type === 'CUSTOM' ? 'MONTHLY' : plan.type,
      basePrice: plan.basePrice,
      maxProducts: plan.maxProducts ?? 0,
      features: plan.features.length > 0 ? plan.features : [''],
      isActive: plan.isActive,
    });
    setIsPlanEditorOpen(true);
  };

  const addFeature = () => {
    setPlanForm((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setPlanForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const removeFeature = (index: number) => {
    setPlanForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, featureIndex) => featureIndex !== index),
    }));
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Supprimer cette formule ?')) {
      deletePlan.mutate(planId);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
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
            <CreditCard className="w-8 h-8 text-secondary" />
            Gestion Abonnements
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {stats?.totalSubscriptions ?? 0} abonnements au total
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
            onClick={openCreatePlanEditor}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle formule
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Total</p>
          <p className="text-2xl font-sans font-bold text-secondary-850">{stats?.totalSubscriptions ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Actifs</p>
          <p className="text-2xl font-sans font-bold text-green-600">{stats?.activeSubscriptions ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">En pause</p>
          <p className="text-2xl font-sans font-bold text-yellow-600">{stats?.pausedSubscriptions ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">Annulés</p>
          <p className="text-2xl font-sans font-bold text-red-600">{stats?.cancelledSubscriptions ?? 0}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm font-sans text-secondary-850/60 mb-1">MRR</p>
          <p className="text-2xl font-sans font-bold text-secondary">
            {stats ? `${(stats.monthlyRevenue / 1000).toFixed(1)}k DA` : '—'}
          </p>
        </div>
      </div>

      {/* Plans Overview */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-sans font-bold text-secondary-850">Formules</h2>
            <p className="text-sm font-sans text-secondary-850/60">
              Modifiez et supprimez directement depuis les cards. Défilement horizontal si besoin.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreatePlanEditor}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une formule
          </motion.button>
        </div>

        {plansLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          </div>
        ) : visiblePlans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary/20 bg-white/20 px-4 py-8 text-center">
            <p className="font-sans text-secondary-850/60">Aucune formule disponible pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4 pr-2">
              {visiblePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "w-[300px] flex-shrink-0 rounded-2xl border p-5 bg-white/40 flex flex-col gap-4",
                    editingPlan?.id === plan.id
                      ? "border-secondary shadow-lg"
                      : "border-secondary/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-sans font-semibold text-white",
                          getPlanColor(plan.name)
                        )}>
                          {plan.name}
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-sans font-semibold",
                          plan.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {plan.isActive ? 'Actif' : 'Archivé'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-secondary-850/60 font-sans">
                        {plan.description ?? plan.type}
                      </p>
                    </div>
                    <span className="text-lg font-sans font-bold text-secondary">
                      {plan.basePrice} DA
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-secondary-850">
                    <Users className="w-4 h-4" />
                    <span className="font-sans font-medium">{plan.subscriberCount ?? 0} abonnés actifs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary/5 px-3 py-3">
                      <p className="text-xs font-sans font-medium uppercase tracking-wide text-secondary-850/50">
                        Type
                      </p>
                      <p className="mt-1 text-sm font-sans font-semibold text-secondary-850">
                        {plan.type === "CUSTOM"
                          ? "Personnalisé"
                          : PLAN_TYPE_LABELS[plan.type]}
                      </p>
                    </div>
                    <div className="rounded-xl bg-secondary/5 px-3 py-3">
                      <p className="text-xs font-sans font-medium uppercase tracking-wide text-secondary-850/50">
                        Max produits
                      </p>
                      <p className="mt-1 text-sm font-sans font-semibold text-secondary-850">
                        {plan.maxProducts
                          ? `${plan.maxProducts} produit${plan.maxProducts > 1 ? "s" : ""}`
                          : "Illimité"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="flex-1 h-10 rounded-xl bg-secondary/10 text-secondary font-sans font-semibold hover:bg-secondary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="h-10 px-4 rounded-xl bg-red-100 text-red-600 font-sans font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {isPlanEditorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-secondary/15 bg-white/30 p-5"
            >
              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-sans font-semibold text-secondary-850">
                      {editingPlan ? 'Modifier la formule' : 'Nouvelle formule'}
                    </h3>
                    <p className="text-sm font-sans text-secondary-850/60">
                      Les avantages se gèrent comme une mini todo list: ajoutez, éditez, supprimez.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetPlanForm}
                    className="w-10 h-10 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-secondary" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">Type</label>
                    <select
                      value={planForm.type}
                      onChange={(e) => setPlanForm((prev) => ({
                        ...prev,
                        type: e.target.value as PlanFormState['type'],
                      }))}
                      className="w-full h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                    >
                      <option value="MONTHLY">Mensuel</option>
                      <option value="QUARTERLY">Trimestriel</option>
                      <option value="ANNUAL">Annuel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">Description</label>
                  <input
                    type="text"
                    value={planForm.description}
                    onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">Prix (DA)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={planForm.basePrice}
                      onChange={(e) => setPlanForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                      className="w-full h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">Max produits</label>
                    <input
                      type="number"
                      min={0}
                      value={planForm.maxProducts}
                      onChange={(e) => setPlanForm((prev) => ({ ...prev, maxProducts: Number(e.target.value) }))}
                      className="w-full h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm font-sans font-medium text-secondary-850">Avantages</label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="h-9 px-4 rounded-full bg-secondary/10 text-secondary font-sans font-semibold hover:bg-secondary/20 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un avantage
                    </button>
                  </div>

                  {planForm.features.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-secondary/20 bg-white/20 px-4 py-6 text-center">
                      <p className="text-sm font-sans text-secondary-850/60 mb-3">
                        Aucun avantage pour l'instant.
                      </p>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="h-10 px-4 rounded-full bg-secondary text-white font-sans font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer le premier avantage
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {planForm.features.map((feature, index) => (
                        <div key={`feature-${index}`} className="flex items-center gap-2">
                          <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary font-sans font-semibold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder={`Avantage ${index + 1}`}
                            className="flex-1 h-10 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetPlanForm}
                    className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isPlanFormPending}
                    className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isPlanFormPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Plus className="w-4 h-4" />
                    {editingPlan ? 'Enregistrer les changements' : 'Créer la formule'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
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
            <option value="PAUSED">En pause</option>
            <option value="CANCELLED">Annulés</option>
            <option value="EXPIRED">Expirés</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Toutes formules</option>
            {visiblePlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="font-sans">Erreur lors du chargement des abonnements</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-850/40 gap-2">
            <CreditCard className="w-8 h-8" />
            <p className="font-sans">Aucun abonnement trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary/10 bg-secondary/5">
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Client</th>
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Formule</th>
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Prochaine livraison</th>
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Livraisons</th>
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Total payé</th>
                    <th className="text-left px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Statut</th>
                    <th className="text-right px-6 py-4 text-sm font-sans font-semibold text-secondary-850">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, index) => {
                    const statusConfig = getStatusConfig(sub.status);
                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-secondary/5 hover:bg-secondary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-sans font-semibold text-secondary-850">{sub.user?.name ?? '—'}</p>
                            <p className="font-sans text-xs text-secondary-850/60">{sub.user?.email ?? '—'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-sans font-semibold text-white",
                            getPlanColor(sub.plan.name)
                          )}>
                            {sub.plan.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {sub.nextDeliveryDate ? (
                            <div>
                              <p className="font-sans text-sm text-secondary-850">{formatDate(sub.nextDeliveryDate)}</p>
                              <p className="font-sans text-xs text-secondary-850/60">
                                {sub.deliveryDays.join(', ')} {sub.deliveryTimeSlot ? `• ${sub.deliveryTimeSlot}` : ''}
                              </p>
                            </div>
                          ) : (
                            <span className="text-secondary-850/40 text-sm font-sans">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-sans font-semibold text-secondary">{sub.deliveriesCount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-sans text-sm text-secondary-850">{(sub.totalPaid / 1000).toFixed(1)}k DA</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-sans font-semibold text-white",
                            statusConfig.color
                          )}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedSubscription(sub)}
                              className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            {sub.status === "ACTIVE" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAction(sub.id, 'pause')}
                                className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 hover:bg-yellow-200 transition-colors"
                              >
                                <Pause className="w-4 h-4" />
                              </motion.button>
                            )}
                            {sub.status === "PAUSED" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAction(sub.id, 'resume')}
                                className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                              </motion.button>
                            )}
                            {sub.status !== "CANCELLED" && sub.status !== "EXPIRED" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAction(sub.id, 'cancel')}
                                className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
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

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSelectedSubscription(null)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-sans font-bold text-secondary-850">
                  {selectedSubscription.user?.name ?? 'Client'}
                </h2>
                <p className="text-sm text-secondary-850/60 font-sans">
                  Depuis {formatDate(selectedSubscription.startDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-sans font-semibold text-white",
                  getStatusConfig(selectedSubscription.status).color
                )}>
                  {getStatusConfig(selectedSubscription.status).label}
                </span>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>
            </div>

            {/* Plan Info */}
            <div className={cn(
              "rounded-xl p-4 mb-6 text-white",
              getPlanColor(selectedSubscription.plan.name)
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-lg">{selectedSubscription.plan.name}</h3>
                  <p className="text-white/80 text-sm font-sans">{selectedSubscription.plan.description ?? selectedSubscription.plan.type}</p>
                </div>
                <p className="text-2xl font-sans font-bold">{selectedSubscription.plan.basePrice} DA<span className="text-sm font-normal">/mois</span></p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-secondary-850">{selectedSubscription.deliveriesCount}</p>
                <p className="text-xs font-sans text-secondary-850/60">Livraisons</p>
              </div>
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-secondary">{(selectedSubscription.totalPaid / 1000).toFixed(1)}k DA</p>
                <p className="text-xs font-sans text-secondary-850/60">Total payé</p>
              </div>
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-secondary-850 capitalize">
                  {selectedSubscription.paymentMethod === "CARD" ? "Carte" : selectedSubscription.paymentMethod === "CASH" ? "Espèces" : selectedSubscription.paymentMethod}
                </p>
                <p className="text-xs font-sans text-secondary-850/60">Paiement</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
              <h3 className="font-sans font-semibold text-secondary-850 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                Livraison
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-sans text-secondary-850/60">Jours de livraison</p>
                  <p className="font-sans font-medium text-secondary-850">{selectedSubscription.deliveryDays.join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-sans text-secondary-850/60">Créneau</p>
                  <p className="font-sans font-medium text-secondary-850">{selectedSubscription.deliveryTimeSlot ?? '—'}</p>
                </div>
                {selectedSubscription.nextDeliveryDate && (
                  <div className="col-span-2">
                    <p className="text-xs font-sans text-secondary-850/60">Prochaine livraison</p>
                    <p className="font-sans font-semibold text-secondary">{formatDate(selectedSubscription.nextDeliveryDate)}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs font-sans text-secondary-850/60">Adresse</p>
                  <p className="font-sans font-medium text-secondary-850">{selectedSubscription.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Pause/Cancel Info */}
            {selectedSubscription.pausedAt && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-6">
                <p className="text-sm font-sans text-yellow-800">
                  En pause depuis {formatDate(selectedSubscription.pausedAt)}
                </p>
                {selectedSubscription.pauseReason && (
                  <p className="text-sm font-sans text-yellow-700 mt-1">Raison: {selectedSubscription.pauseReason}</p>
                )}
              </div>
            )}

            {selectedSubscription.cancelledAt && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-6">
                <p className="text-sm font-sans text-red-800">
                  Annulé le {formatDate(selectedSubscription.cancelledAt)}
                </p>
                {selectedSubscription.cancelReason && (
                  <p className="text-sm font-sans text-red-700 mt-1">Raison: {selectedSubscription.cancelReason}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {selectedSubscription.status !== "CANCELLED" && selectedSubscription.status !== "EXPIRED" && (
              <div className="flex items-center gap-4">
                {selectedSubscription.status === "ACTIVE" ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(selectedSubscription.id, 'pause')}
                    className="flex-1 h-12 bg-yellow-100 border-2 border-yellow-200 text-yellow-600 rounded-full font-sans font-semibold hover:bg-yellow-200 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Mettre en pause
                  </motion.button>
                ) : selectedSubscription.status === "PAUSED" ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(selectedSubscription.id, 'resume')}
                    className="flex-1 h-12 bg-green-500 text-white rounded-full font-sans font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Reprendre
                  </motion.button>
                ) : null}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction(selectedSubscription.id, 'cancel')}
                  className="h-12 px-6 bg-red-100 border-2 border-red-200 text-red-600 rounded-full font-sans font-semibold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-md w-full"
          >
            <h2 className="text-xl font-sans font-bold text-secondary-850 mb-4">
              {confirmAction.action === 'pause' && 'Mettre en pause ?'}
              {confirmAction.action === 'resume' && "Reprendre l'abonnement ?"}
              {confirmAction.action === 'cancel' && "Annuler l'abonnement ?"}
            </h2>
            <p className="text-sm font-sans text-secondary-850/60 mb-6">
              {confirmAction.action === 'cancel' 
                ? "Cette action est irréversible. L'abonnement sera définitivement annulé."
                : 'Êtes-vous sûr de vouloir effectuer cette action ?'}
            </p>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmAction(null)}
                className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold"
              >
                Retour
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={executeAction}
                disabled={subscriptionAction.isPending}
                className={cn(
                  "flex-1 h-12 rounded-full font-sans font-semibold text-white flex items-center justify-center gap-2",
                  confirmAction.action === 'cancel' ? 'bg-red-500 hover:bg-red-600' :
                  confirmAction.action === 'pause' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-green-500 hover:bg-green-600'
                )}
              >
                {subscriptionAction.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
