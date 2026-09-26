"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CirclePlus, Plus, Edit, Trash2, Loader2, X, Check, Package } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminSupplements,
  useCreateSupplement,
  useUpdateSupplement,
  useDeleteSupplement,
} from "@/lib/api/supplements";
import type { Supplement, CreateSupplementData } from "@/lib/api/supplements";

// ============================================
// FORM MODAL
// ============================================

interface SupplementFormProps {
  initial?: Supplement;
  onSubmit: (data: CreateSupplementData) => void;
  onCancel: () => void;
  isPending: boolean;
}

function SupplementForm({ initial, onSubmit, onCancel, isPending }: SupplementFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      toast.error("Le nom et le prix sont obligatoires");
      return;
    }
    const parsedPrice = parseInt(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      isActive: initial?.isActive ?? true,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white/50 border-2 border-secondary/20 rounded-2xl p-5 space-y-4"
    >
      <h4 className="font-sans font-semibold text-secondary-850">
        {initial ? "Modifier le supplément" : "Nouveau supplément"}
      </h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Nom *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Extra fromage"
            className="w-full h-11 px-3 bg-white border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Prix (DA) *
          </label>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex: 150"
            className="w-full h-11 px-3 bg-white border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optionnel"
            className="w-full h-11 px-3 bg-white border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div className="md:col-span-3 flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 border-2 border-secondary/20 rounded-xl font-sans font-medium text-secondary-850/70 hover:border-secondary/40 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 bg-secondary text-white rounded-xl font-sans font-semibold flex items-center gap-2 hover:bg-secondary/90 transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initial ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ============================================
// PAGE PRINCIPALE
// ============================================

export default function SupplementsPage() {
  const { data: supplements = [], isLoading } = useAdminSupplements();
  const createSupplement = useCreateSupplement();
  const updateSupplement = useUpdateSupplement();
  const deleteSupplement = useDeleteSupplement();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(data: CreateSupplementData) {
    try {
      await createSupplement.mutateAsync(data);
      toast.success("Supplément créé avec succès");
      setShowCreateForm(false);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur lors de la création");
    }
  }

  async function handleUpdate(id: string, data: CreateSupplementData) {
    try {
      await updateSupplement.mutateAsync({ id, data });
      toast.success("Supplément mis à jour");
      setEditingId(null);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur lors de la mise à jour");
    }
  }

  async function handleToggle(supplement: Supplement) {
    try {
      await updateSupplement.mutateAsync({ id: supplement.id, data: { isActive: !supplement.isActive } });
      toast.success(supplement.isActive ? "Supplément désactivé" : "Supplément activé");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce supplément ? Les produits associés ne l'auront plus.")) return;
    try {
      await deleteSupplement.mutateAsync(id);
      toast.success("Supplément supprimé");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur lors de la suppression");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <CirclePlus className="w-8 h-8 text-secondary" />
          Suppléments
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Créez des options payantes (extra fromage, sauce, portion...), puis associez-les à vos produits
        </p>
      </div>

      {/* Card principale */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-secondary" />
            Liste des suppléments
          </h3>
          {!showCreateForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowCreateForm(true); setEditingId(null); }}
              className="h-10 px-4 bg-secondary text-white rounded-xl font-sans font-semibold text-sm flex items-center gap-2 hover:bg-secondary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un supplément
            </motion.button>
          )}
        </div>

        {/* Formulaire de création */}
        <AnimatePresence>
          {showCreateForm && (
            <SupplementForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isPending={createSupplement.isPending}
            />
          )}
        </AnimatePresence>

        {/* Liste des suppléments */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : supplements.length === 0 && !showCreateForm ? (
          <div className="text-center py-12 text-secondary-850/50 font-sans">
            Aucun supplément. Créez votre premier supplément.
          </div>
        ) : (
          <div className="space-y-3">
            {supplements.map((supplement) => (
              <div key={supplement.id}>
                <AnimatePresence>
                  {editingId === supplement.id ? (
                    <SupplementForm
                      initial={supplement}
                      onSubmit={(data) => handleUpdate(supplement.id, data)}
                      onCancel={() => setEditingId(null)}
                      isPending={updateSupplement.isPending}
                    />
                  ) : (
                    <motion.div
                      layout
                      className="flex items-center justify-between p-4 bg-white/30 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        {/* Toggle actif/inactif */}
                        <button
                          onClick={() => handleToggle(supplement)}
                          disabled={updateSupplement.isPending}
                          className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                            supplement.isActive ? "bg-secondary" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              supplement.isActive ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>

                        <div>
                          <p className={`font-sans font-medium ${supplement.isActive ? "text-secondary-850" : "text-secondary-850/50"}`}>
                            {supplement.name}
                          </p>
                          <p className="text-sm text-secondary-850/60 font-sans">
                            <span className="font-semibold">{supplement.price} DA</span>
                            {supplement.description ? ` · ${supplement.description}` : ""}
                            {" · "}
                            <span className="font-semibold">{supplement.productsCount}</span>{" "}
                            produit{supplement.productsCount > 1 ? "s" : ""} associé
                            {supplement.productsCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingId(supplement.id); setShowCreateForm(false); }}
                          className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplement.id)}
                          disabled={deleteSupplement.isPending}
                          className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}