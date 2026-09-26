import { supplementRepository } from './supplement.repository';
import {
  CreateSupplementDto,
  UpdateSupplementDto,
  SupplementResponse,
} from './supplement.dto';
import {
  createNotFoundError,
  createConflictError,
  createBadRequestError,
} from '../../utils/errors';

/**
 * Service pour la gestion des suppléments
 */
export class SupplementService {
  /**
   * Liste des suppléments actifs (Public)
   */
  async listActiveSupplements(): Promise<SupplementResponse[]> {
    const supplements = await supplementRepository.findActive();
    return supplements.map((s) => this.formatResponse(s));
  }

  /**
   * Liste de tous les suppléments (Admin)
   */
  async listSupplements(): Promise<SupplementResponse[]> {
    const supplements = await supplementRepository.findMany();
    return supplements.map((s) => this.formatResponse(s));
  }

  /**
   * Détails d'un supplément (Admin)
   */
  async getSupplement(id: string): Promise<SupplementResponse> {
    const supplement = await supplementRepository.findById(id);
    if (!supplement) {
      throw createNotFoundError('Supplément');
    }
    return this.formatResponse(supplement);
  }

  /**
   * Créer un supplément (Admin)
   */
  async createSupplement(data: CreateSupplementDto): Promise<SupplementResponse> {
    const existing = await supplementRepository.findByName(data.name);
    if (existing) {
      throw createConflictError('Un supplément avec ce nom existe déjà');
    }

    const supplement = await supplementRepository.create(data);
    return this.formatResponse(supplement);
  }

  /**
   * Mettre à jour un supplément (Admin)
   */
  async updateSupplement(
    id: string,
    data: UpdateSupplementDto
  ): Promise<SupplementResponse> {
    const existing = await supplementRepository.findById(id);
    if (!existing) {
      throw createNotFoundError('Supplément');
    }

    // Vérifier l'unicité du nom si modifié
    if (data.name && data.name !== existing.name) {
      const nameExists = await supplementRepository.findByName(data.name);
      if (nameExists) {
        throw createConflictError('Un supplément avec ce nom existe déjà');
      }
    }

    const supplement = await supplementRepository.update(id, data);
    return this.formatResponse(supplement);
  }

  /**
   * Supprimer un supplément (Admin)
   * Un supplément référencé dans des commandes ou des paniers ne peut pas être supprimé :
   * la suppression casserait l'historique ou les paniers en cours. Il faut le désactiver.
   */
  async deleteSupplement(id: string): Promise<{ success: boolean; message: string }> {
    const supplement = await supplementRepository.findById(id);
    if (!supplement) {
      throw createNotFoundError('Supplément');
    }

    const { orders, carts } = await supplementRepository.countReferences(id);
    if (orders > 0 || carts > 0) {
      throw createBadRequestError(
        'Ce supplément est utilisé dans des commandes ou des paniers existants. Désactivez-le plutôt que de le supprimer.'
      );
    }

    // Les liens produits (product_supplement) sont supprimés en cascade par la base
    await supplementRepository.delete(id);

    return {
      success: true,
      message: 'Supplément supprimé avec succès',
    };
  }

  /**
   * Formater la réponse supplément
   */
  private formatResponse(supplement: any): SupplementResponse {
    return {
      id: supplement.id,
      name: supplement.name,
      description: supplement.description,
      price: supplement.price,
      isActive: supplement.isActive,
      productsCount: supplement._count?.products ?? 0,
      createdAt: supplement.createdAt,
      updatedAt: supplement.updatedAt,
    };
  }
}

export const supplementService = new SupplementService();