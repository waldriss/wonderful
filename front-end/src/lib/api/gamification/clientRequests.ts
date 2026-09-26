import { apiGet, apiPost } from '@/lib/api/apiFetch';
import type {
  GamificationOverview,
  PointsBalance,
  PointsTransaction,
  UsePointsDto,
  UsePointsResponse,
  Badge,
  Mission,
  ClaimMissionResponse,
  MysteryBox,
  BuyMysteryBoxResponse,
  OpenMysteryBoxResponse,
  Streak,
  Referral,
  UseReferralResponse,
  LeaderboardEntry,
  LeaderboardParams,
  PaginatedApiResponse,
  UserReward,
  LeaderboardRewardConfig,
} from './types';
import type { PaginationMeta } from '../products/types';

// ============================================
// HELPERS
// ============================================

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

// ============================================
// OVERVIEW
// ============================================

export async function getOverview(): Promise<GamificationOverview> {
  const response = await apiGet('/api/gamification');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la gamification (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

// ============================================
// POINTS
// ============================================

export async function getPoints(): Promise<PointsBalance> {
  const response = await apiGet('/api/gamification/points');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des points (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function getPointsHistory(
  page: number = 1,
  limit: number = 20
): Promise<{ data: PointsTransaction[]; pagination: PaginationMeta }> {
  const qs = toQueryString({ page, limit });
  const response = await apiGet(`/api/gamification/points/history${qs}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de l'historique des points (${response.status})`);
  }
  const json = await response.json();
  return { data: json.data, pagination: json.pagination };
}

export async function usePoints(dto: UsePointsDto): Promise<UsePointsResponse> {
  const response = await apiPost('/api/gamification/points/use', dto);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de l'utilisation des points (${response.status})`);
  }
  return response.json();
}

// ============================================
// BADGES
// ============================================

export async function getBadges(): Promise<Badge[]> {
  const response = await apiGet('/api/gamification/badges');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des badges (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function getMyBadges(): Promise<Badge[]> {
  const response = await apiGet('/api/gamification/badges/mine');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de vos badges (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

// ============================================
// MISSIONS
// ============================================

export async function getMissions(): Promise<Mission[]> {
  const response = await apiGet('/api/gamification/missions');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des missions (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function claimMissionReward(missionId: string): Promise<ClaimMissionResponse> {
  const response = await apiPost(`/api/gamification/missions/${missionId}/claim`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de la réclamation de la récompense (${response.status})`);
  }
  return response.json();
}

// ============================================
// MYSTERY BOXES
// ============================================

export async function getMysteryBoxes(): Promise<MysteryBox[]> {
  const response = await apiGet('/api/gamification/mystery-boxes');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des mystery boxes (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function buyMysteryBox(mysteryBoxId: string): Promise<BuyMysteryBoxResponse> {
  const response = await apiPost(`/api/gamification/mystery-boxes/${mysteryBoxId}/buy`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de l'achat de la mystery box (${response.status})`);
  }
  return response.json();
}

export async function openMysteryBox(userMysteryBoxId: string): Promise<OpenMysteryBoxResponse> {
  const response = await apiPost(`/api/gamification/mystery-boxes/${userMysteryBoxId}/open`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de l'ouverture de la mystery box (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

// ============================================
// STREAK
// ============================================

export async function getStreak(): Promise<Streak> {
  const response = await apiGet('/api/gamification/streak');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du streak (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

// ============================================
// REFERRAL
// ============================================

export async function getReferral(): Promise<Referral | null> {
  const response = await apiGet('/api/gamification/referral');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du parrainage (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function generateReferralCode(): Promise<Referral> {
  const response = await apiPost('/api/gamification/referral/generate');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de la génération du code (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function useReferralCode(code: string): Promise<UseReferralResponse> {
  const response = await apiPost('/api/gamification/referral/use', { code });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erreur lors de l'utilisation du code (${response.status})`);
  }
  const json = await response.json();
  return json.data ?? json;
}

// ============================================
// USER REWARDS
// ============================================

export async function getMyRewards(): Promise<UserReward[]> {
  const response = await apiGet('/api/gamification/rewards');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des récompenses (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

// ============================================
// LEADERBOARD
// ============================================

export async function getLeaderboard(
  params: LeaderboardParams = {}
): Promise<LeaderboardEntry[]> {
  const qs = toQueryString(params as Record<string, unknown>);
  const response = await apiGet(`/api/gamification/leaderboard${qs}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du classement (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}

export async function getLeaderboardConfigsPublic(): Promise<LeaderboardRewardConfig[]> {
  const response = await apiGet('/api/gamification/leaderboard/configs');
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des récompenses du classement (${response.status})`);
  }
  const json = await response.json();
  return json.data;
}
