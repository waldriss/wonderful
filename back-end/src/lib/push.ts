import webpush, { WebPushError } from 'web-push';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Envoi de notifications push web (Web Push Protocol via web-push).
 *
 * Les clés VAPID sont chargées depuis la config. Tant qu'elles ne sont pas
 * définies, l'envoi est impossible : `sendPush` renvoie 'not_configured'
 * sans lever d'erreur, pour que la logique métier reste non bloquante.
 */

export interface PushSubscriptionLike {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type?: string;
}

export type PushSendResult = 'sent' | 'not_configured' | 'expired';

let initialized = false;

/**
 * Initialise web-push avec les clés VAPID (une seule fois).
 */
function ensureConfigured(): boolean {
  if (!config.webPush.isConfigured) return false;

  if (!initialized) {
    webpush.setVapidDetails(
      config.webPush.subject,
      config.webPush.vapidPublicKey,
      config.webPush.vapidPrivateKey
    );
    initialized = true;
  }
  return true;
}

/**
 * Envoie une notification push à une souscription donnée.
 *
 * - 'expired' : l'endpoint n'existe plus (404/410) → la souscription doit
 *   être désactivée côté base de données.
 * - 'not_configured' : les clés VAPID ne sont pas définies sur le serveur.
 * - Toute autre erreur est propagée (réseau, push service down, ...).
 */
export async function sendPush(
  subscription: PushSubscriptionLike,
  payload: PushPayload
): Promise<PushSendResult> {
  if (!ensureConfigured()) return 'not_configured';

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      { TTL: 86400 } // la notification expire après 24h si l'appareil est hors ligne
    );
    logger.debug(
      { endpoint: subscription.endpoint },
      '[Push] Notification envoyée avec succès'
    );
    return 'sent';
  } catch (err) {
    if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
      logger.warn(
        { endpoint: subscription.endpoint, statusCode: err.statusCode },
        '[Push] Endpoint expiré, souscription à désactiver'
      );
      return 'expired';
    }
    throw err;
  }
}
