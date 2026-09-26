import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { fromNodeHeaders } from 'better-auth/node';
import { UserRole, UserStatus, NotificationType } from '@prisma/client';
import { auth } from './auth';
import prisma from './prisma';
import { config } from '../config';
import logger from '../utils/logger';

// ============================================
// TYPES
// ============================================

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  userName?: string;
}

export interface NewOrderPayload {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  deliveryCity: string;
  createdAt: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  changedAt: string;
}

export interface NotificationCreatedPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationUpdatedPayload {
  id: string;
  read: boolean;
}

export interface NotificationDeletedPayload {
  id: string;
}

// ============================================
// SINGLETON
// ============================================

let io: Server | null = null;

// ============================================
// AUTH MIDDLEWARE
// ============================================

/**
 * Valide la session better-auth depuis le handshake socket.
 * Si `allowedRoles` est fourni, seuls ces rôles sont admis ;
 * sinon, tout utilisateur au statut ACTIVE est accepté.
 */
function createSocketAuthMiddleware(allowedRoles?: UserRole[]) {
  return async (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void
  ): Promise<void> => {
    try {
      // better-auth reads from headers — reconstruct from handshake
      const headers = socket.handshake.headers as Record<string, string | string[]>;

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });

      if (!session?.user) {
        return next(new Error('UNAUTHORIZED'));
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, status: true, name: true, firstName: true, lastName: true },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        return next(new Error('UNAUTHORIZED'));
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return next(new Error('FORBIDDEN'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userName = user.firstName ?? user.name ?? 'User';

      next();
    } catch (error) {
      logger.error({ error }, '[Socket] Auth middleware error');
      next(new Error('INTERNAL_ERROR'));
    }
  };
}

// Middleware réservé aux admins (namespace /orders)
const socketAuthMiddleware = createSocketAuthMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

// Middleware ouvert à tout utilisateur actif (namespace /notifications)
const socketAuthAnyUserMiddleware = createSocketAuthMiddleware();

// ============================================
// INIT
// ============================================

export function initializeSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.auth.frontendUrl,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ============================================
  // /orders namespace — admin real-time orders
  // ============================================
  const ordersNs = io.of('/orders');

  // Only authenticated admin sockets are admitted
  ordersNs.use(socketAuthMiddleware);

  ordersNs.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(
      { userId: socket.userId, role: socket.userRole },
      '[Socket] Admin connected to /orders'
    );

    // Join the shared admin room
    socket.join('admin-orders');

    socket.on('disconnect', (reason) => {
      logger.info(
        { userId: socket.userId, reason },
        '[Socket] Admin disconnected from /orders'
      );
    });
  });

  // ============================================
  // /notifications namespace — per-user real-time notifications
  // ============================================
  const notificationsNs = io.of('/notifications');

  // Any active authenticated user is admitted
  notificationsNs.use(socketAuthAnyUserMiddleware);

  notificationsNs.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(
      { userId: socket.userId, role: socket.userRole },
      '[Socket] User connected to /notifications'
    );

    // Join a private per-user room so the server can target a single user
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', (reason) => {
      logger.info(
        { userId: socket.userId, reason },
        '[Socket] User disconnected from /notifications'
      );
    });
  });

  logger.info('[Socket] Socket.IO initialized — /orders + /notifications namespaces ready');

  return io;
}

// ============================================
// EMIT HELPERS
// ============================================

/**
 * Emitted when a customer places a new order.
 * All sockets in the `admin-orders` room receive it.
 */
export function emitNewOrder(payload: NewOrderPayload): void {
  if (!io) return;
  io.of('/orders').to('admin-orders').emit('order:new', payload);
  logger.debug({ orderId: payload.id }, '[Socket] Emitted order:new');
}

/**
 * Emitted when an order status is changed (by admin or system).
 */
export function emitOrderStatusChanged(payload: OrderStatusChangedPayload): void {
  if (!io) return;
  io.of('/orders').to('admin-orders').emit('order:status_changed', payload);
  logger.debug({ orderId: payload.orderId }, '[Socket] Emitted order:status_changed');
}

/**
 * Emitted when a new notification is created for a user.
 * Delivered to all sockets of that user in the `/notifications` room.
 */
export function emitNotificationCreated(userId: string, payload: NotificationCreatedPayload): void {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification:new', payload);
  logger.debug({ userId, notificationId: payload.id }, '[Socket] Emitted notification:new');
}

/**
 * Emitted when a notification read state changes (single notification).
 */
export function emitNotificationUpdated(userId: string, payload: NotificationUpdatedPayload): void {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification:updated', payload);
  logger.debug({ userId, notificationId: payload.id }, '[Socket] Emitted notification:updated');
}

/**
 * Emitted when all notifications of a user are marked as read.
 */
export function emitNotificationReadAll(userId: string): void {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification:read_all');
  logger.debug({ userId }, '[Socket] Emitted notification:read_all');
}

/**
 * Emitted when a notification is deleted for a user.
 */
export function emitNotificationDeleted(userId: string, payload: NotificationDeletedPayload): void {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification:deleted', payload);
  logger.debug({ userId, notificationId: payload.id }, '[Socket] Emitted notification:deleted');
}

/**
 * Emitted when all notifications of a user are deleted.
 */
export function emitNotificationDeletedAll(userId: string): void {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification:deleted_all');
  logger.debug({ userId }, '[Socket] Emitted notification:deleted_all');
}

/**
 * Returns the Socket.IO server instance (throws if not yet initialized).
 */
export function getIO(): Server {
  if (!io) throw new Error('Socket.IO has not been initialized. Call initializeSocket() first.');
  return io;
}

export default {
  initializeSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusChanged,
  emitNotificationCreated,
  emitNotificationUpdated,
  emitNotificationReadAll,
  emitNotificationDeleted,
  emitNotificationDeletedAll,
};
