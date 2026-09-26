import { PromoCodeStatus } from '@prisma/client';
import { promoCodeRepository } from './promo-code.repository';
import prisma from '../../lib/prisma';
import { createConflictError, createNotFoundError, createBadRequestError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import {
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  ListPromoCodesQueryDto,
  ValidatePromoCodeDto,
  PromoCodeResponse,
  PromoCodeValidationResponse,
} from './promo-code.dto';
import { PaginatedResult } from '../../shared/types/pagination';

/**
 * Service pour la gestion des codes promo
 */
class PromoCodeService {
  // ============================================
  // ROUTE CLIENT
  // ============================================

  /**
   * Valider un code promo
   */
  async validatePromoCode(userId: string | undefined, data: ValidatePromoCodeDto): Promise<PromoCodeValidationResponse> {
    const promoCode = await promoCodeRepository.findByCode(data.code);

    if (!promoCode) {
      return {
        valid: false,
        code: data.code,
        type: 'PERCENTAGE',
        value: 0,
        discount: 0,
        message: 'Code promo invalide',
      };
    }

    // Vérifications
    if (promoCode.status !== PromoCodeStatus.ACTIVE) {
      return {
        valid: false,
        code: data.code,
        type: promoCode.type,
        value: promoCode.value,
        discount: 0,
        message: "Ce code promo n'est plus actif",
      };
    }

    if (promoCode.validUntil && promoCode.validUntil < new Date()) {
      return {
        valid: false,
        code: data.code,
        type: promoCode.type,
        value: promoCode.value,
        discount: 0,
        message: 'Ce code promo a expiré',
      };
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return {
        valid: false,
        code: data.code,
        type: promoCode.type,
        value: promoCode.value,
        discount: 0,
        message: "Ce code promo a atteint son nombre maximum d'utilisations",
      };
    }

    if (promoCode.minOrderAmount && data.subtotal < promoCode.minOrderAmount) {
      return {
        valid: false,
        code: data.code,
        type: promoCode.type,
        value: promoCode.value,
        discount: 0,
        message: `Montant minimum requis: ${promoCode.minOrderAmount} DA`,
      };
    }

    // Vérifier la limite d'utilisation par utilisateur
    if (userId) {
      const alreadyUsed = await prisma.order.findFirst({
        where: { userId, promoCodeId: promoCode.id },
      });
      if (alreadyUsed) {
        return {
          valid: false,
          code: data.code,
          type: promoCode.type,
          value: promoCode.value,
          discount: 0,
          message: 'Vous avez déjà utilisé ce code promo',
        };
      }
    }

    // Vérifier la condition applicableTo
    if (promoCode.applicableTo === 'FIRST_ORDER') {
      if (!userId) {
        return {
          valid: false,
          code: promoCode.code,
          type: promoCode.type,
          value: promoCode.value,
          discount: 0,
          requiresAuth: true,
          message: 'Connexion requise pour utiliser ce code promo première commande',
        };
      }
      const orderCount = await prisma.order.count({ where: { userId } });
      if (orderCount > 0) {
        return {
          valid: false,
          code: data.code,
          type: promoCode.type,
          value: promoCode.value,
          discount: 0,
          message: 'Ce code promo est réservé à la première commande',
        };
      }
    }

    if (promoCode.applicableTo === 'SUBSCRIPTION') {
      if (!userId) {
        return {
          valid: false,
          code: promoCode.code,
          type: promoCode.type,
          value: promoCode.value,
          discount: 0,
          requiresAuth: true,
          message: 'Connexion requise pour utiliser ce code promo réservé aux abonnés',
        };
      }
      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });
      if (!activeSubscription) {
        return {
          valid: false,
          code: data.code,
          type: promoCode.type,
          value: promoCode.value,
          discount: 0,
          message: 'Ce code promo est réservé aux abonnés actifs',
        };
      }
    }

    // Calculer la réduction
    let discount = 0;
    let message = '';

    switch (promoCode.type) {
      case 'PERCENTAGE':
        discount = Math.round(data.subtotal * (promoCode.value / 100));
        message = `${promoCode.value}% de réduction appliqué`;
        break;
      case 'FIXED':
        discount = Math.min(promoCode.value, data.subtotal);
        message = `${promoCode.value} DA de réduction appliqué`;
        break;
      case 'FREE_DELIVERY':
        discount = data.deliveryFee ?? 0;
        message = 'Livraison gratuite appliquée';
        break;
    }

    return {
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      discount,
      message,
    };
  }

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * Liste des codes promo
   */
  async listPromoCodes(query: ListPromoCodesQueryDto): Promise<PaginatedResult<PromoCodeResponse>> {
    // Mettre à jour les codes expirés avant de lister
    await promoCodeRepository.updateExpiredCodes();
    const { promoCodes, total } = await promoCodeRepository.findMany(query);

    return {
      data: promoCodes.map((p) => this.formatPromoCodeResponse(p)),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Créer un code promo
   */
  async createPromoCode(data: CreatePromoCodeDto): Promise<PromoCodeResponse> {
    // Vérifier si le code existe déjà
    const existing = await promoCodeRepository.findByCode(data.code);
    if (existing) {
      throw createConflictError('Un code promo avec ce code existe déjà');
    }

    const promoCode = await promoCodeRepository.create(data);
    return this.formatPromoCodeResponse(promoCode);
  }

  /**
   * Mettre à jour un code promo
   */
  async updatePromoCode(id: string, data: UpdatePromoCodeDto): Promise<PromoCodeResponse> {
    const existing = await promoCodeRepository.findById(id);
    if (!existing) {
      throw createNotFoundError('Code promo');
    }

    // Vérifier si le nouveau code est unique
    if (data.code && data.code !== existing.code) {
      const codeExists = await promoCodeRepository.findByCode(data.code);
      if (codeExists) {
        throw createConflictError('Un code promo avec ce code existe déjà');
      }
    }

    const promoCode = await promoCodeRepository.update(id, data);
    return this.formatPromoCodeResponse(promoCode);
  }

  /**
   * Supprimer un code promo
   */
  async deletePromoCode(id: string): Promise<{ success: boolean; message: string }> {
    const promoCode = await promoCodeRepository.findById(id);
    if (!promoCode) {
      throw createNotFoundError('Code promo');
    }

    await promoCodeRepository.delete(id);
    return {
      success: true,
      message: 'Code promo supprimé avec succès',
    };
  }

  /**
   * Changer le statut d'un code promo
   */
  async changePromoCodeStatus(id: string, status: PromoCodeStatus): Promise<{ success: boolean; message: string }> {
    const promoCode = await promoCodeRepository.findById(id);
    if (!promoCode) {
      throw createNotFoundError('Code promo');
    }

    if (promoCode.status === status) {
      throw createBadRequestError(`Le code promo est déjà ${status.toLowerCase()}`);
    }

    await promoCodeRepository.updateStatus(id, status);
    return {
      success: true,
      message: `Statut du code promo changé en ${status.toLowerCase()}`,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatPromoCodeResponse(promoCode: PromoCodeResponse): PromoCodeResponse {
    return {
      id: promoCode.id,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description,
      minOrderAmount: promoCode.minOrderAmount,
      maxUses: promoCode.maxUses,
      usedCount: promoCode.usedCount,
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
      status: promoCode.status,
      applicableTo: promoCode.applicableTo,
    };
  }
}

export { PromoCodeService };
export const promoCodeService = new PromoCodeService();
