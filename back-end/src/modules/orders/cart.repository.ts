import prisma from '../../lib/prisma';

// Type complet d'un item panier avec données produit et suppléments
export type CartItemWithProduct = {
  id: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    discount: number | null;
    isOnSale: boolean;
    image: string;
    category: string;
    stock: number;
    status: string;
  };
  supplements: Array<{
    id: string;
    quantity: number;
    supplementId: string;
    supplement: {
      id: string;
      name: string;
      price: number;
      isActive: boolean;
    };
  }>;
};

// Signature de suppléments d'une ligne de panier (combinaison suppléments + quantités)
export type CartItemSupplementInput = {
  supplementId: string;
  quantity: number;
};

/**
 * Repository pour la gestion du panier côté serveur
 */
export class CartRepository {
  private readonly cartInclude = {
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        discount: true,
        isOnSale: true,
        image: true,
        category: true,
        stock: true,
        status: true,
      },
    },
    supplements: {
      include: {
        supplement: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
      },
    },
  };

  /**
   * Récupérer tous les items du panier d'un utilisateur
   */
  async getCart(userId: string): Promise<CartItemWithProduct[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: this.cartInclude,
      orderBy: { createdAt: 'asc' },
    }) as unknown as CartItemWithProduct[];
  }

  /**
   * Récupérer un item précis du panier (vérifie le propriétaire)
   */
  async findItemById(userId: string, itemId: string): Promise<CartItemWithProduct | null> {
    return prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: this.cartInclude,
    }) as unknown as CartItemWithProduct | null;
  }

  /**
   * Trouver une ligne existante avec la même combinaison de suppléments
   * Deux lignes du même produit avec des suppléments différents sont distinctes
   */
  async findMatchingItem(
    userId: string,
    productId: string,
    supplements: CartItemSupplementInput[]
  ): Promise<CartItemWithProduct | null> {
    const items = await this.getCart(userId);
    const target = this.signature(supplements);

    return (
      items.find(
        (item) =>
          item.productId === productId &&
          this.signature(
            item.supplements.map((s) => ({ supplementId: s.supplementId, quantity: s.quantity }))
          ) === target
      ) ?? null
    );
  }

  /**
   * Ajouter ou mettre à jour un item.
   * Si une ligne avec la même combinaison de suppléments existe, on incrémente la quantité.
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    supplements: CartItemSupplementInput[] = []
  ): Promise<CartItemWithProduct> {
    const existing = await this.findMatchingItem(userId, productId, supplements);

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
        include: this.cartInclude,
      }) as unknown as CartItemWithProduct;
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        supplements:
          supplements.length > 0
            ? { create: supplements.map((s) => ({ supplementId: s.supplementId, quantity: s.quantity })) }
            : undefined,
      },
      include: this.cartInclude,
    }) as unknown as CartItemWithProduct;
  }

  /**
   * Mettre à jour la quantité d'une ligne précise
   * Retourne null si la ligne n'existe pas ou n'appartient pas à l'utilisateur
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItemWithProduct | null> {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      select: { id: true },
    });
    if (!item) return null;

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: this.cartInclude,
    }) as unknown as CartItemWithProduct;
  }

  /**
   * Retirer une ligne précise du panier
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { id: itemId, userId },
    });
  }

  /**
   * Vider le panier d'un utilisateur
   */
  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  /**
   * Fusionner des items locaux avec le panier serveur.
   * Stratégie : si une ligne identique (mêmes suppléments) existe, on prend la quantité max.
   * Sinon, on crée la ligne avec ses suppléments.
   */
  async mergeCart(
    userId: string,
    items: Array<{ productId: string; quantity: number; supplements: CartItemSupplementInput[] }>
  ): Promise<CartItemWithProduct[]> {
    if (items.length === 0) {
      return this.getCart(userId);
    }

    for (const localItem of items) {
      const existing = await this.findMatchingItem(userId, localItem.productId, localItem.supplements);
      if (existing) {
        const mergedQty = Math.max(existing.quantity, localItem.quantity);
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: mergedQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: localItem.productId,
            quantity: localItem.quantity,
            supplements:
              localItem.supplements.length > 0
                ? { create: localItem.supplements.map((s) => ({ supplementId: s.supplementId, quantity: s.quantity })) }
                : undefined,
          },
        });
      }
    }

    return this.getCart(userId);
  }

  /**
   * Signature canonique d'une combinaison de suppléments (triée par ID)
   * Permet de comparer deux lignes de panier entre elles
   */
  private signature(supplements: CartItemSupplementInput[]): string {
    return [...supplements]
      .sort((a, b) => a.supplementId.localeCompare(b.supplementId))
      .map((s) => `${s.supplementId}:${s.quantity}`)
      .join('|');
  }
}

export const cartRepository = new CartRepository();