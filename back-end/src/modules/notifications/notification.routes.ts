import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { PushSubscriptionController } from './push-subscription.controller';
import { requireAuth, requireAdmin } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validation';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  createNotificationSchema,
  bulkNotificationSchema,
  pushSubscribeSchema,
  pushUnsubscribeSchema,
} from './notification.dto';

const router = Router();
const adminRouter = Router();
const controller = new NotificationController();
const pushController = new PushSubscriptionController();

// ============================================
// User Routes
// ============================================

// GET /notifications - Get user notifications
router.get(
  '/',
  requireAuth,
  validateQuery(listNotificationsQuerySchema),
  controller.getNotifications
);

// GET /notifications/unread-count - Get unread count
router.get('/unread-count', requireAuth, controller.getUnreadCount);

// ============================================
// Web Push Subscription Routes (must precede /:id)
// ============================================

// GET /notifications/push/status - Push status for current user
router.get('/push/status', requireAuth, pushController.getStatus);

// POST /notifications/push/subscribe - Register a device subscription
router.post(
  '/push/subscribe',
  requireAuth,
  validateBody(pushSubscribeSchema),
  pushController.subscribe
);

// POST /notifications/push/unsubscribe - Deactivate a device subscription
router.post(
  '/push/unsubscribe',
  requireAuth,
  validateBody(pushUnsubscribeSchema),
  pushController.unsubscribe
);

// GET /notifications/:id - Get notification by ID
router.get(
  '/:id',
  requireAuth,
  validateParams(notificationIdParamSchema),
  controller.getNotificationById
);

// POST /notifications/:id/read - Mark as read
router.post(
  '/:id/read',
  requireAuth,
  validateParams(notificationIdParamSchema),
  controller.markAsRead
);

// POST /notifications/read-all - Mark all as read
router.post('/read-all', requireAuth, controller.markAllAsRead);

// DELETE /notifications/:id - Delete notification
router.delete(
  '/:id',
  requireAuth,
  validateParams(notificationIdParamSchema),
  controller.deleteNotification
);

// DELETE /notifications - Delete all notifications
router.delete('/', requireAuth, controller.deleteAllNotifications);

// ============================================
// Admin Routes
// ============================================

// GET /admin/notifications - Get all notifications
adminRouter.get(
  '/',
  requireAdmin,
  validateQuery(listNotificationsQuerySchema),
  controller.getAllNotifications
);

// GET /admin/notifications/stats - Get stats
adminRouter.get('/stats', requireAdmin, controller.getNotificationStats);

// POST /admin/notifications - Create notification
adminRouter.post(
  '/',
  requireAdmin,
  validateBody(createNotificationSchema),
  controller.createNotification
);

// POST /admin/notifications/bulk - Send bulk notification
adminRouter.post(
  '/bulk',
  requireAdmin,
  validateBody(bulkNotificationSchema),
  controller.sendBulkNotification
);

// DELETE /admin/notifications/:id - Delete notification
adminRouter.delete(
  '/:id',
  requireAdmin,
  validateParams(notificationIdParamSchema),
  controller.deleteNotificationAdmin
);

export const notificationRoutes = router;
export const adminNotificationRoutes = adminRouter;
