import { apiGet } from '@/lib/api/apiFetch';
import type {
  Product,
  ProductCategory_,
  ProductFilters,
  ProductListParams,
  ProductListResponse,
  ProductDetailResponse,
  ProductCategoriesResponse,
  ProductFiltersResponse,
  PaginatedResponse,
} from './types';

/**
 * Convertit un objet de paramètres en query string, en omettant les undefined/null.
 */
function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * GET /api/products
 * Liste paginée des produits avec filtres.
 */
export async function getProducts(
  params: ProductListParams = {}
): Promise<ProductListResponse> {
  const qs = toQueryString(params as Record<string, unknown>);
  const response = await apiGet(`/api/products${qs}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des produits (${response.status})`);
  }

  return response.json();
}

/**
 * GET /api/products/:id
 * Détails d'un produit.
 */
export async function getProductById(id: string): Promise<Product> {
  const response = await apiGet(`/api/products/${id}`);

  if (!response.ok) {
    if (response.status === 404) throw new Error('Produit introuvable');
    throw new Error(`Erreur lors de la récupération du produit (${response.status})`);
  }

  const json: ProductDetailResponse = await response.json();
  return json.data;
}

/**
 * GET /api/products/categories
 * Liste des catégories avec comptage.
 */
export async function getCategories(): Promise<ProductCategory_[]> {
  const response = await apiGet('/api/products/categories');

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des catégories (${response.status})`);
  }

  const json: ProductCategoriesResponse = await response.json();
  return json.data;
}

/**
 * GET /api/products/filters
 * Options de filtres disponibles.
 */
export async function getFilters(): Promise<ProductFilters> {
  const response = await apiGet('/api/products/filters');

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des filtres (${response.status})`);
  }

  const json: ProductFiltersResponse = await response.json();
  return json.data;
}

/**
 * GET /api/products/suggestions
 * Suggestions personnalisées pour l'utilisateur connecté.
 */
export async function getSuggestions(limit: number = 8): Promise<Product[]> {
  const response = await apiGet(`/api/products/suggestions?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des suggestions (${response.status})`);
  }

  const json: { success: boolean; data: Product[] } = await response.json();
  return json.data;
}
