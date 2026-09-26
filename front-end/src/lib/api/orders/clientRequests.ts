import { apiGet, apiPost, apiPatch, apiDelete } from '../apiFetch';
import type {
  Cart,
  Order,
  OrderSummary,
  OrderListParams,
  CreateOrderDto,
  AddCartItemDto,
  UpdateCartItemQuantityDto,
  MergeCartDto,
  PaginatedResponse,
} from './types';

// ============================================
// HELPERS
// ============================================

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

// ============================================
// CART
// ============================================

/**
 * GET /api/orders/cart
 */
export async function getCart(): Promise<Cart> {
  const res = await apiGet('/api/orders/cart');
  const json = await parseResponse<{ success: boolean; data: Cart }>(res);
  return json.data;
}

/**
 * POST /api/orders/cart
 * Ajouter un item (avec suppléments optionnels).
 * Si une ligne identique (mêmes suppléments) existe, la quantité est incrémentée côté serveur.
 */
export async function addCartItem(dto: AddCartItemDto): Promise<Cart> {
  const res = await apiPost('/api/orders/cart', dto);
  const json = await parseResponse<{ success: boolean; data: Cart }>(res);
  return json.data;
}

/**
 * PATCH /api/orders/cart/:itemId
 * Mettre à jour la quantité d'une ligne précise
 */
export async function updateCartItemQuantity(
  itemId: string,
  dto: UpdateCartItemQuantityDto
): Promise<Cart> {
  const res = await apiPatch(`/api/orders/cart/${itemId}`, dto);
  const json = await parseResponse<{ success: boolean; data: Cart }>(res);
  return json.data;
}

/**
 * DELETE /api/orders/cart/:itemId
 * Retirer une ligne précise du panier
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await apiDelete(`/api/orders/cart/${itemId}`);
  const json = await parseResponse<{ success: boolean; data: Cart }>(res);
  return json.data;
}

/**
 * DELETE /api/orders/cart
 * Vider le panier
 */
export async function clearServerCart(): Promise<void> {
  const res = await apiDelete('/api/orders/cart');
  await parseResponse<{ success: boolean }>(res);
}

/**
 * POST /api/orders/cart/merge
 * Fusionner panier local → serveur
 */
export async function mergeCart(dto: MergeCartDto): Promise<Cart> {
  const res = await apiPost('/api/orders/cart/merge', dto);
  const json = await parseResponse<{ success: boolean; data: Cart }>(res);
  return json.data;
}

// ============================================
// ORDERS
// ============================================

/**
 * GET /api/orders
 */
export async function getOrders(params: OrderListParams = {}): Promise<PaginatedResponse<OrderSummary>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);

  const qs = query.toString();
  const res = await apiGet(`/api/orders${qs ? `?${qs}` : ''}`);
  return parseResponse<PaginatedResponse<OrderSummary>>(res);
}

/**
 * GET /api/orders/:id
 */
export async function getOrderById(id: string): Promise<Order> {
  const res = await apiGet(`/api/orders/${id}`);
  const json = await parseResponse<{ success: boolean; data: Order }>(res);
  return json.data;
}

/**
 * POST /api/orders
 * Créer une commande
 */
export async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await apiPost('/api/orders', data);
  const json = await parseResponse<{ success: boolean; data: Order }>(res);
  return json.data;
}

/**
 * POST /api/orders/:id/cancel
 */
export async function cancelOrder(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiPost(`/api/orders/${id}/cancel`);
  return parseResponse<{ success: boolean; message: string }>(res);
}