import { Prisma, NotificationType, OrderStatus } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { PushSubscriptionRepository } from './push-subscription.repository';
import {
  ListNotificationsQuery,
  CreateNotificationInput,
  BulkNotificationInput,
} from './notification.dto';
import { createNotFoundError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { sendPush, PushSendResult } from '../../lib/push';
import logger from '../../utils/logger';
import {
  emitNotificationCreated,
  emitNotificationUpdated,
  emitNotificationReadAll,
  emitNotificationDeleted,
  emitNotificationDeletedAll,
  NotificationCreatedPayload,
} from '../../lib/socket';

/**
 * Type d'une ligne notification : dérivé du retour du repository pour
 * rester automatiquement à jour si le schéma Prisma évolue.
 */
type NotificationRow = Awaited<ReturnType<NotificationRepository['create']>>;

export class NotificationService {
  private repository: NotificationRepository;
  private pushRepository: PushSubscriptionRepository;

  constructor() {
    this.repository = new NotificationRepository();
    this.pushRepository = new PushSubscriptionRepository();
  }

  // ============================================
  // Diffusion (create + socket + push)
  // ============================================

  /**
   * Diffuse une notification fraîchement créée vers les sockets du destinataire.
   */
  private publish(notification: NotificationRow): void {
    const payload: NotificationCreatedPayload = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };
    emitNotificationCreated(notification.userId, payload);
  }

  /**
   * Envoie le push web vers tous les appareils actifs de l'utilisateur.
   * Non bloquant : les erreurs d'envoi sont loggées, jamais propagées,
   * et les endpoints expirés (404/410) sont désactivés en base.
   */
  private async pushToUser(userId: string, notification: NotificationRow): Promise<void> {
    const subscriptions = await this.pushRepository.findActiveByUser(userId);

    for (const sub of subscriptions) {
      try {
        const result: PushSendResult = await sendPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: notification.title,
            body: notification.message,
            icon: '/images/logo.png',
            url: notification.actionUrl ?? '/dashboard/user/notifications',
            type: notification.type,
          }
        );

        if (result === 'expired') {
          await this.pushRepository.deactivateByEndpointOnly(sub.endpoint);
        }
      } catch (err) {
        logger.error(
          { userId, endpoint: sub.endpoint, error: err },
          '[Push] Échec d\'envoi de notification push'
        );
      }
    }
  }

  /**
   * Point d'entrée unique de création + diffusion d'une notification :
   *   1. persistance en base
   *   2. émission socket temps réel (app ouverte)
   *   3. envoi web push (app fermée / arrière-plan) — non bloquant :
   *      la réponse ne dépend jamais de la latence du service push.
   */
  private async createAndDispatch(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    actionUrl?: string;
  }): Promise<NotificationRow> {
    const notification = await this.repository.create(data);
    this.publish(notification);
    this.pushToUser(notification.userId, notification).catch(() => {
      // Les erreurs d'envoi sont déjà loggées dans pushToUser
    });
    return notification;
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getNotifications(userId: string, query: ListNotificationsQuery) {
    const where: Prisma.UserNotificationWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.read !== undefined && { read: query.read }),
    };

    const { data, total } = await this.repository.findByUser(userId, where, {
      page: query.page,
      limit: query.limit,
    });

    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Obtenir une notification par ID
   */
  async getNotificationById(id: string, userId: string) {
    const notification = await this.repository.findById(id);

    if (!notification) {
      throw createNotFoundError('Notification non trouvée');
    }

    if (notification.userId !== userId) {
      throw createNotFoundError('Notification non trouvée');
    }

    return notification;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.getNotificationById(id, userId);
    const updated = await this.repository.markAsRead(notification.id);
    emitNotificationUpdated(userId, { id: updated.id, read: updated.read });
    return updated;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    const result = await this.repository.markAllAsRead(userId);
    emitNotificationReadAll(userId);
    return result;
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(id: string, userId: string) {
    const notification = await this.getNotificationById(id, userId);
    await this.repository.delete(notification.id);
    emitNotificationDeleted(userId, { id: notification.id });
    return { success: true };
  }

  /**
   * Supprimer toutes les notifications
   */
  async deleteAllNotifications(userId: string) {
    const result = await this.repository.deleteAllByUser(userId);
    emitNotificationDeletedAll(userId);
    return result;
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId: string) {
    return this.repository.getUnreadCount(userId);
  }

  // ============================================
  // Méthodes d'envoi de notifications
  // ============================================

  /**
   * Envoyer une notification de commande
   */
  async sendOrderNotification(userId: string, orderId: string, status: OrderStatus) {
    const messages: Record<OrderStatus, { title: string; message: string }> = {
      PENDING: {
        title: 'Commande reçue',
        message: 'Votre commande a été reçue et est en attente de confirmation.',
      },
      CONFIRMED: {
        title: 'Commande confirmée',
        message: 'Votre commande a été confirmée et est en préparation.',
      },
      PREPARING: {
        title: 'Commande en préparation',
        message: 'Le restaurant prépare votre commande.',
      },
      IN_TRANSIT: {
        title: 'Commande en livraison',
        message: 'Votre commande est en route.',
      },
      DELIVERED: {
        title: 'Commande livrée',
        message: 'Votre commande a été livrée. Bon appétit!',
      },
      CANCELLED: {
        title: 'Commande annulée',
        message: 'Votre commande a été annulée.',
      },
    };

    const notificationData = messages[status];
    if (!notificationData) return null;

    return this.createAndDispatch({
      userId,
      type: 'ORDER_UPDATE',
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: `/dashboard/user/orders/${orderId}`,
    });
  }

  /**
   * Envoyer une notification de badge
   */
  async sendBadgeNotification(userId: string, badgeName: string, badgeId: string) {
    return this.createAndDispatch({
      userId,
      type: 'BADGE_UNLOCKED',
      title: '🏆 Nouveau badge débloqué!',
      message: `Félicitations! Vous avez obtenu le badge "${badgeName}"`,
      actionUrl: `/dashboard/user/rewards`,
    });
  }

  /**
   * Envoyer une notification de mission complétée
   */
  async sendMissionCompleteNotification(
    userId: string,
    missionName: string,
    points: number,
    missionId: string
  ) {
    return this.createAndDispatch({
      userId,
      type: 'MISSION_COMPLETE',
      title: '✅ Mission accomplie!',
      message: `Vous avez complété la mission "${missionName}" et gagné ${points} points!`,
      actionUrl: `/dashboard/user/rewards`,
    });
  }

  /**
   * Envoyer une notification de série
   */
  async sendStreakNotification(userId: string, streakCount: number) {
    return this.createAndDispatch({
      userId,
      type: 'STREAK_MILESTONE',
      title: '🔥 Série de commandes!',
      message: `Bravo! Vous avez atteint une série de ${streakCount} jours consécutifs!`,
    });
  }

  /**
   * Envoyer une notification de promo
   */
  async sendPromoNotification(
    userId: string,
    promoTitle: string,
    promoCode: string,
    discount: number
  ) {
    return this.createAndDispatch({
      userId,
      type: 'PROMO',
      title: '🎉 Nouvelle promotion!',
      message: `${promoTitle} - Utilisez le code ${promoCode} pour ${discount}% de réduction!`,
    });
  }

  // ============================================
  // Méthodes Admin
  // ============================================

  /**
   * Obtenir toutes les notifications (admin)
   */
  async getAllNotifications(query: ListNotificationsQuery & { userId?: string }) {
    const where: Prisma.UserNotificationWhereInput = {
      ...(query.userId && { userId: query.userId }),
      ...(query.type && { type: query.type }),
      ...(query.read !== undefined && { read: query.read }),
    };

    const { data, total } = await this.repository.findAll(where, {
      page: query.page,
      limit: query.limit,
    });

    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Créer une notification (admin)
   */
  async createNotification(data: CreateNotificationInput) {
    return this.createAndDispatch({
      userId: data.userId,
      type: data.type || 'GENERAL',
      title: data.title,
      message: data.message,
      icon: data.icon,
      actionUrl: data.actionUrl,
    });
  }

  /**
   * Envoyer des notifications en masse (admin)
   */
  async sendBulkNotification(data: BulkNotificationInput) {
    const notifications = data.userIds.map((userId) => ({
      userId,
      type: data.type ?? NotificationType.GENERAL,
      title: data.title,
      message: data.message,
      icon: data.icon,
      actionUrl: data.actionUrl,
    }));

    const created = await this.repository.createMany(notifications);

    // Diffuser chaque notification créée vers son destinataire :
    // socket temps réel + push web (sans bloquer la réponse)
    created.forEach((notification) => {
      this.publish(notification);
      this.pushToUser(notification.userId, notification).catch(() => {
        // Les erreurs d'envoi sont déjà loggées dans pushToUser
      });
    });

    return { count: created.length, data: created };
  }

  /**
   * Supprimer une notification (admin)
   */
  async deleteNotificationAdmin(id: string) {
    const notification = await this.repository.findById(id);

    if (!notification) {
      throw createNotFoundError('Notification non trouvée');
    }

    return this.repository.delete(id);
  }

  /**
   * Obtenir les statistiques (notifications + souscriptions push pour l'admin)
   */
  async getNotificationStats() {
    const [stats, activePushSubscriptions, inactivePushSubscriptions] = await Promise.all([
      this.repository.getStats(),
      this.pushRepository.countActiveAll(),
      this.pushRepository.countInactiveAll(),
    ]);

    return {
      ...stats,
      push: {
        activeSubscriptions: activePushSubscriptions,
        inactiveSubscriptions: inactivePushSubscriptions,
      },
    };
  }
}
