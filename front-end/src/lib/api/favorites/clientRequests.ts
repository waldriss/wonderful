import { apiGet, apiPost, apiDelete } from '@/lib/api/apiFetch';
import type {
  Favorite,
  FavoritesListResponse,
  FavoriteIdsResponse,
  CheckFavoriteResponse,
  FavoriteListParams,
} from './types';

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
 * GET /api/favorites
 * Liste paginée des favoris de l'utilisateur connecté.
 */
export async function getFavorites(
  params: FavoriteListParams = {}
): Promise<FavoritesListResponse> {
  const qs = toQueryString(params as Record<string, unknown>);
  const response = await apiGet(`/api/favorites${qs}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des favoris (${response.status})`);
  }

  return response.json();
}

/**
 * GET /api/favorites/ids
 * Retourne la liste des productIds en favori (utilisé pour afficher le cœur sur les cards).
 */
export async function getFavoriteIds(): Promise<string[]> {
  const response = await apiGet('/api/favorites/ids');

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des IDs favoris (${response.status})`);
  }

  const json: FavoriteIdsResponse = await response.json();
  return json.data;
}

/**
 * GET /api/favorites/check/:productId
 * Vérifie si un produit est en favori.
 */
export async function checkFavorite(productId: string): Promise<boolean> {
  const response = await apiGet(`/api/favorites/check/${productId}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la vérification du favori (${response.status})`);
  }

  const json: CheckFavoriteResponse = await response.json();
  return json.data.isFavorite;
}

/**
 * POST /api/favorites/:productId
 * Ajoute un produit aux favoris.
 */
export async function addFavorite(productId: string): Promise<Favorite> {
  const response = await apiPost(`/api/favorites/${productId}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de l'ajout aux favoris (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}

/**
 * DELETE /api/favorites/:productId
 * Retire un produit des favoris.
 */
export async function removeFavorite(productId: string): Promise<void> {
  const response = await apiDelete(`/api/favorites/${productId}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression du favori (${response.status})`);
  }
}
