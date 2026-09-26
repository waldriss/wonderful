import { Prisma, ProductCategory, ProductStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ListFavoritesQueryDto } from './favorite.dto';

/**
 * Repository pour les opérations de base de données favoris
 */
export class FavoriteRepository {
  /**
   * Vérifier si un produit est en favori
   */
  async exists(userId: string, productId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    return !!favorite;
  }

  /**
   * Ajouter un produit aux favoris
   */
  async add(userId: string, productId: string) {
    return prisma.favorite.create({
      data: { userId, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            image: true,
            rating: true,
            isOnSale: true,
            discount: true,
            isNew: true,
            isBestSeller: true,
          },
        },
      },
    });
  }

  /**
   * Retirer un produit des favoris
   */
  async remove(userId: string, productId: string) {
    return prisma.favorite.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  /**
   * Liste paginée des favoris d'un utilisateur
   */
  async findByUser(userId: string, query: ListFavoritesQueryDto) {
    const { page, limit, category } = query;
    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: Prisma.FavoriteWhereInput = {
      userId,
      product: {
        status: ProductStatus.ACTIVE,
        ...(category && { category }),
      },
    };

    // Requêtes parallèles
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              price: true,
              image: true,
              rating: true,
              isOnSale: true,
              discount: true,
              isNew: true,
              isBestSeller: true,
            },
          },
        },
      }),
      prisma.favorite.count({ where }),
    ]);

    return { favorites, total };
  }

  /**
   * Récupérer les IDs des produits favoris d'un utilisateur
   */
  async getFavoriteProductIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return favorites.map((f) => f.productId);
  }

  /**
   * Compter le nombre de favoris d'un utilisateur
   */
  async countByUser(userId: string): Promise<number> {
    return prisma.favorite.count({
      where: { userId },
    });
  }

  /**
   * Supprimer tous les favoris d'un utilisateur
   */
  async clearAll(userId: string) {
    return prisma.favorite.deleteMany({
      where: { userId },
    });
  }
}

export const favoriteRepository = new FavoriteRepository();
