import { apiGet, apiPatch, apiPut } from '@/lib/api/apiFetch';
import type {
  UserProfile,
  UserDashboard,
  NutritionData,
  UpdateProfileDto,
  UpdateAvatarDto,
  AddressDto,
} from './types';

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await apiGet('/api/users/profile');
  const json = await parseResponse<{ success: boolean; data: UserProfile }>(res);
  return json.data;
}

export async function updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
  const res = await apiPatch('/api/users/profile', data);
  const json = await parseResponse<{ success: boolean; data: UserProfile }>(res);
  return json.data;
}

export async function updateAvatar(data: UpdateAvatarDto): Promise<UserProfile> {
  const res = await apiPatch('/api/users/profile/avatar', data);
  const json = await parseResponse<{ success: boolean; data: UserProfile }>(res);
  return json.data;
}

export async function updateAddress(data: AddressDto): Promise<AddressDto> {
  const res = await apiPut('/api/users/profile/address', data);
  const json = await parseResponse<{ success: boolean; data: AddressDto }>(res);
  return json.data;
}

export async function getDashboard(): Promise<UserDashboard> {
  const res = await apiGet('/api/users/dashboard');
  const json = await parseResponse<{ success: boolean; data: UserDashboard }>(res);
  return json.data;
}

export async function getNutrition(period: 'week' | 'month' | 'all' = 'week'): Promise<NutritionData> {
  const res = await apiGet(`/api/users/nutrition?period=${period}`);
  const json = await parseResponse<{ success: boolean; data: NutritionData }>(res);
  return json.data;
}
