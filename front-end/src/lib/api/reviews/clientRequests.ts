import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiFetch';
import type {
  Review,
  ReviewWithProduct,
  ProductReviewsResponse,
  MyReviewsResponse,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewListParams,
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
 * GET /api/reviews/product/:productId
 * Avis d'un produit, avec stats.
 */
export async function getProductReviews(
  productId: string,
  params: ReviewListParams = {}
): Promise<ProductReviewsResponse> {
  const qs = toQueryString(params as Record<string, unknown>);
  const response = await apiGet(`/api/reviews/product/${productId}${qs}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des avis (${response.status})`);
  }

  return response.json();
}

/**
 * GET /api/reviews/mine
 * Mes avis (avec le produit associé).
 */
export async function getMyReviews(): Promise<ReviewWithProduct[]> {
  const response = await apiGet('/api/reviews/mine');

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de vos avis (${response.status})`);
  }

  const json: MyReviewsResponse = await response.json();
  return json.data;
}

/**
 * POST /api/reviews
 * Créer un avis.
 */
export async function createReview(data: CreateReviewDto): Promise<Review> {
  const response = await apiPost('/api/reviews', data);

  if (!response.ok) {
    if (response.status === 409) throw new Error('Vous avez déjà laissé un avis pour ce produit');
    throw new Error(`Erreur lors de la création de l'avis (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}

/**
 * PUT /api/reviews/:id
 * Modifier mon avis.
 */
export async function updateReview(id: string, data: UpdateReviewDto): Promise<Review> {
  const response = await apiPut(`/api/reviews/${id}`, data);

  if (!response.ok) {
    if (response.status === 404) throw new Error('Avis introuvable');
    if (response.status === 403) throw new Error('Non autorisé à modifier cet avis');
    throw new Error(`Erreur lors de la mise à jour de l'avis (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}

/**
 * DELETE /api/reviews/:id
 * Supprimer mon avis.
 */
export async function deleteReview(id: string): Promise<void> {
  const response = await apiDelete(`/api/reviews/${id}`);

  if (!response.ok) {
    if (response.status === 404) throw new Error('Avis introuvable');
    if (response.status === 403) throw new Error('Non autorisé à supprimer cet avis');
    throw new Error(`Erreur lors de la suppression de l'avis (${response.status})`);
  }
}

