import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';

/**
 * Données nécessaires pour créer/upserter une souscription push
 */
export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  deviceLabel?: string;
}

export class PushSubscriptionRepository {
  /**
   * Créer ou réactiver une souscription identifiée par son endpoint.
   * Un même endpoint ne peut exister qu'une seule fois (contrainte @unique).
   */
  async upsertByEndpoint(data: PushSubscriptionData) {
    return prisma.webPushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        id: randomUUID(),
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        deviceLabel: data.deviceLabel,
      },
      update: {
        userId: data.userId,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        deviceLabel: data.deviceLabel,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Lister les souscriptions actives d'un utilisateur (multi-appareils)
   */
  async findActiveByUser(userId: string) {
    return prisma.webPushSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Désactiver une souscription par endpoint (nettoyage/suppression appareil)
   */
  async deactivateByEndpoint(userId: string, endpoint: string) {
    return prisma.webPushSubscription.updateMany({
      where: { userId, endpoint },
      data: { isActive: false },
    });
  }

  /**
   * Désactiver toutes les souscriptions d'un utilisateur (ex: déconnexion complète)
   */
  async deactivateAllByUser(userId: string) {
    return prisma.webPushSubscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  /**
   * Désactiver un endpoint devenu invalide (erreur d'envoi push 404/410)
   */
  async deactivateByEndpointOnly(endpoint: string) {
    return prisma.webPushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });
  }

  /**
   * Statut push d'un utilisateur : nombre de souscriptions actives
   */
  async countActiveByUser(userId: string): Promise<number> {
    return prisma.webPushSubscription.count({
      where: { userId, isActive: true },
    });
  }

  /**
   * Nombre total de souscriptions actives (observabilité admin)
   */
  async countActiveAll(): Promise<number> {
    return prisma.webPushSubscription.count({ where: { isActive: true } });
  }

  /**
   * Nombre total de souscriptions désactivées (endpoints expirés, désinscrits)
   */
  async countInactiveAll(): Promise<number> {
    return prisma.webPushSubscription.count({ where: { isActive: false } });
  }
}
