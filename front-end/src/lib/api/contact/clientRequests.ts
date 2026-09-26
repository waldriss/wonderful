import { apiPost } from '@/lib/api/apiFetch';
import type { SubmitContactDto, ContactMessageResponse } from './types';

export async function submitContact(data: SubmitContactDto): Promise<ContactMessageResponse> {
  const res = await apiPost('/api/contact', data);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json.data;
}
