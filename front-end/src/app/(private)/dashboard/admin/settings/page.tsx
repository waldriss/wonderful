"use client";

/* ==================== REPLACED FILE ==================== */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, MapPin, Plus, Edit, Trash2, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminDeliveryZones,
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeleteDeliveryZone,
} from "@/lib/api/delivery-zones";
import type { DeliveryZone, CreateDeliveryZoneData } from "@/lib/api/delivery-zones";

// ============================================
// FORM MODAL
// ============================================

interface ZoneFormProps {
  initial?: DeliveryZone;
  onSubmit: (data: CreateDeliveryZoneData) => void;
  onCancel: () => void;
  isPending: boolean;
}

function ZoneForm({ initial, onSubmit, onCancel, isPending }: ZoneFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fee, setFee] = useState(initial?.fee?.toString() ?? "");
  const [minOrder, setMinOrder] = useState(initial?.minOrderAmount?.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !fee.trim()) {
      toast.error("Le nom et les frais sont obligatoires");
      return;
    }
    onSubmit({
      name: name.trim(),
      fee: parseInt(fee),
      minOrderAmount: minOrder ? parseInt(minOrder) : null,
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
        {initial ? "Modifier la zone" : "Nouvelle zone"}
      </h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Nom de la zone *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alger Centre"
            className="w-full h-11 px-3 bg-white border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Frais de livraison (DA) *
          </label>
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Ex: 300"
            className="w-full h-11 px-3 bg-white border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-1">
            Commande minimum (DA)
          </label>
          <input
            type="number"
            min={0}
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
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

export default function SettingsPage() {
  const { data: zones = [], isLoading } = useAdminDeliveryZones();
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(data: CreateDeliveryZoneData) {
    try {
      await createZone.mutateAsync(data);
      toast.success("Zone créée avec succès");
      setShowCreateForm(false);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur lors de la création");
    }
  }

  async function handleUpdate(id: string, data: CreateDeliveryZoneData) {
    try {
      await updateZone.mutateAsync({ id, data });
      toast.success("Zone mise à jour");
      setEditingId(null);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur lors de la mise à jour");
    }
  }

  async function handleToggle(zone: DeliveryZone) {
    try {
      await updateZone.mutateAsync({ id: zone.id, data: { isActive: !zone.isActive } });
      toast.success(zone.isActive ? "Zone désactivée" : "Zone activée");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette zone de livraison ?")) return;
    try {
      await deleteZone.mutateAsync(id);
      toast.success("Zone supprimée");
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
          <Truck className="w-8 h-8 text-secondary" />
          Zones de livraison
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          Gérez les zones et les frais de livraison
        </p>
      </div>

      {/* Card principale */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-semibold text-secondary-850 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Zones configurées
          </h3>
          {!showCreateForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowCreateForm(true); setEditingId(null); }}
              className="h-10 px-4 bg-secondary text-white rounded-xl font-sans font-semibold text-sm flex items-center gap-2 hover:bg-secondary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une zone
            </motion.button>
          )}
        </div>

        {/* Formulaire de création */}
        <AnimatePresence>
          {showCreateForm && (
            <ZoneForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isPending={createZone.isPending}
            />
          )}
        </AnimatePresence>

        {/* Liste des zones */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : zones.length === 0 && !showCreateForm ? (
          <div className="text-center py-12 text-secondary-850/50 font-sans">
            Aucune zone configurée. Ajoutez votre première zone.
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id}>
                <AnimatePresence>
                  {editingId === zone.id ? (
                    <ZoneForm
                      initial={zone}
                      onSubmit={(data) => handleUpdate(zone.id, data)}
                      onCancel={() => setEditingId(null)}
                      isPending={updateZone.isPending}
                    />
                  ) : (
                    <motion.div
                      layout
                      className="flex items-center justify-between p-4 bg-white/30 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        {/* Toggle actif/inactif */}
                        <button
                          onClick={() => handleToggle(zone)}
                          disabled={updateZone.isPending}
                          className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                            zone.isActive ? "bg-secondary" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              zone.isActive ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>

                        <div>
                          <p className={`font-sans font-medium ${zone.isActive ? "text-secondary-850" : "text-secondary-850/50"}`}>
                            {zone.name}
                          </p>
                          <p className="text-sm text-secondary-850/60 font-sans">
                            Frais : <span className="font-semibold">{zone.fee} DA</span>
                            {zone.minOrderAmount ? (
                              <> · Min : <span className="font-semibold">{zone.minOrderAmount} DA</span></>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingId(zone.id); setShowCreateForm(false); }}
                          className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          disabled={deleteZone.isPending}
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

