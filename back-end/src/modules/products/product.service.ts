import { ProductStatus } from '@prisma/client';
import { productRepository } from './product.repository';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  ListProductsQueryDto,
  ProductResponse,
  ProductAdminResponse,
  ProductFiltersResponse,
} from './product.dto';
import { createNotFoundError, createConflictError, createBadRequestError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { PaginatedResult } from '../../shared/types/pagination';
import { deleteProductImage, deleteProductImages } from '../../middlewares/upload.middleware';

/**
 * Service pour la gestion des produits
 */
export class ProductService {
  // ============================================
  // ROUTES PUBLIQUES
  // ============================================

  /**
   * Liste des produits avec filtres (Public)
   */
  async listProducts(
    query: ListProductsQueryDto
  ): Promise<PaginatedResult<ProductResponse>> {
    const { products, total } = await productRepository.findMany(query);

    return {
      data: products.map((p) => this.formatProductResponse(p)),
      meta: buildPaginationMeta(total, query.page, query.pageSize),
    };
  }

  /**
   * Détails d'un produit (Public)
   */
  async getProduct(id: string): Promise<ProductResponse> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw createNotFoundError('Produit');
    }

    // Vérifier que le produit est actif pour les routes publiques
    if (product.status !== ProductStatus.ACTIVE) {
      throw createNotFoundError('Produit');
    }

    return this.formatProductResponse(product);
  }

  /**
   * Liste des catégories avec comptage
   */
  async getCategories() {
    return productRepository.getCategories();
  }

  /**
   * Options de filtres disponibles
   */
  async getFilters(): Promise<ProductFiltersResponse> {
    const [categories, filters] = await Promise.all([
      productRepository.getCategories(),
      productRepository.getFilterOptions(),
    ]);

    return {
      categories,
      ...filters,
    };
  }

  /**
   * Suggestions personnalisées pour l'utilisateur
   */
  async getSuggestions(userId: string, limit: number = 8): Promise<ProductResponse[]> {
    const products = await productRepository.getSuggestions(userId, limit);
    return products.map((p) => this.formatProductResponse(p));
  }

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * Liste des produits pour l'admin (tous les statuts)
   */
  async listProductsAdmin(
    query: ListProductsQueryDto
  ): Promise<PaginatedResult<ProductAdminResponse>> {
    const { products, total } = await productRepository.findManyAdmin(query);

    return {
      data: products.map((p) => this.formatProductAdminResponse(p)),
      meta: buildPaginationMeta(total, query.page, query.pageSize),
    };
  }

  /**
   * Détails d'un produit pour l'admin
   */
  async getProductAdmin(id: string): Promise<ProductAdminResponse> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw createNotFoundError('Produit');
    }

    return this.formatProductAdminResponse(product);
  }

  /**
   * Créer un produit
   */
  async createProduct(data: CreateProductDto): Promise<ProductAdminResponse> {
    // Vérifier si un produit avec le même nom existe déjà
    const existing = await productRepository.findByName(data.name);
    if (existing) {
      throw createConflictError('Un produit avec ce nom existe déjà');
    }

    const product = await productRepository.create(data);

    return this.formatProductAdminResponse(product);
  }

  /**
   * Mettre à jour un produit
   */
  async updateProduct(
    id: string,
    data: UpdateProductDto
  ): Promise<ProductAdminResponse> {
    const existing = await productRepository.findById(id);

    if (!existing) {
      throw createNotFoundError('Produit');
    }

    // Vérifier si le nouveau nom est unique
    if (data.name && data.name !== existing.name) {
      const nameExists = await productRepository.findByName(data.name);
      if (nameExists) {
        throw createConflictError('Un produit avec ce nom existe déjà');
      }
    }

    // If a new primary image was uploaded, delete the old one
    if (data.image && existing.image && data.image !== existing.image) {
      deleteProductImage(existing.image);
    }

    // Delete secondary images that were explicitly removed
    if (data.removeImages?.length) {
      deleteProductImages(data.removeImages);
    }

    const product = await productRepository.update(id, data);

    return this.formatProductAdminResponse(product!);
  }

  /**
   * Supprimer un produit
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw createNotFoundError('Produit');
    }

    // Delete associated image files from disk
    if (product.image) {
      deleteProductImage(product.image);
    }
    if (product.images?.length) {
      deleteProductImages(product.images);
    }

    await productRepository.delete(id);

    return {
      success: true,
      message: 'Produit supprimé avec succès',
    };
  }

  /**
   * Mettre à jour le statut d'un produit
   */
  async changeProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<{ success: boolean; message: string }> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw createNotFoundError('Produit');
    }

    if (product.status === status) {
      throw createBadRequestError(`Le produit est déjà ${status.toLowerCase()}`);
    }

    // Vérifications spécifiques pour certains statuts
    if (status === ProductStatus.ACTIVE && product.stock <= 0) {
      throw createBadRequestError('Impossible d\'activer un produit sans stock');
    }

    await productRepository.updateStatus(id, status);

    return {
      success: true,
      message: `Statut du produit changé en ${status.toLowerCase()}`,
    };
  }

  /**
   * Mettre à jour le stock d'un produit
   */
  async updateStock(
    id: string,
    data: UpdateStockDto
  ): Promise<{ success: boolean; newStock: number }> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw createNotFoundError('Produit');
    }

    // Vérifier que la soustraction ne rend pas le stock négatif
    if (data.operation === 'subtract' && product.stock < data.stock) {
      throw createBadRequestError('Stock insuffisant pour cette opération');
    }

    const updated = await productRepository.updateStock(
      id,
      data.stock,
      data.operation
    );

    // Mettre à jour le statut si le stock atteint 0
    if (updated.stock <= 0 && updated.status === ProductStatus.ACTIVE) {
      await productRepository.updateStatus(id, ProductStatus.OUT_OF_STOCK);
    }

    return {
      success: true,
      newStock: updated.stock,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Formater la réponse produit (Public)
   * Les suppléments désactivés ne sont pas exposés au client
   */
  private formatProductResponse(product: any, includeInactiveSupplements = false): ProductResponse {
    const finalPrice = product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

    const supplements = (product.supplements ?? [])
      .map((link: any) => ({
        id: link.supplement.id,
        name: link.supplement.name,
        price: link.supplement.price,
        isActive: link.supplement.isActive,
      }))
      .filter((s: { isActive: boolean }) => includeInactiveSupplements || s.isActive);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      finalPrice,
      image: product.image,
      stock: product.stock,
      status: product.status,
      rating: product.rating,
      totalSold: product.totalSold,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
      isBestSeller: product.isBestSeller,
      discount: product.discount,
      portionSize: product.portionSize,
      prepTime: product.prepTime,
      images: product.images ?? [],
      nutrition: product.nutrition
        ? {
            calories: product.nutrition.calories,
            proteins: product.nutrition.proteins,
            carbs: product.nutrition.carbs,
            fats: product.nutrition.fats,
            fiber: product.nutrition.fiber,
          }
        : null,
      allergens: product.allergens.map((a: any) => a.name),
      dietTypes: product.dietTypes.map((d: any) => d.name),
      mealTypes: product.mealTypes.map((m: any) => m.name),
      dietaryGoals: product.dietaryGoals.map((g: any) => g.name),
      supplements,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Formater la réponse produit (Admin)
   * Tous les suppléments sont exposés (y compris désactivés) pour la gestion
   */
  private formatProductAdminResponse(product: any): ProductAdminResponse {
    return {
      ...this.formatProductResponse(product, true),
      stockAlert: product.stockAlert,
      reviewsCount: product._count?.reviews || 0,
      favoritesCount: product._count?.favorites || 0,
    };
  }
}

export const productService = new ProductService();
