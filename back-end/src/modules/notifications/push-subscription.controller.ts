import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { PushSubscriptionService } from './push-subscription.service';
import { PushSubscribeInput, PushUnsubscribeInput } from './notification.dto';

export class PushSubscriptionController {
  private service: PushSubscriptionService;

  constructor() {
    this.service = new PushSubscriptionService();
  }

  /**
   * GET /api/notifications/push/status
   * Statut des notifications push pour l'utilisateur connecté
   */
  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const status = await this.service.getStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  });

  /**
   * POST /api/notifications/push/subscribe
   * Enregistrer la souscription push d'un navigateur/appareil
   */
  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as PushSubscribeInput;

    const subscription = await this.service.subscribe(userId, data);

    res.status(201).json({
      success: true,
      data: subscription,
    });
  });

  /**
   * POST /api/notifications/push/unsubscribe
   * Désactiver la souscription push d'un appareil
   */
  unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { endpoint } = req.body as PushUnsubscribeInput;

    const result = await this.service.unsubscribe(userId, endpoint);

    res.json(result);
  });
}
