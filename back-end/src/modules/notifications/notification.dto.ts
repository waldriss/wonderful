import { z } from 'zod';
import { NotificationType } from '@prisma/client';

// ============================================
// SCHEMAS DE VALIDATION
// ============================================

/**
 * Schema pour la liste des notifications
 */
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.nativeEnum(NotificationType).optional(),
  read: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : undefined,
    z.boolean().optional()
  ),
});

/**
 * Schema pour l'ID de notification
 * Les IDs sont générés en randomUUID côté repository
 */
export const notificationIdParamSchema = z.object({
  id: z.string().uuid('ID de notification invalide'),
});

/**
 * Schema pour marquer comme lu
 */
export const markAsReadSchema = z.object({
  read: z.boolean().default(true),
});

/**
 * Schema pour un URL d'action interne (route relative de l'application)
 */
const actionUrlSchema = z
  .string()
  .max(500, 'URL d\'action trop longue')
  .refine((v) => v.startsWith('/') && !v.startsWith('//'), 'URL d\'action invalide : doit être une route interne');

/**
 * Schema admin pour créer une notification
 */
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur invalide'),
  type: z.nativeEnum(NotificationType).default('GENERAL'),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  message: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
  icon: z.string().optional(),
  actionUrl: actionUrlSchema.optional(),
});

/**
 * Schema admin pour notification en masse
 */
export const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().min(1, 'ID utilisateur invalide')).min(1, 'Au moins un utilisateur requis'),
  type: z.nativeEnum(NotificationType).default('GENERAL'),
  title: z.string().min(1, 'Titre requis').max(200, 'Titre trop long'),
  message: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
  icon: z.string().optional(),
  actionUrl: actionUrlSchema.optional(),
});

/**
 * Schema pour la souscription push web
 * Format standard PushSubscription du navigateur
 */
export const pushSubscribeSchema = z.object({
  endpoint: z.string().url('Endpoint invalide'),
  keys: z.object({
    p256dh: z.string().min(1, 'Clé p256dh requise'),
    auth: z.string().min(1, 'Clé auth requise'),
  }),
  userAgent: z.string().max(500).optional(),
  deviceLabel: z.string().max(200).optional(),
});

/**
 * Schema pour la désinscription push web
 */
export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url('Endpoint invalide'),
});

// ============================================
// TYPES
// ============================================

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>;
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>;

// ============================================
// TYPES DE RÉPONSE
// ============================================

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: Date;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  byType: {
    type: NotificationType;
    count: number;
  }[];
}
