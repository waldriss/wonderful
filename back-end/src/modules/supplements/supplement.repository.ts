import prisma from '../../lib/prisma';
import { CreateSupplementDto, UpdateSupplementDto } from './supplement.dto';

/**
 * Repository pour les opérations de base de données suppléments
 */
export class SupplementRepository {
  /**
   * Récupérer tous les suppléments (admin) avec le nombre de produits associés
   */
  async findMany() {
    return prisma.supplement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Récupérer les suppléments actifs uniquement (public)
   */
  async findActive() {
    return prisma.supplement.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Récupérer un supplément par ID
   */
  async findById(id: string) {
    return prisma.supplement.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Récupérer un supplément par nom (unicité)
   */
  async findByName(name: string) {
    return prisma.supplement.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  /**
   * Créer un supplément
   */
  async create(data: CreateSupplementDto) {
    return prisma.supplement.create({
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Mettre à jour un supplément
   */
  async update(id: string, data: UpdateSupplementDto) {
    return prisma.supplement.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  /**
   * Supprimer un supplément
   */
  async delete(id: string) {
    return prisma.supplement.delete({ where: { id } });
  }

  /**
   * Compter les références du supplément (commandes + paniers)
   * Un supplément référencé ne peut pas être supprimé (intégrité des données)
   */
  async countReferences(id: string): Promise<{ orders: number; carts: number }> {
    const [orders, carts] = await Promise.all([
      prisma.orderItemSupplement.count({ where: { supplementId: id } }),
      prisma.cartItemSupplement.count({ where: { supplementId: id } }),
    ]);
    return { orders, carts };
  }
}

export const supplementRepository = new SupplementRepository();