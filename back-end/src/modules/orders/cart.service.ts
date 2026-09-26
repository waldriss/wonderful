import { ProductStatus } from '@prisma/client';
import { cartRepository, CartItemWithProduct } from './cart.repository';
import { productRepository } from '../products/product.repository';
import { supplementRepository } from '../supplements/supplement.repository';
import {
  createNotFoundError,
  createBadRequestError,
} from '../../utils/errors';

// ============================================
// TYPES
// ============================================

export interface CartSupplementResponse {
  supplementId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number; // Prix total du supplément pour cette ligne (price × quantity × productQuantity)
}

export interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  price: number;
  finalPrice: number;
  discount: number | null;
  isOnSale: boolean;
  quantity: number;
  supplements: CartSupplementResponse[];
  unitTotal: number; // finalPrice + suppléments (par unité de produit)
  subtotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  supplements?: { supplementId: string; quantity: number }[];
}

export interface MergeCartDto {
  items: CartItemInput[];
}

// ============================================
// SERVICE
// ============================================

/**
 * Service pour la gestion du panier côté serveur
 */
export class CartService {
  /**
   * Valider que les suppléments sont disponibles et liés au produit
   */
  private async validateSupplements(
    productId: string,
    supplements: { supplementId: string; quantity: number }[]
  ): Promise<void> {
    if (!supplements?.length) return;

    // Récupérer le produit avec ses suppléments liés (le repository les inclut déjà)
    const product = await productRepository.findById(productId);
    const linked = new Map(
      (product?.supplements ?? [])
        .filter((link: any) => link.supplement.isActive)
        .map((link: any) => [link.supplementId, link.supplement])
    );

    for (const supplement of supplements) {
      if (!Number.isInteger(supplement.quantity) || supplement.quantity < 1) {
        throw createBadRequestError('La quantité d\'un supplément doit être positive');
      }

      const supplementInfo = linked.get(supplement.supplementId);
      if (!supplementInfo) {
        throw createBadRequestError('Un supplément sélectionné n\'est plus disponible pour ce produit');
      }

      // Vérifier que le supplément est toujours actif (désactivation admin)
      const current = await supplementRepository.findById(supplement.supplementId);
      if (!current?.isActive) {
        throw createBadRequestError(`Le supplément "${supplementInfo.name}" n'est plus disponible`);
      }
    }
  }

  /**
   * Formater un item panier en réponse
   */
  private formatItem(item: CartItemWithProduct): CartItemResponse {
    const finalPrice =
      item.product.isOnSale && item.product.discount
        ? Math.round(item.product.price * (1 - item.product.discount / 100))
        : item.product.price;

    // Prix des suppléments par unité de produit (ex: 2 pizzas × 1 fromage = fromage compté 2×)
    const supplements: CartSupplementResponse[] = item.supplements.map((s) => ({
      supplementId: s.supplementId,
      name: s.supplement.name,
      price: s.supplement.price,
      quantity: s.quantity,
      subtotal: s.supplement.price * s.quantity * item.quantity,
    }));
    const supplementsUnitTotal = supplements.reduce((sum, s) => sum + s.price * s.quantity, 0);

    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.image,
      productCategory: item.product.category,
      price: item.product.price,
      finalPrice,
      discount: item.product.discount,
      isOnSale: item.product.isOnSale,
      quantity: item.quantity,
      supplements,
      unitTotal: finalPrice + supplementsUnitTotal,
      subtotal: (finalPrice + supplementsUnitTotal) * item.quantity,
    };
  }

  /**
   * Formater le panier complet
   */
  private formatCart(items: CartItemWithProduct[]): CartResponse {
    const formatted = items.map((i) => this.formatItem(i));
    return {
      items: formatted,
      totalItems: formatted.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: formatted.reduce((sum, i) => sum + i.subtotal, 0),
    };
  }

  /**
   * Récupérer le panier d'un utilisateur
   */
  async getCart(userId: string): Promise<CartResponse> {
    const items = await cartRepository.getCart(userId);
    return this.formatCart(items);
  }

  /**
   * Ajouter un item dans le panier (avec suppléments optionnels)
   */
  async addItem(userId: string, dto: CartItemInput): Promise<CartResponse> {
    // Valider le produit
    const product = await productRepository.findById(dto.productId);
    if (!product) throw createNotFoundError('Produit');
    if (product.status !== ProductStatus.ACTIVE) {
      throw createBadRequestError(`Le produit "${product.name}" n'est pas disponible`);
    }
    if (dto.quantity <= 0) throw createBadRequestError('La quantité doit être positive');

    // Valider les suppléments (existence, activité, lien avec le produit)
    await this.validateSupplements(dto.productId, dto.supplements ?? []);

    await cartRepository.addItem(userId, dto.productId, dto.quantity, dto.supplements ?? []);
    const items = await cartRepository.getCart(userId);
    return this.formatCart(items);
  }

  /**
   * Mettre à jour la quantité d'une ligne précise du panier
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<CartResponse> {
    if (quantity <= 0) throw createBadRequestError('La quantité doit être positive');

    const updated = await cartRepository.updateItemQuantity(userId, itemId, quantity);
    if (!updated) throw createNotFoundError('Article du panier');

    const items = await cartRepository.getCart(userId);
    return this.formatCart(items);
  }

  /**
   * Retirer une ligne précise du panier
   */
  async removeItem(userId: string, itemId: string): Promise<CartResponse> {
    const item = await cartRepository.findItemById(userId, itemId);
    if (!item) throw createNotFoundError('Article du panier');

    await cartRepository.removeItem(userId, itemId);
    const items = await cartRepository.getCart(userId);
    return this.formatCart(items);
  }

  /**
   * Vider le panier
   */
  async clearCart(userId: string): Promise<{ success: boolean; message: string }> {
    await cartRepository.clearCart(userId);
    return { success: true, message: 'Panier vidé avec succès' };
  }

  /**
   * Fusionner le panier local (non connecté) avec le panier serveur
   */
  async mergeCart(userId: string, dto: MergeCartDto): Promise<CartResponse> {
    // Valider tous les items locaux avant fusion
    for (const item of dto.items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== ProductStatus.ACTIVE) continue;
      await this.validateSupplements(item.productId, item.supplements ?? []);
    }

    const items = await cartRepository.mergeCart(
      userId,
      dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        supplements: item.supplements ?? [],
      }))
    );
    return this.formatCart(items);
  }
}

export const cartService = new CartService();