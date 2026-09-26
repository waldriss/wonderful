import prisma from '../../lib/prisma';
import type { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './delivery-zone.dto';

/**
 * Repository pour les opérations de base de données zones de livraison
 */
export class DeliveryZoneRepository {
  /**
   * Récupérer toutes les zones de livraison
   */
  async findAll() {
    return prisma.deliveryZone.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Récupérer uniquement les zones actives (pour le checkout)
   */
  async findAllActive() {
    return prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Récupérer une zone par ID
   */
  async findById(id: string) {
    return prisma.deliveryZone.findUnique({
      where: { id },
    });
  }

  /**
   * Vérifier si une zone avec le même nom existe
   */
  async findByName(name: string) {
    return prisma.deliveryZone.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  /**
   * Créer une zone de livraison
   */
  async create(data: CreateDeliveryZoneDto) {
    return prisma.deliveryZone.create({
      data: {
        name: data.name,
        fee: data.fee,
        minOrderAmount: data.minOrderAmount ?? null,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Mettre à jour une zone de livraison
   */
  async update(id: string, data: UpdateDeliveryZoneDto) {
    return prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.fee !== undefined && { fee: data.fee }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Supprimer une zone de livraison
   */
  async delete(id: string) {
    return prisma.deliveryZone.delete({
      where: { id },
    });
  }
}

export const deliveryZoneRepository = new DeliveryZoneRepository();
