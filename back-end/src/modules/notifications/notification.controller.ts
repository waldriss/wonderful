import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  ListNotificationsQuery,
  CreateNotificationInput,
  BulkNotificationInput,
} from './notification.dto';

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  // ============================================
  // User Methods
  // ============================================

  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const query = req.query as unknown as ListNotificationsQuery;

    const result = await this.service.getNotifications(userId, query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  getNotificationById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await this.service.getNotificationById(id, userId);

    res.json({
      success: true,
      data: notification,
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await this.service.markAsRead(id, userId);

    res.json({
      success: true,
      data: notification,
    });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await this.service.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${result.count} notifications marquées comme lues`,
    });
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await this.service.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification supprimée avec succès',
    });
  });

  deleteAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await this.service.deleteAllNotifications(userId);

    res.json({
      success: true,
      message: `${result.count} notifications supprimées`,
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const count = await this.service.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  });

  // ============================================
  // Admin Methods
  // ============================================

  getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListNotificationsQuery & { userId?: string };

    const result = await this.service.getAllNotifications(query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  createNotification = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateNotificationInput;

    const notification = await this.service.createNotification(data);

    res.status(201).json({
      success: true,
      data: notification,
    });
  });

  sendBulkNotification = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as BulkNotificationInput;

    const result = await this.service.sendBulkNotification(data);

    res.status(201).json({
      success: true,
      message: `${result.count} notifications envoyées`,
      count: result.count,
    });
  });

  deleteNotificationAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.service.deleteNotificationAdmin(id);

    res.json({
      success: true,
      message: 'Notification supprimée avec succès',
    });
  });

  getNotificationStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.service.getNotificationStats();

    res.json({
      success: true,
      data: stats,
    });
  });
}
