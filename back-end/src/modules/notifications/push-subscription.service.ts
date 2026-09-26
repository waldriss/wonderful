import { config } from '../../config';
import { PushSubscriptionRepository } from './push-subscription.repository';
import { PushSubscribeInput } from './notification.dto';
import { createBadRequestError } from '../../utils/errors';

export class PushSubscriptionService {
  private repository: PushSubscriptionRepository;

  constructor() {
    this.repository = new PushSubscriptionRepository();
  }

  /**
   * Enregistrer (ou réactiver) la souscription push d'un utilisateur.
   * Le format attendu est celui de PushSubscription JSON du navigateur.
   */
  async subscribe(userId: string, data: PushSubscribeInput) {
    if (!config.webPush.isConfigured) {
      throw createBadRequestError('Les notifications push ne sont pas configurées côté serveur');
    }

    return this.repository.upsertByEndpoint({
      userId,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      userAgent: data.userAgent,
      deviceLabel: data.deviceLabel,
    });
  }

  /**
   * Désinscrire un appareil (endpoint) d'un utilisateur
   */
  async unsubscribe(userId: string, endpoint: string) {
    await this.repository.deactivateByEndpoint(userId, endpoint);
    return { success: true };
  }

  /**
   * Statut push de l'utilisateur : config serveur + nombre d'appareils actifs.
   * `vapidPublicKey` est exposée pour permettre au frontend de s'abonner
   * (clé publique, sans risque de sécurité).
   */
  async getStatus(userId: string) {
    const [subscriptionCount, latest] = await Promise.all([
      this.repository.countActiveByUser(userId),
      this.repository.findActiveByUser(userId),
    ]);

    return {
      configured: config.webPush.isConfigured,
      enabled: config.webPush.isConfigured && subscriptionCount > 0,
      subscriptionCount,
      endpoints: latest.map((sub) => sub.endpoint),
      vapidPublicKey: config.webPush.vapidPublicKey,
    };
  }
}
