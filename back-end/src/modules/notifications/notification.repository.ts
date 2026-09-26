import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';
import { Prisma, NotificationType } from '@prisma/client';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

export class NotificationRepository {
  /**
   * Créer une notification
   */
  async create(data: CreateNotificationData) {
    return prisma.userNotification.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon,
        actionUrl: data.actionUrl,
      },
    });
  }

  /**
   * Créer plusieurs notifications.
   * createManyAndReturn renvoie les lignes créées (avec leurs IDs) pour
   * permettre l'émission temps réel par notification.
   */
  async createMany(notifications: CreateNotificationData[]) {
    return prisma.userNotification.createManyAndReturn({
      data: notifications.map((n) => ({
        id: randomUUID(),
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        icon: n.icon,
        actionUrl: n.actionUrl,
      })),
    });
  }

  /**
   * Trouver une notification par ID
   */
  async findById(id: string) {
    return prisma.userNotification.findUnique({
      where: { id },
    });
  }

  /**
   * Lister les notifications d'un utilisateur
   */
  async findByUser(
    userId: string,
    where: Prisma.UserNotificationWhereInput,
    pagination: PaginationParams
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where: { ...where, userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userNotification.count({ where: { ...where, userId } }),
    ]);

    return { data: notifications, total };
  }

  /**
   * Lister toutes les notifications (admin)
   */
  async findAll(where: Prisma.UserNotificationWhereInput, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userNotification.count({ where }),
    ]);

    return { data: notifications, total };
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string) {
    return prisma.userNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string) {
    return prisma.userNotification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Supprimer une notification
   */
  async delete(id: string) {
    return prisma.userNotification.delete({
      where: { id },
    });
  }

  /**
   * Supprimer toutes les notifications d'un utilisateur
   */
  async deleteAllByUser(userId: string) {
    return prisma.userNotification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.userNotification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Obtenir les statistiques des notifications
   */
  async getStats() {
    const [total, unread, byType] = await Promise.all([
      prisma.userNotification.count(),
      prisma.userNotification.count({ where: { read: false } }),
      prisma.userNotification.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count._all,
      })),
    };
  }
}
