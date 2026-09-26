import { z } from 'zod';
import { UserRole, UserStatus, CustomerOrderTrustStatus } from '@prisma/client';

const manageableUserRoleSchema = z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']);

// ============================================
// SCHEMAS DE VALIDATION - PROFIL UTILISATEUR
// ============================================

/**
 * Schema pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court').max(50).optional(),
  lastName: z.string().min(2, 'Nom trop court').max(50).optional(),
  name: z.string().min(2, 'Nom trop court').max(100).optional(),
  phone: z
    .string()
    .regex(/^(\+213|0)[567][0-9]{8}$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable(),
});

/**
 * Schema pour la mise à jour de l'avatar
 */
export const updateAvatarSchema = z.object({
  image: z.string().url('URL d\'image invalide'),
});

/**
 * Schema pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Schema pour l'adresse utilisateur
 */
export const addressSchema = z.object({
  street: z.string().min(5, 'Adresse trop courte').max(200),
  city: z.string().min(2, 'Ville requise').max(100),
  postalCode: z.string().min(4, 'Code postal invalide').max(10),
  country: z.string().default('Algérie'),
});

// ============================================
// SCHEMAS DE VALIDATION - ADMIN
// ============================================

/**
 * Schema pour les paramètres de liste des clients (Admin)
 */
export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  role: manageableUserRoleSchema.optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/**
 * Schema pour le changement de statut utilisateur (Admin)
 */
export const changeUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().optional(),
});

/**
 * Schema pour le changement de rôle utilisateur (Admin)
 */
export const changeUserRoleSchema = z.object({
  role: manageableUserRoleSchema,
});

/**
 * Schema pour la mise à jour du statut de confiance (Admin)
 */
export const updateCustomerOrderTrustSchema = z.object({
  orderTrustStatus: z.nativeEnum(CustomerOrderTrustStatus),
  orderTrustNote: z.string().max(500).optional(),
});

/**
 * Schema pour les paramètres d'URL
 */
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'ID utilisateur requis'),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdateAvatarDto = z.infer<typeof updateAvatarSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type AddressDto = z.infer<typeof addressSchema>;
export type ListCustomersQueryDto = z.infer<typeof listCustomersQuerySchema>;
export type ChangeUserStatusDto = z.infer<typeof changeUserStatusSchema>;
export type ChangeUserRoleDto = z.infer<typeof changeUserRoleSchema>;
export type UpdateCustomerOrderTrustDto = z.infer<typeof updateCustomerOrderTrustSchema>;
export type UserIdParamDto = z.infer<typeof userIdParamSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface UserProfileResponse {
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
  createdAt: Date;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

export interface UserDashboardResponse {
  profile: UserProfileResponse;
  stats: {
    totalOrders: number;
    totalSpent: number;
    totalPoints: number;
    currentStreak: number;
    badgesCount: number;
    favoritesCount: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: Date;
  }>;
  activeSubscription: {
    id: string;
    planName: string;
    status: string;
    nextDeliveryDate: Date | null;
  } | null;
  nextMeals: Array<{
    id: string;
    name: string;
    image: string;
    category: string;
    calories: number | null;
    mealType: string | null;
  }>;
}

export interface CustomerListResponse {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  ordersCount: number;
  totalSpent: number;
}
