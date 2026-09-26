import { favoriteRepository } from './favorite.repository';
import { productRepository } from '../products/product.repository';
import { ListFavoritesQueryDto, FavoriteProductResponse } from './favorite.dto';
import { createNotFoundError, createConflictError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { PaginatedResult } from '../../shared/types/pagination';

/**
 * Service pour la gestion des favoris
 */
export class FavoriteService {
  /**
   * Récupérer les favoris de l'utilisateur
   */
  async getFavorites(
    userId: string,
    query: ListFavoritesQueryDto
  ): Promise<PaginatedResult<FavoriteProductResponse>> {
    const { favorites, total } = await favoriteRepository.findByUser(userId, query);

    return {
      data: favorites.map((f) => this.formatFavoriteResponse(f)),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Ajouter un produit aux favoris
   */
  async addFavorite(
    userId: string,
    productId: string
  ): Promise<FavoriteProductResponse> {
    // Vérifier que le produit existe et est actif
    const product = await productRepository.findById(productId);
    if (!product) {
      throw createNotFoundError('Produit');
    }

    // Vérifier si déjà en favori
    const exists = await favoriteRepository.exists(userId, productId);
    if (exists) {
      throw createConflictError('Ce produit est déjà dans vos favoris');
    }

    const favorite = await favoriteRepository.add(userId, productId);

    return this.formatFavoriteResponse(favorite);
  }

  /**
   * Retirer un produit des favoris
   */
  async removeFavorite(
    userId: string,
    productId: string
  ): Promise<{ success: boolean; message: string }> {
    // Vérifier si le produit est en favori
    const exists = await favoriteRepository.exists(userId, productId);
    if (!exists) {
      throw createNotFoundError('Favori');
    }

    await favoriteRepository.remove(userId, productId);

    return {
      success: true,
      message: 'Produit retiré des favoris',
    };
  }

  /**
   * Vérifier si un produit est en favori
   */
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return favoriteRepository.exists(userId, productId);
  }

  /**
   * Récupérer les IDs des produits favoris (pour le frontend)
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    return favoriteRepository.getFavoriteProductIds(userId);
  }

  /**
   * Compter les favoris d'un utilisateur
   */
  async countFavorites(userId: string): Promise<number> {
    return favoriteRepository.countByUser(userId);
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Formater la réponse favori
   */
  private formatFavoriteResponse(favorite: any): FavoriteProductResponse {
    const product = favorite.product;
    const finalPrice = product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;

    return {
      id: favorite.id,
      productId: favorite.productId,
      addedAt: favorite.createdAt,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        finalPrice,
        image: product.image,
        rating: product.rating,
        isOnSale: product.isOnSale,
        discount: product.discount,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
      },
    };
  }
}

export const favoriteService = new FavoriteService();
