export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface UserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  address: UserAddress | null;
}

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  totalPoints: number;
  currentStreak: number;
  badgesCount: number;
  favoritesCount: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface DashboardSubscription {
  id: string;
  planName: string;
  status: string;
  nextDeliveryDate: string | null;
}

export interface DashboardNextMeal {
  id: string;
  name: string;
  image: string;
  category: string;
  calories: number | null;
  mealType: string | null;
}

export interface UserDashboard {
  profile: UserProfile;
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
  activeSubscription: DashboardSubscription | null;
  nextMeals: DashboardNextMeal[];
}

export interface NutritionSummary {
  avgCalories: number;
  avgProteins: number;
  avgCarbs: number;
  avgFats: number;
  avgFiber: number;
  totalMeals: number;
  daysTracked: number;
}

export interface NutritionDaily {
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  meals: number;
}

export interface NutritionData {
  period: 'week' | 'month' | 'all';
  summary: NutritionSummary;
  daily: NutritionDaily[];
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string | null;
}

export interface UpdateAvatarDto {
  image: string;
}

export interface AddressDto {
  street: string;
  city: string;
  postalCode: string;
  country?: string;
}
