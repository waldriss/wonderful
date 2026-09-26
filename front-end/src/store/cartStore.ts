import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addCartItem, removeCartItem, updateCartItemQuantity, clearServerCart, mergeCart, getCart } from '@/lib/api/orders/clientRequests';
import type { Cart, CartSupplementInput } from '@/lib/api/orders/types';

export interface CartSupplement {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  /** Identifiant de ligne (id serveur ou clé locale `local-...`) */
  lineId: string;
  /** Identifiant du produit */
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  discount?: number;
  isOnSale?: boolean;
  /** Suppléments sélectionnés pour cette ligne */
  supplements?: CartSupplement[];
  // Optional product details
  description?: string;
  rating?: number;
  nutrition?: {
    calories: number;
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

/**
 * Signature canonique d'une combinaison de suppléments (triée par ID).
 * Deux lignes du même produit avec des suppléments différents sont distinctes.
 */
function supplementsSignature(supplements: CartSupplement[] = []): string {
  return [...supplements]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => `${s.id}:${s.quantity}`)
    .join('|');
}

/** Clé locale d'une ligne (préfixe `local-`, non envoyée au serveur) */
function makeLocalLineId(productId: string, supplements: CartSupplement[] = []): string {
  return `local-${productId}-${supplementsSignature(supplements)}`;
}

/** Prix unitaire final d'un produit (avec réduction) */
function unitPriceOf(item: Pick<CartItem, 'price' | 'discount' | 'isOnSale'>): number {
  return item.isOnSale && item.discount
    ? Math.round(item.price * (1 - item.discount / 100))
    : item.price;
}

/** Prix des suppléments par unité de produit */
function supplementsUnitTotal(supplements: CartSupplement[] = []): number {
  return supplements.reduce((sum, s) => sum + s.price * s.quantity, 0);
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'lineId'>, isAuthenticated?: boolean) => void;
  removeItem: (lineId: string, isAuthenticated?: boolean) => void;
  updateQuantity: (lineId: string, quantity: number, isAuthenticated?: boolean) => void;
  clearCart: (isAuthenticated?: boolean) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Server sync actions
  loadFromServer: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  replaceWithServerCart: (cart: Cart) => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (id: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (product, isAuthenticated = false) => {
        const items = get().items;
        const supplements = product.supplements ?? [];
        const signature = supplementsSignature(supplements);

        // Chercher une ligne existante avec la même combinaison produit + suppléments
        const existingItem = items.find(
          (item) => item.id === product.id && supplementsSignature(item.supplements) === signature
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          set({
            items: items.map((item) =>
              item.lineId === existingItem.lineId ? { ...item, quantity: newQuantity } : item
            ),
          });

          if (isAuthenticated) {
            addCartItem({
              productId: product.id,
              quantity: newQuantity,
              supplements: toSupplementInput(supplements),
            }).catch(() => {});
          }
        } else {
          const newItem: CartItem = {
            ...product,
            quantity: 1,
            lineId: makeLocalLineId(product.id, supplements),
          };
          set({ items: [...items, newItem] });

          if (isAuthenticated) {
            addCartItem({
              productId: product.id,
              quantity: 1,
              supplements: toSupplementInput(supplements),
            }).catch(() => {});
          }
        }
      },

      removeItem: (lineId, isAuthenticated = false) => {
        const item = get().items.find((i) => i.lineId === lineId);
        if (!item) return;

        set({
          items: get().items.filter((i) => i.lineId !== lineId),
        });

        // Supprimer côté serveur uniquement si la ligne a un id serveur
        if (isAuthenticated && !lineId.startsWith('local-')) {
          removeCartItem(lineId).catch(() => {});
        }
      },

      updateQuantity: (lineId, quantity, isAuthenticated = false) => {
        if (quantity <= 0) {
          get().removeItem(lineId, isAuthenticated);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.lineId === lineId ? { ...item, quantity } : item
          ),
        });

        if (isAuthenticated) {
          const item = get().items.find((i) => i.lineId === lineId);
          if (!item) return;

          if (lineId.startsWith('local-')) {
            // Ligne encore locale : upsert (le serveur trouve la ligne correspondante)
            addCartItem({
              productId: item.id,
              quantity,
              supplements: toSupplementInput(item.supplements),
            }).catch(() => {});
          } else {
            updateCartItemQuantity(lineId, { quantity }).catch(() => {});
          }
        }
      },

      clearCart: (isAuthenticated = false) => {
        set({ items: [] });

        if (isAuthenticated) {
          clearServerCart().catch(() => {});
        }
      },

      toggleCart: () => {
        set({ isCartOpen: !get().isCartOpen });
      },

      openCart: () => {
        set({ isCartOpen: true });
      },

      closeCart: () => {
        set({ isCartOpen: false });
      },

      /**
       * Charger le panier depuis le serveur (remplace le local).
       * Appelé au mount si l'utilisateur est déjà connecté.
       */
      loadFromServer: async () => {
        try {
          const cart = await getCart();
          get().replaceWithServerCart(cart);
        } catch {
          // Silencieux — on garde le panier local si la requête échoue
        }
      },

      /**
       * Fusionner le panier local → serveur (appelé après login).
       * Le serveur devient ensuite la source de vérité.
       */
      syncWithServer: async () => {
        try {
          const localItems = get().items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            supplements: toSupplementInput(item.supplements),
          }));
          const serverCart = await mergeCart({ items: localItems });
          get().replaceWithServerCart(serverCart);
        } catch {
          // Silencieux — on garde le panier local
        }
      },

      /**
       * Remplacer les items locaux par le contenu du panier serveur.
       */
      replaceWithServerCart: (cart) => {
        const items: CartItem[] = cart.items.map((item) => ({
          lineId: item.id,
          id: item.productId,
          name: item.productName,
          price: item.price,
          image: item.productImage,
          category: item.productCategory,
          quantity: item.quantity,
          discount: item.discount ?? undefined,
          isOnSale: item.isOnSale,
          supplements: item.supplements.map((s) => ({
            id: s.supplementId,
            name: s.name,
            price: s.price,
            quantity: s.quantity,
          })),
        }));
        set({ items });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const unitTotal = unitPriceOf(item) + supplementsUnitTotal(item.supplements);
          return total + unitTotal * item.quantity;
        }, 0);
      },

      getItemQuantity: (id) => {
        const items = get().items.filter((item) => item.id === id);
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'wonderful-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/** Convertir les suppléments du store vers le format envoyé à l'API */
function toSupplementInput(supplements: CartSupplement[] = []): CartSupplementInput[] {
  return supplements.map((s) => ({ supplementId: s.id, quantity: s.quantity }));
}