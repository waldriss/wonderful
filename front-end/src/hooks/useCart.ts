"use client";

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSession } from '@/lib/auth';

/**
 * Hook qui synchronise le panier localStorage avec le serveur.
 *
 * - Au mount : si l'utilisateur est déjà connecté, on charge le panier serveur.
 * - Lors de la transition déconnecté→connecté : on fusionne le panier local → serveur.
 * - Expose les mêmes actions que useCartStore mais avec isAuthenticated injecté.
 */
export function useCart() {
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;

  const {
    items,
    isCartOpen,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    updateQuantity: storeUpdateQuantity,
    clearCart: storeClearCart,
    toggleCart,
    openCart,
    closeCart,
    loadFromServer,
    syncWithServer,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  } = useCartStore();

  // Track previous auth state to detect login transitions
  const wasAuthenticated = useRef<boolean | null>(null);

  useEffect(() => {
    // Don't act while session is loading
    if (isPending) return;

    const previous = wasAuthenticated.current;

    if (isAuthenticated) {
      if (previous === false) {
        // Transition: déconnecté → connecté → merger le panier local avec le serveur
        syncWithServer();
      } else if (previous === null) {
        // Première fois qu'on sait qu'il est connecté → charger depuis le serveur
        loadFromServer();
      }
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, isPending, loadFromServer, syncWithServer]);

  return {
    items,
    isCartOpen,
    isAuthenticated,

    addItem: (item: Parameters<typeof storeAddItem>[0]) =>
      storeAddItem(item, isAuthenticated),

    removeItem: (id: string) =>
      storeRemoveItem(id, isAuthenticated),

    updateQuantity: (id: string, quantity: number) =>
      storeUpdateQuantity(id, quantity, isAuthenticated),

    clearCart: () =>
      storeClearCart(isAuthenticated),

    toggleCart,
    openCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  };
}
