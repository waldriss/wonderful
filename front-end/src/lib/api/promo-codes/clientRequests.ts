import { apiPost } from '@/lib/api/apiFetch';

export interface ValidatePromoCodeRequest {
  code: string;
  subtotal: number;
  deliveryFee?: number;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
  value: number;
  discount: number;
  requiresAuth?: boolean;
  message: string;
}

export async function validatePromoCode(
  payload: ValidatePromoCodeRequest,
): Promise<ValidatePromoCodeResponse> {
  const response = await apiPost('/api/promo-codes/validate', payload);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erreur lors de la validation du code promo (${response.status})`);
  }

  const json = await response.json();
  return json.data;
}
