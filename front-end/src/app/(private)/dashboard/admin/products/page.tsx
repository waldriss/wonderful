"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminProducts } from "@/lib/api/admin/queries";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateStock,
} from "@/lib/api/admin/mutations";
import type {
  AdminProduct,
  AdminProductListParams,
  ProductCategory,
  ProductStatus,
  CreateProductData,
} from "@/lib/api/admin/types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resolveAppImage } from "@/lib/resolve-image";
import { formatDietTypeLabel } from "@/lib/product-labels";
import { useAdminSupplements } from "@/lib/api/supplements";

function resolveProductImage(src: string | null | undefined, fallback: string): string {
  return resolveAppImage(src, fallback);
}

// ============================================
// ZOD SCHEMA FOR PRODUCT FORM
// ============================================

const productFormSchema = z.object({
  name: z.string().min(3, "Nom trop court").max(100),
  description: z.string().min(10, "Description trop courte").max(1000),
  category: z.enum(["PLATS", "BOISSONS", "DESSERTS", "SNACKS"]),
  price: z.coerce.number().int().positive("Le prix doit être positif"),
  // image is handled separately as a File upload
  stock: z.coerce.number().int().min(0),
  stockAlert: z.coerce.number().int().min(0),
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK"]),
  isNew: z.boolean(),
  isOnSale: z.boolean(),
  isBestSeller: z.boolean(),
  discount: z.coerce.number().int().min(0).max(100).nullable().optional(),
  portionSize: z.string().optional(),
  prepTime: z.string().optional(),
  calories: z.coerce.number().int().min(0),
  proteins: z.coerce.number().int().min(0),
  carbs: z.coerce.number().int().min(0),
  fats: z.coerce.number().int().min(0),
  fiber: z.coerce.number().int().min(0),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// ============================================
// STOCK UPDATE SCHEMA
// ============================================

const stockFormSchema = z.object({
  stock: z.coerce.number().int().min(0),
  operation: z.enum(["set", "add", "subtract"]),
});

type StockFormValues = z.infer<typeof stockFormSchema>;

// ============================================
// HELPERS
// ============================================

const getStatusConfig = (status: string) => {
  switch (status) {
    case "ACTIVE": return { label: "Actif", color: "bg-green-500" };
    case "DRAFT": return { label: "Brouillon", color: "bg-gray-500" };
    case "OUT_OF_STOCK": return { label: "Rupture", color: "bg-red-500" };
    default: return { label: status, color: "bg-gray-500" };
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "PLATS": return "Plats";
    case "BOISSONS": return "Boissons";
    case "DESSERTS": return "Desserts";
    case "SNACKS": return "Snacks";
    default: return category;
  }
};

// ============================================
// PREDEFINED OPTIONS
// ============================================

const DIET_TYPES = ['Sans Gluten', 'Sans Sucre', 'Sans Sel', 'Végétarien', 'Végétalien', 'Bio', 'Local'];
const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation', 'Post-entraînement', 'Pré-entraînement'];
const DIETARY_GOALS = ['Perte de poids', 'Prise de masse', 'Maintien', 'Détox', 'Performance', 'Récupération'];
const ALLERGENS_LIST = ['Fruits à coque', 'Lactose', 'Gluten', 'Fruits de mer', 'Oeufs', 'Soja'];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [stockProduct, setStockProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Secondary images state
  const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState<string[]>([]); // data: URLs for new files
  const [existingSecondaryUrls, setExistingSecondaryUrls] = useState<string[]>([]); // URLs from DB
  const [removedSecondaryUrls, setRemovedSecondaryUrls] = useState<string[]>([]); // URLs to delete on save
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  // Multi-select arrays (managed outside react-hook-form)
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedDietaryGoals, setSelectedDietaryGoals] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Suppléments associés au produit (IDs)
  const [selectedSupplementIds, setSelectedSupplementIds] = useState<string[]>([]);
  const { data: allSupplements = [] } = useAdminSupplements();

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  // Build query params
  const queryParams: AdminProductListParams = {
    page: currentPage,
    pageSize: 12,
    ...(searchQuery && { search: searchQuery }),
    ...(categoryFilter !== "all" && { category: categoryFilter as ProductCategory }),
    ...(statusFilter !== "all" && { status: statusFilter as ProductStatus }),
  };

  const { data: productsData, isLoading, isError } = useAdminProducts(queryParams);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const stockMutation = useUpdateStock();

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  // Product form
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", category: "PLATS", price: 0,
      stock: 0, stockAlert: 10, status: "DRAFT",
      calories: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0,
    },
  });

  // Stock form
  const stockForm = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: { stock: 0, operation: "set" },
  });

  const openCreateModal = () => {
    productForm.reset({
      name: "", description: "", category: "PLATS", price: 0,
      stock: 0, stockAlert: 10, status: "DRAFT",
      isNew: false, isOnSale: false, isBestSeller: false,
      discount: null, portionSize: "", prepTime: "",
      calories: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0,
    });
    setSelectedDietTypes([]);
    setSelectedMealTypes([]);
    setSelectedDietaryGoals([]);
    setSelectedAllergens([]);
    setSelectedSupplementIds([]);
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    setSecondaryFiles([]);
    setSecondaryPreviews([]);
    setExistingSecondaryUrls([]);
    setRemovedSecondaryUrls([]);
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const openEditModal = (product: AdminProduct) => {
    productForm.reset({
      name: product.name, description: product.description,
      category: product.category, price: product.price,
      stock: product.stock, stockAlert: product.stockAlert, status: product.status,
      isNew: product.isNew, isOnSale: product.isOnSale, isBestSeller: product.isBestSeller,
      discount: product.discount, portionSize: product.portionSize ?? "", prepTime: product.prepTime ?? "",
      calories: product.nutrition?.calories ?? 0, proteins: product.nutrition?.proteins ?? 0,
      carbs: product.nutrition?.carbs ?? 0, fats: product.nutrition?.fats ?? 0,
      fiber: product.nutrition?.fiber ?? 0,
    });
    setSelectedDietTypes(product.dietTypes ?? []);
    setSelectedMealTypes(product.mealTypes ?? []);
    setSelectedDietaryGoals(product.dietaryGoals ?? []);
    setSelectedAllergens(product.allergens ?? []);
    setSelectedSupplementIds(product.supplements?.map((s) => s.id) ?? []);
    // Show existing product image as preview
    setImageFile(null);
    setImagePreview(product.image || null);
    setImageError(null);
    setSecondaryFiles([]);
    setSecondaryPreviews([]);
    setExistingSecondaryUrls(product.images ?? []);
    setRemovedSecondaryUrls([]);
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleProductSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    // Validate image: required on create, optional on update
    if (!editingProduct && !imageFile) {
      setImageError("Une image est requise");
      return;
    }

    const payload: CreateProductData = {
      name: values.name, description: values.description,
      category: values.category, price: values.price,
      stock: values.stock, stockAlert: values.stockAlert, status: values.status,
      isNew: values.isNew, isOnSale: values.isOnSale, isBestSeller: values.isBestSeller,
      discount: values.discount ?? null,
      portionSize: values.portionSize || null,
      prepTime: values.prepTime || null,
      nutrition: {
        calories: values.calories, proteins: values.proteins,
        carbs: values.carbs, fats: values.fats, fiber: values.fiber,
      },
      dietTypes: selectedDietTypes,
      mealTypes: selectedMealTypes,
      dietaryGoals: selectedDietaryGoals,
      allergens: selectedAllergens,
      supplements: selectedSupplementIds,
    };

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: payload,
          imageFile: imageFile ?? undefined,
          secondaryFiles: secondaryFiles.length > 0 ? secondaryFiles : undefined,
          removeImages: removedSecondaryUrls.length > 0 ? removedSecondaryUrls : undefined,
        });
        toast.success("Produit mis à jour avec succès");
      } else {
        await createMutation.mutateAsync({
          data: payload,
          imageFile: imageFile!,
          secondaryFiles: secondaryFiles.length > 0 ? secondaryFiles : undefined,
        });
        toast.success("Produit créé avec succès");
      }
      setShowCreateModal(false);
      setEditingProduct(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'opération";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Produit supprimé");
      setDeleteConfirmId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
    }
  };

  const handleStockUpdate = async (values: StockFormValues) => {
    if (!stockProduct) return;
    try {
      await stockMutation.mutateAsync({
        id: stockProduct.id,
        data: { stock: values.stock, operation: values.operation },
      });
      toast.success("Stock mis à jour");
      setStockProduct(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour du stock";
      toast.error(message);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setImageError("Seules les images JPEG, PNG et WebP sont acceptées");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setImageFile(file);
    setImageError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(editingProduct?.image || null);
    setImageError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSecondaryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const totalExisting = existingSecondaryUrls.length + secondaryFiles.length;
    const available = Math.max(0, 5 - totalExisting);
    const validFiles = files.filter((f) => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024).slice(0, available);
    setSecondaryFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setSecondaryPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    if (secondaryInputRef.current) secondaryInputRef.current.value = "";
  };

  const removeNewSecondaryFile = (index: number) => {
    setSecondaryFiles((prev) => prev.filter((_, i) => i !== index));
    setSecondaryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingSecondaryUrl = (url: string) => {
    setExistingSecondaryUrls((prev) => prev.filter((u) => u !== url));
    setRemovedSecondaryUrls((prev) => [...prev, url]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <Package className="w-8 h-8 text-secondary" />
            Gestion Produits
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            {meta?.total ?? 0} produits au total
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-850/40" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-12 pl-12 pr-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Toutes catégories</option>
            <option value="PLATS">Plats</option>
            <option value="BOISSONS">Boissons</option>
            <option value="DESSERTS">Desserts</option>
            <option value="SNACKS">Snacks</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="all">Tous statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="DRAFT">Brouillons</option>
            <option value="OUT_OF_STOCK">Rupture</option>
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-red-500 font-sans">
          Erreur lors du chargement des produits.
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const statusConfig = getStatusConfig(product.status);
              const isLowStock = product.stock > 0 && product.stock <= product.stockAlert;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border-2 border-secondary/10 rounded-2xl overflow-hidden hover:border-secondary/30 transition-colors"
                >
                  {/* Image */}
                  <div className="relative h-40">
                    <Image src={resolveProductImage(product.image, "/images/card.png")} alt={product.name} fill className="object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-sans font-semibold text-white", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {isLowStock && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full text-xs font-sans font-semibold bg-yellow-500 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Stock: {product.stock}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-sans font-bold text-secondary-850">{product.name}</h3>
                        <p className="text-xs text-secondary-850/60 font-sans">{getCategoryLabel(product.category)}</p>
                      </div>
                      <p className="font-sans font-bold text-secondary">{product.price} DA</p>
                    </div>

                    <p className="text-sm text-secondary-850/70 font-sans line-clamp-2 mb-3">{product.description}</p>

                    {/* Nutrition */}
                    {product.nutrition && (
                      <div className="flex items-center gap-3 mb-3 text-xs font-sans">
                        <span className="text-secondary-850/60">{product.nutrition.calories} kcal</span>
                        <span className="text-secondary-850/60">P: {product.nutrition.proteins}g</span>
                        <span className="text-secondary-850/60">G: {product.nutrition.carbs}g</span>
                        <span className="text-secondary-850/60">L: {product.nutrition.fats}g</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-secondary/10 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-secondary-850/60 font-sans">⭐ {product.rating > 0 ? product.rating.toFixed(1) : "-"}</span>
                        <span className="text-secondary-850/60 font-sans">📦 {product.totalSold} vendus</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 h-9 bg-secondary/10 rounded-lg flex items-center justify-center gap-2 text-secondary font-sans font-medium text-sm hover:bg-secondary/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Voir
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(product)}
                        className="flex-1 h-9 bg-secondary/10 rounded-lg flex items-center justify-center gap-2 text-secondary font-sans font-medium text-sm hover:bg-secondary/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirmId(product.id)}
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

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-sans text-secondary-850/60">
                Page {meta.page} sur {meta.totalPages} ({meta.total} produits)
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrev}
                  className="w-9 h-9 bg-white/30 border-2 border-secondary/20 rounded-lg flex items-center justify-center text-secondary-850/60 hover:border-secondary/40 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <span className="px-4 py-2 bg-secondary text-white rounded-lg font-sans font-semibold text-sm">{meta.page}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!meta.hasNext}
                  className="w-9 h-9 bg-white/30 border-2 border-secondary/20 rounded-lg flex items-center justify-center text-secondary-850/60 hover:border-secondary/40 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-secondary-850/30 mx-auto mb-4" />
              <p className="text-secondary-850/60 font-sans">Aucun produit trouvé</p>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setEditingProduct(null); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-sans font-bold text-secondary-850">
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setEditingProduct(null); }} className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-secondary-850">Informations générales</h3>

                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Nom du produit *</label>
                  <input type="text" placeholder="Ex: Poulet Teriyaki" {...productForm.register("name")}
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  {productForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Description *</label>
                  <textarea placeholder="Description du produit..." rows={3} {...productForm.register("description")}
                    className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none" />
                  {productForm.formState.errors.description && <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.description.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">
                    Image du produit {!editingProduct && <span className="text-red-500">*</span>}
                    {editingProduct && <span className="text-xs font-normal text-secondary-850/50 ml-1">(laisser vide pour conserver l&apos;image actuelle)</span>}
                  </label>

                  {/* Drop zone / preview */}
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "relative w-full h-44 rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden flex items-center justify-center",
                      imagePreview
                        ? "border-secondary/30"
                        : "border-secondary/20 hover:border-secondary/50 bg-white/20"
                    )}
                  >
                    {imagePreview ? (
                      <>
                        <Image
                          src={resolveProductImage(imagePreview, "/images/card.png")}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="text-white text-sm font-sans font-medium flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Changer l&apos;image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-secondary-850/40">
                        <ImageIcon className="w-10 h-10" />
                        <p className="text-sm font-sans font-medium">Cliquer pour choisir une image</p>
                        <p className="text-xs font-sans">JPEG, PNG, WebP · max 5 Mo</p>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleImageChange}
                  />

                  {/* Controls below */}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {imageFile && (
                        <p className="text-xs font-sans text-secondary-850/60 truncate max-w-xs">
                          {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} Ko)
                        </p>
                      )}
                    </div>
                    {(imageFile || (imagePreview && imagePreview !== editingProduct?.image)) && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-xs text-red-500 hover:text-red-700 font-sans flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Retirer
                      </button>
                    )}
                  </div>
                  {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                </div>

                {/* ── Secondary images ──────────────────────────────── */}
                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">
                    Images secondaires <span className="text-secondary-850/40 font-normal">(carousel · max 5)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Existing DB images */}
                    {existingSecondaryUrls.map((url) => (
                      <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-secondary/20 group">
                        <Image
                          src={resolveProductImage(url, "/images/card.png")}
                          alt="Image secondaire"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingSecondaryUrl(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {/* New files (not yet uploaded) */}
                    {secondaryPreviews.map((preview, i) => (
                      <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary-400/40 group">
                        <Image src={preview} alt="Nouvelle image" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeNewSecondaryFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {/* Add button (shown when under 5 total) */}
                    {(existingSecondaryUrls.length + secondaryFiles.length) < 5 && (
                      <button
                        type="button"
                        onClick={() => secondaryInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-secondary/30 hover:border-secondary/60 flex flex-col items-center justify-center gap-1 text-secondary-850/40 hover:text-secondary-850/70 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-sans">Ajouter</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={secondaryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={handleSecondaryImagesChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Catégorie *</label>
                    <select {...productForm.register("category")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors">
                      <option value="PLATS">Plats</option>
                      <option value="BOISSONS">Boissons</option>
                      <option value="DESSERTS">Desserts</option>
                      <option value="SNACKS">Snacks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Prix (DA) *</label>
                    <input type="number" placeholder="Ex: 1100" {...productForm.register("price")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                    {productForm.formState.errors.price && <p className="text-red-500 text-xs mt-1">{productForm.formState.errors.price.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Statut</label>
                  <select {...productForm.register("status")}
                    className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors">
                    <option value="DRAFT">Brouillon</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="OUT_OF_STOCK">Rupture de stock</option>
                  </select>
                </div>
              </div>

              {/* Mise en avant */}
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-secondary-850">Mise en avant</h3>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { field: "isNew" as const, label: "Nouveau", color: "bg-primary-300/30 border-primary-400/40 text-black" },
                    { field: "isOnSale" as const, label: "En promo", color: "bg-secondary/20 border-secondary/40 text-secondary" },
                    { field: "isBestSeller" as const, label: "Best-seller", color: "bg-[#9f8ad4]/20 border-[#9f8ad4]/40 text-[#9f8ad4]" },
                  ]).map(({ field, label, color }) => (
                    <label key={field} className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-150",
                      productForm.watch(field) ? color : "bg-white/20 border-secondary/10 text-secondary-850/50 hover:border-secondary/30"
                    )}>
                      <input type="checkbox" {...productForm.register(field)} className="sr-only" />
                      <span className="text-sm font-sans font-medium">{label}</span>
                    </label>
                  ))}
                </div>
                {productForm.watch("isOnSale") && (
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Remise (%)</label>
                    <input type="number" placeholder="Ex: 20" min={0} max={100} {...productForm.register("discount")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  </div>
                )}
              </div>

              {/* Infos fitness */}
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-secondary-850">Infos fitness</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Taille de portion</label>
                    <input type="text" placeholder="Ex: 350g" {...productForm.register("portionSize")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Temps de préparation</label>
                    <input type="text" placeholder="Ex: 15 min" {...productForm.register("prepTime")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-secondary-850">Valeurs nutritionnelles</h3>
                <div className="grid grid-cols-5 gap-3">
                  {([
                    { label: "Calories", field: "calories" },
                    { label: "Protéines", field: "proteins" },
                    { label: "Glucides", field: "carbs" },
                    { label: "Lipides", field: "fats" },
                    { label: "Fibres", field: "fiber" },
                  ] as const).map((item) => (
                    <div key={item.field}>
                      <label className="block text-xs font-sans font-medium text-secondary-850 mb-1">{item.label}</label>
                      <input type="number" placeholder="0" {...productForm.register(item.field)}
                        className="w-full h-10 px-3 bg-white/30 border-2 border-secondary/20 rounded-lg font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Régimes alimentaires */}
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-secondary-850">Régimes alimentaires</h3>
                <div className="flex flex-wrap gap-2">
                  {DIET_TYPES.map(item => (
                    <button key={item} type="button"
                      onClick={() => toggleArrayItem(selectedDietTypes, item, setSelectedDietTypes)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-sans font-medium border-2 transition-all duration-150",
                        selectedDietTypes.includes(item)
                          ? "bg-green-100 border-green-400 text-green-700"
                          : "bg-white/30 border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                      )}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de repas */}
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-secondary-850">Type de repas</h3>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map(item => (
                    <button key={item} type="button"
                      onClick={() => toggleArrayItem(selectedMealTypes, item, setSelectedMealTypes)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-sans font-medium border-2 transition-all duration-150",
                        selectedMealTypes.includes(item)
                          ? "bg-primary-200 border-primary-400/60 text-secondary-850"
                          : "bg-white/30 border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                      )}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objectifs alimentaires */}
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-secondary-850">Objectifs alimentaires</h3>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_GOALS.map(item => (
                    <button key={item} type="button"
                      onClick={() => toggleArrayItem(selectedDietaryGoals, item, setSelectedDietaryGoals)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-sans font-medium border-2 transition-all duration-150",
                        selectedDietaryGoals.includes(item)
                          ? "bg-secondary/20 border-secondary/50 text-secondary"
                          : "bg-white/30 border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                      )}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergènes */}
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-secondary-850">Allergènes <span className="text-xs font-normal text-secondary-850/50">(ce produit contient)</span></h3>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS_LIST.map(item => (
                    <button key={item} type="button"
                      onClick={() => toggleArrayItem(selectedAllergens, item, setSelectedAllergens)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-sans font-medium border-2 transition-all duration-150",
                        selectedAllergens.includes(item)
                          ? "bg-orange-100 border-orange-400 text-orange-700"
                          : "bg-white/30 border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                      )}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suppléments */}
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-secondary-850">
                  Suppléments <span className="text-xs font-normal text-secondary-850/50">(options payantes proposées au client)</span>
                </h3>
                {allSupplements.length === 0 ? (
                  <p className="text-sm text-secondary-850/50 font-sans">
                    Aucun supplément disponible.{" "}
                    <Link href="/dashboard/admin/supplements" className="text-secondary underline underline-offset-2">
                      Créez-en un ici
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allSupplements.map((supplement) => {
                      const isSelected = selectedSupplementIds.includes(supplement.id);
                      return (
                        <button
                          key={supplement.id}
                          type="button"
                          disabled={!supplement.isActive && !isSelected}
                          onClick={() =>
                            setSelectedSupplementIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== supplement.id)
                                : [...prev, supplement.id]
                            )
                          }
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl border-2 font-sans text-sm transition-all duration-150 disabled:opacity-40",
                            isSelected
                              ? "bg-secondary/20 border-secondary/50 text-secondary font-medium"
                              : "bg-white/30 border-secondary/20 text-secondary-850/60 hover:border-secondary/40"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 opacity-50" />}
                            {supplement.name}
                          </span>
                          <span className="font-semibold">{supplement.price} DA</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-4">
                <h3 className="font-sans font-semibold text-secondary-850">Stock</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Quantité en stock</label>
                    <input type="number" placeholder="0" {...productForm.register("stock")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Seuil d&apos;alerte</label>
                    <input type="number" placeholder="10" {...productForm.register("stockAlert")}
                      className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowCreateModal(false); setEditingProduct(null); }}
                  className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold hover:border-secondary/40 transition-colors duration-200">
                  Annuler
                </motion.button>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingProduct ? "Enregistrer" : "Créer le produit"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image src={resolveProductImage(selectedProduct.image, "/images/card.png")} alt={selectedProduct.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-sans font-bold text-secondary-850">{selectedProduct.name}</h2>
                  <p className="text-sm text-secondary-850/60 font-sans">
                    {getCategoryLabel(selectedProduct.category)} · {selectedProduct.price} DA
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <p className="text-secondary-850/70 font-sans mb-6">{selectedProduct.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-secondary-850">{selectedProduct.totalSold}</p>
                <p className="text-xs font-sans text-secondary-850/60">Vendus</p>
              </div>
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-secondary">{selectedProduct.stock}</p>
                <p className="text-xs font-sans text-secondary-850/60">En stock</p>
              </div>
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 text-center">
                <p className="text-2xl font-sans font-bold text-yellow-600">⭐ {selectedProduct.rating > 0 ? selectedProduct.rating.toFixed(1) : "-"}</p>
                <p className="text-xs font-sans text-secondary-850/60">Note</p>
              </div>
            </div>

            {/* Nutrition */}
            {selectedProduct.nutrition && (
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10 mb-6">
                <h3 className="font-sans font-semibold text-secondary-850 mb-3">Valeurs nutritionnelles</h3>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div><p className="text-lg font-sans font-bold text-secondary-850">{selectedProduct.nutrition.calories}</p><p className="text-xs font-sans text-secondary-850/60">kcal</p></div>
                  <div><p className="text-lg font-sans font-bold text-secondary-850">{selectedProduct.nutrition.proteins}g</p><p className="text-xs font-sans text-secondary-850/60">Protéines</p></div>
                  <div><p className="text-lg font-sans font-bold text-secondary-850">{selectedProduct.nutrition.carbs}g</p><p className="text-xs font-sans text-secondary-850/60">Glucides</p></div>
                  <div><p className="text-lg font-sans font-bold text-secondary-850">{selectedProduct.nutrition.fats}g</p><p className="text-xs font-sans text-secondary-850/60">Lipides</p></div>
                  <div><p className="text-lg font-sans font-bold text-secondary-850">{selectedProduct.nutrition.fiber}g</p><p className="text-xs font-sans text-secondary-850/60">Fibres</p></div>
                </div>
              </div>
            )}

            {/* Allergens, Diet Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                <h3 className="font-sans font-semibold text-secondary-850 mb-2">Allergènes</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedProduct.allergens.length > 0 ? selectedProduct.allergens.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-sans">{a}</span>
                  )) : <span className="text-sm text-secondary-850/50 font-sans">Aucun</span>}
                </div>
              </div>
            </div>

            {/* Diet types, meal types, dietary goals */}
            {(selectedProduct.dietTypes.length > 0 || selectedProduct.mealTypes.length > 0 || selectedProduct.dietaryGoals.length > 0) && (
              <div className="grid grid-cols-1 gap-3 mb-6">
                {selectedProduct.dietTypes.length > 0 && (
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <h3 className="font-sans font-semibold text-secondary-850 mb-2">Régimes alimentaires</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.dietTypes.map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-sans">{formatDietTypeLabel(d)}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.mealTypes.length > 0 && (
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <h3 className="font-sans font-semibold text-secondary-850 mb-2">Type de repas</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.mealTypes.map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-primary-200 text-secondary-850 rounded-full text-xs font-sans">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.dietaryGoals.length > 0 && (
                  <div className="bg-white/30 rounded-xl p-4 border border-secondary/10">
                    <h3 className="font-sans font-semibold text-secondary-850 mb-2">Objectifs alimentaires</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.dietaryGoals.map((g) => (
                        <span key={g} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-sans">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedProduct(null); openEditModal(selectedProduct); }}
                className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Modifier
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedProduct(null); setStockProduct(selectedProduct); }}
                className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold hover:border-secondary/40 transition-colors duration-200 flex items-center justify-center gap-2">
                <Package className="w-4 h-4" /> Modifier stock
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedProduct(null); setDeleteConfirmId(selectedProduct.id); }}
                className="h-12 px-6 bg-red-100 border-2 border-red-200 text-red-600 rounded-full font-sans font-semibold hover:bg-red-200 transition-colors duration-200 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Supprimer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-red-200 rounded-3xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-sans font-bold text-secondary-850 mb-2">Supprimer ce produit ?</h3>
              <p className="text-secondary-850/60 font-sans mb-6">Cette action est irréversible.</p>
              <div className="flex items-center gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold">
                  Annuler
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-12 bg-red-500 text-white rounded-full font-sans font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Supprimer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStockProduct(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-bold text-secondary-850">Modifier le stock</h2>
              <button onClick={() => setStockProduct(null)} className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <p className="text-secondary-850/60 font-sans mb-4">
              {stockProduct.name} — Stock actuel : <strong>{stockProduct.stock}</strong>
            </p>

            <form onSubmit={stockForm.handleSubmit(handleStockUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Opération</label>
                <select {...stockForm.register("operation")}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors">
                  <option value="set">Définir à</option>
                  <option value="add">Ajouter</option>
                  <option value="subtract">Retirer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Quantité</label>
                <input type="number" {...stockForm.register("stock")}
                  className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStockProduct(null)}
                  className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold">
                  Annuler
                </motion.button>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={stockMutation.isPending}
                  className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {stockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Mettre à jour
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
