import { z } from 'zod';
import { ProductCategory, ProductStatus } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION - PRODUITS
// ============================================

/**
 * Schema pour les informations nutritionnelles
 */
export const nutritionSchema = z.object({
  calories: z.coerce.number().int().min(0),
  proteins: z.coerce.number().int().min(0),
  carbs: z.coerce.number().int().min(0),
  fats: z.coerce.number().int().min(0),
  fiber: z.coerce.number().int().min(0),
});

/**
 * Schema pour la création d'un produit (Admin)
 */
export const createProductSchema = z.object({
  name: z.string().min(3, 'Nom trop court').max(100),
  description: z.string().min(10, 'Description trop courte').max(1000),
  category: z.nativeEnum(ProductCategory),
  price: z.coerce.number().int().positive('Le prix doit être positif'),
  // image is provided via multipart upload (req.file), not in body
  // images (secondary) are provided via multipart upload (req.files.images), not in body
  stock: z.coerce.number().int().min(0).default(0),
  stockAlert: z.coerce.number().int().min(0).default(10),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  
  // Flags
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  discount: z.coerce.number().int().min(0).max(100).optional().nullable(),
  
  // Attributs fitness
  portionSize: z.string().optional().nullable(),
  prepTime: z.string().optional().nullable(),
  
  // Relations
  nutrition: nutritionSchema.optional(),
  allergens: z.array(z.string()).optional(),
  dietTypes: z.array(z.string()).optional(),
  mealTypes: z.array(z.string()).optional(),
  dietaryGoals: z.array(z.string()).optional(),

  // Suppléments associés (IDs des suppléments à lier au produit)
  supplements: z.array(z.string().min(1, 'ID supplément requis')).optional(),
});

/**
 * Schema pour la mise à jour d'un produit (Admin)
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Schema pour la mise à jour du stock (Admin)
 */
export const updateStockSchema = z.object({
  stock: z.coerce.number().int().min(0),
  operation: z.enum(['set', 'add', 'subtract']).default('set'),
});

/**
 * Schema pour le changement de statut (Admin)
 */
export const changeProductStatusSchema = z.object({
  status: z.nativeEnum(ProductStatus),
});

/**
 * Schema pour les paramètres de filtrage des produits (Public)
 */
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  
  // Filtres de base
  category: z.nativeEnum(ProductCategory).optional(),
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  
  // Filtres de prix
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  
  // Flags
  isOnSale: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  
  // Filtres nutritionnels
  minRating: z.coerce.number().min(0).max(5).optional(),
  minCalories: z.coerce.number().int().min(0).optional(),
  maxCalories: z.coerce.number().int().min(0).optional(),
  minProteins: z.coerce.number().int().min(0).optional(),
  maxProteins: z.coerce.number().int().min(0).optional(),
  minCarbs: z.coerce.number().int().min(0).optional(),
  maxCarbs: z.coerce.number().int().min(0).optional(),
  minFat: z.coerce.number().int().min(0).optional(),
  maxFat: z.coerce.number().int().min(0).optional(),
  minFiber: z.coerce.number().int().min(0).optional(),
  maxFiber: z.coerce.number().int().min(0).optional(),
  
  // Filtres avancés (séparés par virgule)
  mealType: z.string().optional(), // "Déjeuner,Dîner"
  dietaryGoals: z.string().optional(), // "Perte de poids"
  portionSize: z.string().optional(), // "Individual,Duo (2 pers.)"
  specifications: z.string().optional(), // "Sans Gluten,Végétarien"
  allergies: z.string().optional(), // "Gluten,Lactose" (pour exclure)
  
  // Tri
  sortBy: z.enum(['popular', 'newest', 'price-low', 'price-high', 'alphabetical', 'rating']).default('popular'),
});

/**
 * Schema pour les paramètres d'URL
 */
export const productIdParamSchema = z.object({
  id: z.string().min(1, 'ID produit requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateProductDto = z.infer<typeof createProductSchema> & { image?: string; images?: string[] };
export type UpdateProductDto = Partial<z.infer<typeof createProductSchema>> & { image?: string; images?: string[]; removeImages?: string[] };
export type UpdateStockDto = z.infer<typeof updateStockSchema>;
export type ChangeProductStatusDto = z.infer<typeof changeProductStatusSchema>;
export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
export type ProductIdParamDto = z.infer<typeof productIdParamSchema>;
export type NutritionDto = z.infer<typeof nutritionSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface ProductNutritionResponse {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  finalPrice: number; // Prix après réduction
  image: string;
  stock: number;
  status: ProductStatus;
  rating: number;
  totalSold: number;
  
  // Flags
  isNew: boolean;
  isOnSale: boolean;
  isBestSeller: boolean;
  discount: number | null;
  
  // Attributs fitness
  portionSize: string | null;
  prepTime: string | null;

  // Images secondaires
  images: string[];
  
  // Relations
  nutrition: ProductNutritionResponse | null;
  allergens: string[];
  dietTypes: string[];
  mealTypes: string[];
  dietaryGoals: string[];

  // Suppléments associés (nom, prix unitaire et disponibilité)
  supplements: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFiltersResponse {
  categories: Array<{ value: ProductCategory; label: string; count: number }>;
  mealTypes: Array<{ value: string; count: number }>;
  dietaryGoals: Array<{ value: string; count: number }>;
  dietTypes: Array<{ value: string; count: number }>;
  allergens: Array<{ value: string; count: number }>;
  priceRange: { min: number; max: number };
  caloriesRange: { min: number; max: number };
}

export interface ProductAdminResponse extends ProductResponse {
  stockAlert: number;
  reviewsCount: number;
  favoritesCount: number;
}
