import { ReviewStatus } from '@prisma/client';
import { reviewRepository } from './review.repository';
import { productRepository } from '../products/product.repository';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ListProductReviewsQueryDto,
  ListReviewsAdminQueryDto,
  ReviewResponse,
  ReviewWithProductResponse,
  ProductReviewsStatsResponse,
  ReviewAdminResponse,
} from './review.dto';
import {
  createNotFoundError,
  createConflictError,
  createForbiddenError,
  createBadRequestError,
} from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { PaginatedResult } from '../../shared/types/pagination';
import { gamificationService } from '../gamification/gamification.service';

/**
 * Service pour la gestion des avis
 */
export class ReviewService {
  // ============================================
  // ROUTES CLIENT
  // ============================================

  /**
   * Créer un avis
   */
  async createReview(
    userId: string,
    data: CreateReviewDto
  ): Promise<ReviewWithProductResponse> {
    // Vérifier que le produit existe
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw createNotFoundError('Produit');
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await reviewRepository.findByUserAndProduct(
      userId,
      data.productId
    );
    if (existingReview) {
      throw createConflictError('Vous avez déjà laissé un avis pour ce produit');
    }

    // TODO: Vérifier si l'utilisateur a commandé ce produit (optionnel)

    const review = await reviewRepository.create(userId, data);

    // REVIEW_COUNT a été retiré du système de missions
    // Les avis ne déclenchent plus de missions gamification

    return this.formatReviewWithProduct(review);
  }

  /**
   * Récupérer les avis d'un produit
   */
  async getProductReviews(
    productId: string,
    query: ListProductReviewsQueryDto
  ): Promise<PaginatedResult<ReviewResponse> & { stats: ProductReviewsStatsResponse }> {
    // Vérifier que le produit existe
    const product = await productRepository.findById(productId);
    if (!product) {
      throw createNotFoundError('Produit');
    }

    const [{ reviews, total }, stats] = await Promise.all([
      reviewRepository.findByProduct(productId, query),
      reviewRepository.getProductStats(productId),
    ]);

    return {
      data: reviews.map((r) => this.formatReview(r, productId)),
      meta: buildPaginationMeta(total, query.page, query.limit),
      stats,
    };
  }

  /**
   * Récupérer mes avis
   */
  async getMyReviews(userId: string): Promise<ReviewWithProductResponse[]> {
    const reviews = await reviewRepository.findByUser(userId);
    return reviews.map((r) => this.formatReviewWithProduct(r));
  }

  /**
   * Mettre à jour mon avis
   */
  async updateMyReview(
    userId: string,
    reviewId: string,
    data: UpdateReviewDto
  ): Promise<ReviewWithProductResponse> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw createNotFoundError('Avis');
    }

    if (review.user.id !== userId) {
      throw createForbiddenError('Vous ne pouvez modifier que vos propres avis');
    }

    const updatedReview = await reviewRepository.update(reviewId, data);

    return this.formatReviewWithProduct(updatedReview);
  }

  /**
   * Supprimer mon avis
   */
  async deleteMyReview(
    userId: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw createNotFoundError('Avis');
    }

    if (review.user.id !== userId) {
      throw createForbiddenError('Vous ne pouvez supprimer que vos propres avis');
    }

    await reviewRepository.delete(reviewId);

    // Recalculer la note du produit
    await productRepository.updateRating(review.product.id);

    return {
      success: true,
      message: 'Avis supprimé avec succès',
    };
  }

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * Liste des avis (Admin)
   */
  async listReviewsAdmin(
    query: ListReviewsAdminQueryDto
  ): Promise<PaginatedResult<ReviewAdminResponse>> {
    const { reviews, total } = await reviewRepository.findManyAdmin(query);

    return {
      data: reviews.map((r) => this.formatReviewAdmin(r)),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Changer le statut d'un avis (Admin)
   */
  async changeReviewStatus(
    reviewId: string,
    status: ReviewStatus
  ): Promise<{ success: boolean; message: string }> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw createNotFoundError('Avis');
    }

    if (review.status === status) {
      throw createBadRequestError(`L'avis est déjà ${status.toLowerCase()}`);
    }

    await reviewRepository.updateStatus(reviewId, status);

    // Recalculer la note du produit si l'avis passe à APPROVED ou quitte APPROVED
    if (status === ReviewStatus.APPROVED || review.status === ReviewStatus.APPROVED) {
      await productRepository.updateRating(review.product.id);
    }

    return {
      success: true,
      message: `Statut de l'avis changé en ${status.toLowerCase()}`,
    };
  }

  /**
   * Supprimer un avis (Admin)
   */
  async deleteReview(
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw createNotFoundError('Avis');
    }

    await reviewRepository.delete(reviewId);

    // Recalculer la note du produit
    await productRepository.updateRating(review.product.id);

    return {
      success: true,
      message: 'Avis supprimé avec succès',
    };
  }

  /**
   * Statistiques des avis (Admin)
   */
  async getReviewsStats() {
    const byStatus = await reviewRepository.countByStatus();

    return {
      byStatus,
      total: Object.values(byStatus).reduce((a, b) => a + b, 0),
      pendingCount: byStatus.PENDING,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatReview(review: any, productId: string): ReviewResponse {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      helpful: review.helpful,
      response: review.response,
      responseAt: review.responseAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image,
      },
      productId,
    };
  }

  private formatReviewWithProduct(review: any): ReviewWithProductResponse {
    return {
      ...this.formatReview(review, review.productId),
      product: {
        id: review.product.id,
        name: review.product.name,
        image: review.product.image,
      },
    };
  }

  private formatReviewAdmin(review: any): ReviewAdminResponse {
    return {
      ...this.formatReviewWithProduct(review),
      userId: review.user.id,
      orderId: review.orderId,
    };
  }
}

export const reviewService = new ReviewService();
