import { deliveryZoneRepository } from './delivery-zone.repository';
import { AppError } from '../../utils/errors';
import type {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  DeliveryZoneResponse,
} from './delivery-zone.dto';

/**
 * Service pour la gestion des zones de livraison
 */
export class DeliveryZoneService {
  /**
   * Liste toutes les zones (Admin)
   */
  async listZones(): Promise<DeliveryZoneResponse[]> {
    const zones = await deliveryZoneRepository.findAll();
    return zones.map(this.formatResponse);
  }

  /**
   * Liste les zones actives (Public — pour le checkout)
   */
  async listActiveZones(): Promise<DeliveryZoneResponse[]> {
    const zones = await deliveryZoneRepository.findAllActive();
    return zones.map(this.formatResponse);
  }

  /**
   * Récupérer une zone par ID (Admin)
   */
  async getZone(id: string): Promise<DeliveryZoneResponse> {
    const zone = await deliveryZoneRepository.findById(id);
    if (!zone) throw new AppError('Zone de livraison introuvable', 404);
    return this.formatResponse(zone);
  }

  /**
   * Créer une zone de livraison (Admin)
   */
  async createZone(data: CreateDeliveryZoneDto): Promise<DeliveryZoneResponse> {
    const existing = await deliveryZoneRepository.findByName(data.name);
    if (existing) throw new AppError('Une zone avec ce nom existe déjà', 409);

    const zone = await deliveryZoneRepository.create(data);
    return this.formatResponse(zone);
  }

  /**
   * Mettre à jour une zone de livraison (Admin)
   */
  async updateZone(id: string, data: UpdateDeliveryZoneDto): Promise<DeliveryZoneResponse> {
    const existing = await deliveryZoneRepository.findById(id);
    if (!existing) throw new AppError('Zone de livraison introuvable', 404);

    if (data.name && data.name !== existing.name) {
      const nameConflict = await deliveryZoneRepository.findByName(data.name);
      if (nameConflict) throw new AppError('Une zone avec ce nom existe déjà', 409);
    }

    const zone = await deliveryZoneRepository.update(id, data);
    return this.formatResponse(zone);
  }

  /**
   * Supprimer une zone de livraison (Admin)
   */
  async deleteZone(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await deliveryZoneRepository.findById(id);
    if (!existing) throw new AppError('Zone de livraison introuvable', 404);

    await deliveryZoneRepository.delete(id);
    return { success: true, message: 'Zone de livraison supprimée avec succès' };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatResponse(zone: any): DeliveryZoneResponse {
    return {
      id: zone.id,
      name: zone.name,
      fee: zone.fee,
      minOrderAmount: zone.minOrderAmount,
      isActive: zone.isActive,
    };
  }
}

export const deliveryZoneService = new DeliveryZoneService();
