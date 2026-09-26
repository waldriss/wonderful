import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createOrder,
  cancelOrder,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearServerCart,
  mergeCart,
} from './clientRequests';
import { orderKeys } from './queries';
import type { Cart, CreateOrderDto, MergeCartDto, AddCartItemDto, UpdateCartItemQuantityDto } from './types';

// ============================================
// CART MUTATIONS
// ============================================

/**
 * Ajouter un item au panier serveur (avec suppléments optionnels).
 * Optimistic update sur le cache cart.
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AddCartItemDto) => addCartItem(dto),
    onSuccess: (cart) => {
      queryClient.setQueryData(orderKeys.cart(), cart);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.cart() });
    },
  });
}

/**
 * Mettre à jour la quantité d'une ligne précise du panier serveur.
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, dto }: { itemId: string; dto: UpdateCartItemQuantityDto }) =>
      updateCartItemQuantity(itemId, dto),
    onSuccess: (cart) => {
      queryClient.setQueryData(orderKeys.cart(), cart);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.cart() });
    },
  });
}

/**
 * Retirer une ligne précise du panier serveur.
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.cart() });
      const previousCart = queryClient.getQueryData<Cart>(orderKeys.cart());

      queryClient.setQueryData<Cart>(orderKeys.cart(), (old) => {
        if (!old) return old;
        const items = old.items.filter((i) => i.id !== itemId);
        return {
          ...old,
          items,
          totalItems: items.reduce((s, i) => s + i.quantity, 0),
          subtotal: items.reduce((s, i) => s + i.subtotal, 0),
        };
      });

      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(orderKeys.cart(), context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(orderKeys.cart(), cart);
    },
  });
}

/**
 * Vider le panier serveur.
 */
export function useClearServerCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearServerCart,
    onSuccess: () => {
      queryClient.setQueryData(orderKeys.cart(), { items: [], totalItems: 0, subtotal: 0 });
    },
  });
}

/**
 * Fusionner le panier local → serveur (appelé au login).
 */
export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: MergeCartDto) => mergeCart(dto),
    onSuccess: (cart) => {
      queryClient.setQueryData(orderKeys.cart(), cart);
    },
  });
}

// ============================================
// ORDER MUTATIONS
// ============================================

/**
 * Créer une commande.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => createOrder(data),
    onSuccess: (order) => {
      // Invalider la liste des commandes
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Vider le panier côté cache
      queryClient.setQueryData(orderKeys.cart(), { items: [], totalItems: 0, subtotal: 0 });
      toast.success(`Commande ${order.orderNumber} créée avec succès !`);
    },
    onError: (error) => {
      toast.error(error.message ?? 'Erreur lors de la création de la commande');
    },
  });
}

/**
 * Annuler une commande.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Commande annulée avec succès');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Impossible d\'annuler cette commande');
    },
  });
}
