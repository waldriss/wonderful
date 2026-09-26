import { Express, Request, Response } from 'express';
import { healthRoutes } from './health.routes';

import { authenticate, requireAuth } from '../middlewares/auth.middleware';

// Module imports - Client routes
import { userRoutes, adminCustomerRoutes } from '../modules/users';
import { productRoutes, adminProductRoutes } from '../modules/products';
import { favoriteRoutes } from '../modules/favorites';
import { reviewRoutes, adminReviewRoutes } from '../modules/reviews';
import { orderRoutes, adminOrderRoutes } from '../modules/orders';
import { promoCodeRoutes, adminPromoCodeRoutes } from '../modules/promo-codes';
import { subscriptionRoutes, adminSubscriptionRoutes } from '../modules/subscriptions';
import { gamificationRoutes, adminGamificationRoutes } from '../modules/gamification';
import { notificationRoutes, adminNotificationRoutes } from '../modules/notifications';
import { contactRoutes, adminContactRoutes } from '../modules/contact';
import { deliveryZoneRoutes, adminDeliveryZoneRoutes } from '../modules/delivery-zones';
import { supplementRoutes, adminSupplementRoutes } from '../modules/supplements';
import adminRoutes from '../modules/admin/admin.routes';

/**
 * Setup all API routes
 */
export function setupRoutes(app: Express): void {
  // Health check routes
  app.use('/api/health', healthRoutes);
  
  // Simple health check for basic monitoring
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // API root
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Wonderful API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================
  // CLIENT ROUTES (authentifiées)
  // ============================================

  // Users / Profile
  app.use('/api/users', authenticate, userRoutes);

  // Products
  app.use('/api/products', authenticate, productRoutes);

  // Favorites
  app.use('/api/favorites', authenticate, favoriteRoutes);

  // Reviews
  app.use('/api/reviews', authenticate, reviewRoutes);

  // Orders
  app.use('/api/orders', authenticate, orderRoutes);

  // Promo Codes
  app.use('/api/promo-codes', authenticate, promoCodeRoutes);

  // Subscriptions
  app.use('/api/subscriptions', authenticate, subscriptionRoutes);

  // Gamification
  app.use('/api/gamification', authenticate, gamificationRoutes);

  // Notifications
  app.use('/api/notifications', authenticate, notificationRoutes);

  // Contact (public — no auth required)
  app.use('/api/contact', contactRoutes);

  // Delivery Zones (public — active zones for checkout)
  app.use('/api/delivery-zones', deliveryZoneRoutes);

  // Supplements (public — active supplements)
  app.use('/api/supplements', supplementRoutes);

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // Admin Dashboard & Analytics
  app.use('/api/admin', authenticate, adminRoutes);

  // Admin - Users
  app.use('/api/admin/users', authenticate, adminCustomerRoutes);

  // Admin - Products
  app.use('/api/admin/products', authenticate, adminProductRoutes);

  // Admin - Reviews
  app.use('/api/admin/reviews', authenticate, adminReviewRoutes);

  // Admin - Orders
  app.use('/api/admin/orders', authenticate, adminOrderRoutes);

  // Admin - Promo Codes
  app.use('/api/admin/promo-codes', authenticate, adminPromoCodeRoutes);

  // Admin - Subscriptions
  app.use('/api/admin/subscriptions', authenticate, adminSubscriptionRoutes);

  // Admin - Gamification
  app.use('/api/admin/gamification', authenticate, adminGamificationRoutes);

  // Admin - Notifications
  app.use('/api/admin/notifications', authenticate, adminNotificationRoutes);

  // Admin - Contact
  app.use('/api/admin/contact', authenticate, adminContactRoutes);

  // Admin - Delivery Zones
  app.use('/api/admin/delivery-zones', authenticate, adminDeliveryZoneRoutes);

  // Admin - Supplements
  app.use('/api/admin/supplements', authenticate, adminSupplementRoutes);
}
