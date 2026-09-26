import { Prisma, PromoCodeStatus, PromoCodeType } from '@prisma/client';
import prisma from '../../lib/prisma';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ListPromoCodesQueryDto } from './promo-code.dto';

/**
 * Repository pour les opérations de base de données codes promo
 */
export class PromoCodeRepository {
  /**
   * Récupérer un code promo par ID
   */
  async findById(id: string) {
    return prisma.promoCode.findUnique({
      where: { id },
    });
  }

  /**
   * Récupérer un code promo par code
   */
  async findByCode(code: string) {
    return prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  /**
   * Créer un code promo
   */
  async create(data: CreatePromoCodeDto) {
    return prisma.promoCode.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  }

  /**
   * Mettre à jour un code promo
   */
  async update(id: string, data: UpdatePromoCodeDto) {
    return prisma.promoCode.update({
      where: { id },
      data: {
        ...data,
        code: data.code?.toUpperCase(),
      },
    });
  }

  /**
   * Supprimer un code promo
   */
  async delete(id: string) {
    return prisma.promoCode.delete({
      where: { id },
    });
  }

  /**
   * Mettre à jour le statut
   */
  async updateStatus(id: string, status: PromoCodeStatus) {
    return prisma.promoCode.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Incrémenter le compteur d'utilisation
   */
  async incrementUsage(id: string) {
    return prisma.promoCode.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  /**
   * Liste paginée des codes promo
   */
  async findMany(query: ListPromoCodesQueryDto) {
    const { page, limit, status, type, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PromoCodeWhereInput = {};

    if (status) where.status = status;
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [promoCodes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { validFrom: 'desc' },
      }),
      prisma.promoCode.count({ where }),
    ]);

    return { promoCodes, total };
  }

  /**
   * Vérifier les codes expirés et mettre à jour leur statut
   */
  async updateExpiredCodes() {
    return prisma.promoCode.updateMany({
      where: {
        status: PromoCodeStatus.ACTIVE,
        validUntil: { lt: new Date() },
      },
      data: { status: PromoCodeStatus.EXPIRED },
    });
  }
}

export const promoCodeRepository = new PromoCodeRepository();
