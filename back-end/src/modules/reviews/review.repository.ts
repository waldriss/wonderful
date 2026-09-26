import { Prisma, ReviewStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ListProductReviewsQueryDto,
  ListReviewsAdminQueryDto,
} from './review.dto';

/**
 * Repository pour les opérations de base de données avis
 */
export class ReviewRepository {
  /**
   * Récupérer un avis par ID
   */
  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Vérifier si un utilisateur a déjà laissé un avis pour un produit
   */
  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findFirst({
      where: { userId, productId },
    });
  }

  /**
   * Créer un avis
   */
  async create(userId: string, data: CreateReviewDto) {
    return prisma.review.create({
      data: {
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        orderId: data.orderId,
        userId,
        productId: data.productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Mettre à jour un avis
   */
  async update(id: string, data: UpdateReviewDto) {
    return prisma.review.update({
      where: { id },
      data: {
        ...data,
        status: ReviewStatus.PENDING, // Repasse en attente après modification
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Supprimer un avis
   */
  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }

  /**
   * Mettre à jour le statut d'un avis
   */
  async updateStatus(id: string, status: ReviewStatus) {
    return prisma.review.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Liste des avis d'un produit (public)
   */
  async findByProduct(productId: string, query: ListProductReviewsQueryDto) {
    const { page, limit, sortBy } = query;
    const skip = (page - 1) * limit;

    // Uniquement les avis approuvés pour les routes publiques
    const where: Prisma.ReviewWhereInput = {
      productId,
      status: ReviewStatus.APPROVED,
    };

    // Construction du tri
    let orderBy: Prisma.ReviewOrderByWithRelationInput;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  }

  /**
   * Statistiques des avis d'un produit
   */
  async getProductStats(productId: string) {
    const [stats, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: {
          productId,
          status: ReviewStatus.APPROVED,
        },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: {
          productId,
          status: ReviewStatus.APPROVED,
        },
        _count: true,
      }),
    ]);

    // Convertir la distribution en objet
    const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      dist[d.rating] = d._count;
    });

    return {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count,
      distribution: dist as { 1: number; 2: number; 3: number; 4: number; 5: number },
    };
  }

  /**
   * Liste des avis d'un utilisateur
   */
  async findByUser(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Liste des avis (Admin)
   */
  async findManyAdmin(query: ListReviewsAdminQueryDto) {
    const { page, limit, status, productId, userId, rating, search, sortBy } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (rating) where.rating = rating;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let orderBy: Prisma.ReviewOrderByWithRelationInput;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  }

  /**
   * Compter les avis par statut (Admin)
   */
  async countByStatus() {
    const counts = await prisma.review.groupBy({
      by: ['status'],
      _count: true,
    });

    const result: Record<ReviewStatus, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    counts.forEach((c) => {
      result[c.status] = c._count;
    });

    return result;
  }

  /**
   * Compter le nombre total d'avis d'un utilisateur (pour badges et missions)
   */
  async countUserReviews(userId: string): Promise<number> {
    return prisma.review.count({ where: { userId } });
  }
}

export const reviewRepository = new ReviewRepository();
