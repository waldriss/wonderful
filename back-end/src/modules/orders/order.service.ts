import { OrderStatus, PaymentStatus, ProductStatus, MissionType, RewardType } from '@prisma/client';
import { orderRepository } from './order.repository';
import { productRepository } from '../products/product.repository';
import { deliveryZoneRepository } from '../delivery-zones/delivery-zone.repository';
import prisma from '../../lib/prisma';
import { emitNewOrder, emitOrderStatusChanged } from '../../lib/socket';
import {
  CreateOrderDto,
  ListMyOrdersQueryDto,
  ListOrdersAdminQueryDto,
  OrderResponse,
  OrderAdminResponse,
  OrderSummaryResponse,
  UpdatePhoneConfirmationDto,
} from './order.dto';
import {
  createNotFoundError,
  createBadRequestError,
  createForbiddenError,
} from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { PaginatedResult } from '../../shared/types/pagination';
import { gamificationService } from '../gamification/gamification.service';
import { gamificationRepository } from '../gamification/gamification.repository';
import { NotificationService } from '../notifications/notification.service';

const notificationService = new NotificationService();

/**
 * Service pour la gestion des commandes
 */
export class OrderService {
  // ============================================
  // ROUTES CLIENT
  // ============================================

  /**
   * Créer une commande
   */
  async createOrder(userId: string, data: CreateOrderDto): Promise<OrderResponse> {
    // Valider les produits et calculer les totaux
    const products = await Promise.all(
      data.items.map(async (item) => {
        const product = await productRepository.findById(item.productId);
        
        if (!product) {
          throw createNotFoundError(`Produit ${item.productId}`);
        }
        
        if (product.status !== ProductStatus.ACTIVE) {
          throw createBadRequestError(`Le produit "${product.name}" n'est pas disponible`);
        }
        
        if (product.stock < item.quantity) {
          throw createBadRequestError(
            `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}`
          );
        }

        // Calculer le prix (avec réduction si applicable)
        const unitPrice = product.discount
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price;

        // Valider et figer les suppléments sélectionnés
        const supplements = await this.validateAndFreezeSupplements(
          product.id,
          item.supplements ?? []
        );
        const supplementsUnitTotal = supplements.reduce(
          (sum, s) => sum + s.price * s.quantity,
          0
        );

        return {
          productId: product.id,
          quantity: item.quantity,
          price: unitPrice,
          supplements,
          totalPrice: (unitPrice + supplementsUnitTotal) * item.quantity,
        };
      })
    );

    // Calculer le sous-total
    const subtotal = products.reduce((sum, p) => sum + p.totalPrice, 0);

    // Frais de livraison depuis la zone de livraison en DB
    let deliveryFee: number;
    let deliveryCity = data.deliveryCity ?? '';

    if (data.deliveryZoneId) {
      const zone = await deliveryZoneRepository.findById(data.deliveryZoneId);
      if (!zone) throw createNotFoundError('Zone de livraison');
      if (!zone.isActive) throw createBadRequestError('Cette zone de livraison n\'est plus disponible');
      if (zone.minOrderAmount && subtotal < zone.minOrderAmount) {
        throw createBadRequestError(
          `Montant minimum pour cette zone: ${zone.minOrderAmount} DA`
        );
      }
      deliveryFee = zone.fee;
      deliveryCity = zone.name;
    } else {
      deliveryFee = this.calculateDeliveryFee(deliveryCity, subtotal);
    }

    // Gérer le code promo si fourni
    let discount = 0;
    let promoCodeId: string | undefined;
    let userRewardId: string | undefined;
    let gamificationDiscount = 0;

    if (data.promoCode && data.userRewardId) {
      throw createBadRequestError('Vous ne pouvez pas cumuler un code promo et un bon de récompense');
    }

    if (data.promoCode) {
      const promoResult = await this.validateAndApplyPromoCode(
        data.promoCode,
        userId,
        subtotal,
        deliveryFee
      );
      discount = promoResult.discount;
      promoCodeId = promoResult.promoCodeId;
    }

    if (data.userRewardId) {
      const gamificationResult = await this.validateAndApplyUserReward(
        data.userRewardId,
        userId,
        subtotal,
        deliveryFee
      );
      gamificationDiscount = gamificationResult.discount;
      userRewardId = data.userRewardId;
      // Appliquer comme deliveryFee si livraison gratuite
      if (gamificationResult.isFreeDelivery) {
        deliveryFee = 0;
      }
    }

    // Total final (promo OU gamification, pas les deux)
    const totalDiscount = discount + gamificationDiscount;
    const total = Math.max(0, subtotal + deliveryFee - totalDiscount);

    // Générer le numéro de commande
    const orderNumber = await orderRepository.generateOrderNumber();

    // Créer la commande
    const order = await orderRepository.create(userId, {
      orderNumber,
      items: products,
      subtotal,
      deliveryFee,
      discount: totalDiscount,
      total,
      deliveryAddress: data.deliveryAddress,
      deliveryCity,
      deliveryPostalCode: data.deliveryPostalCode,
      deliveryDate: data.deliveryDate,
      deliveryTimeSlot: data.deliveryTimeSlot,
      deliveryNotes: data.deliveryNotes,
      paymentMethod: data.paymentMethod,
      promoCodeId,
      userRewardId,
      gamificationDiscount,
      deliveryZoneId: data.deliveryZoneId,
    });

    // Marquer le bon de récompense comme utilisé
    if (userRewardId) {
      await gamificationRepository.markUserRewardUsed(userRewardId);
    }

    // TODO: Attribuer des points de fidélité
    // TODO: Envoyer un email de confirmation
    // TODO: Envoyer une notification push

    // Notifier les admins en temps réel
    setImmediate(async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, firstName: true, lastName: true, email: true },
        });
        const customerName =
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.name ?? 'Client';

        emitNewOrder({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName,
          customerEmail: user?.email ?? '',
          total: order.total,
          paymentMethod: order.paymentMethod,
          deliveryCity: order.deliveryCity,
          createdAt: order.createdAt.toISOString(),
        });
      } catch (err) {
        // Non-blocking: log but don't crash the request
      }
    });

    // Déclencher les missions et badges en asynchrone (ne bloque pas la réponse)
    setImmediate(async () => {
      // Notifier le client que sa commande est bien reçue (persisté + socket + push)
      notificationService
        .sendOrderNotification(userId, order.id, OrderStatus.PENDING)
        .catch(() => {});

      await Promise.all([
        gamificationService.checkAndUpdateMissions(userId, MissionType.ORDER_COUNT, 1, order.id),
        gamificationService.checkAndUpdateMissions(userId, MissionType.TOTAL_SPENT, total, order.id),
        gamificationService.updateStreakAndCheck(userId),
      ]);
      // Vérifier les badges liés aux commandes (en parallèle, on compte le total de commandes de l'user)
      const orderCount = await orderRepository.countUserOrders(userId);
      await gamificationService.checkAndGrantBadges(userId, MissionType.ORDER_COUNT, orderCount);
    });

    return this.formatOrderResponse(order);
  }

  /**
   * Récupérer mes commandes
   */
  async getMyOrders(
    userId: string,
    query: ListMyOrdersQueryDto
  ): Promise<PaginatedResult<OrderSummaryResponse>> {
    const { orders, total } = await orderRepository.findByUser(userId, query);

    return {
      data: orders.map((o) => this.formatOrderSummary(o)),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Récupérer le détail d'une commande
   */
  async getOrder(userId: string, orderId: string): Promise<OrderResponse> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw createNotFoundError('Commande');
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.userId !== userId) {
      throw createForbiddenError('Vous n\'avez pas accès à cette commande');
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Annuler une commande (client)
   */
  async cancelOrder(
    userId: string,
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw createNotFoundError('Commande');
    }

    if (order.userId !== userId) {
      throw createForbiddenError('Vous n\'avez pas accès à cette commande');
    }

    // Vérifier si l'annulation est possible
    if (order.status !== OrderStatus.PENDING) {
      throw createBadRequestError(
        'Seules les commandes en attente peuvent être annulées'
      );
    }

    await orderRepository.cancel(orderId, 'Annulée par le client', 'Client');

    // TODO: Envoyer un email de confirmation d'annulation
    // TODO: Rembourser si déjà payé

    return {
      success: true,
      message: 'Commande annulée avec succès',
    };
  }

  // ============================================
  // ROUTES ADMIN
  // ============================================

  /**
   * Liste des commandes (Admin)
   */
  async listOrdersAdmin(
    query: ListOrdersAdminQueryDto
  ): Promise<PaginatedResult<OrderAdminResponse>> {
    const { orders, total } = await orderRepository.findManyAdmin(query);

    return {
      data: orders.map((o) => this.formatOrderAdminResponse(o)),
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  /**
   * Détails d'une commande (Admin)
   */
  async getOrderAdmin(orderId: string): Promise<OrderAdminResponse> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw createNotFoundError('Commande');
    }

    return this.formatOrderAdminResponse(order);
  }

  /**
   * Changer le statut d'une commande (Admin)
   */
  async changeOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    adminName?: string
  ): Promise<{ success: boolean; message: string }> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw createNotFoundError('Commande');
    }

    if (order.status === status) {
      throw createBadRequestError(`La commande est déjà ${status.toLowerCase()}`);
    }

    // Vérifier la validité de la transition de statut
    if (!this.isValidStatusTransition(order.status, status)) {
      throw createBadRequestError(
        `Transition de statut invalide: ${order.status} → ${status}`
      );
    }

    // Traitement spécial pour l'annulation
    if (status === OrderStatus.CANCELLED) {
      await orderRepository.cancel(orderId, note, adminName);
    } else {
      await orderRepository.updateStatus(orderId, status, note, adminName);

      // Mettre à jour automatiquement le paiement si livré
      if (status === OrderStatus.DELIVERED && order.paymentStatus === PaymentStatus.PENDING) {
        await orderRepository.updatePaymentStatus(orderId, PaymentStatus.PAID);
      }
    }

    // Notifier le client du changement de statut (persisté + socket + push)
    notificationService
      .sendOrderNotification(order.userId, order.id, status)
      .catch(() => {});

    // Notifier les admins en temps réel
    emitOrderStatusChanged({
      orderId: order.id,
      orderNumber: order.orderNumber,
      oldStatus: order.status,
      newStatus: status,
      note,
      changedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Statut de la commande changé en ${status.toLowerCase()}`,
    };
  }

  /**
   * Mettre à jour la confirmation téléphonique (Admin)
   */
  async updatePhoneConfirmation(
    orderId: string,
    dto: UpdatePhoneConfirmationDto
  ): Promise<{ success: boolean; message: string }> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw createNotFoundError('Commande');

    await orderRepository.updatePhoneConfirmation(orderId, dto);

    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmée',
      NO_RESPONSE: 'Sans réponse',
      DECLINED: 'Refusée',
      PENDING: 'En attente',
    };

    return {
      success: true,
      message: `Confirmation téléphonique : ${labels[dto.status] ?? dto.status}`,
    };
  }

  /**
   * Exporter les commandes en CSV
   */
  async exportOrders(filters?: {
    status?: OrderStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<string> {
    const orders = await orderRepository.findForExport(filters);

    const headers = [
      'Numéro',
      'Date',
      'Client',
      'Email',
      'Téléphone',
      'Statut',
      'Paiement',
      'Total',
      'Produits',
      'Adresse',
      'Ville',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString(),
      o.user.name || '',
      o.user.email,
      o.user.phone || '',
      o.status,
      o.paymentStatus,
      o.total.toString(),
      o.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
      o.deliveryAddress,
      o.deliveryCity,
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }

  /**
   * Statistiques des commandes
   */
  async getOrderStats(dateFrom?: Date, dateTo?: Date) {
    return orderRepository.getStats(dateFrom, dateTo);
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Valider les suppléments d'un item de commande et figer leur prix.
   * Le nom et le prix sont copiés dans la commande : les modifications ultérieures
   * du supplément (prix, désactivation) n'affectent pas les commandes passées.
   */
  private async validateAndFreezeSupplements(
    productId: string,
    supplements: { supplementId: string; quantity: number }[]
  ): Promise<Array<{ supplementId: string; name: string; price: number; quantity: number }>> {
    if (!supplements.length) return [];

    const product = await productRepository.findById(productId);
    const linked = new Map(
      (product?.supplements ?? [])
        .filter((link: any) => link.supplement.isActive)
        .map((link: any) => [link.supplementId, link.supplement])
    );

    const frozen: Array<{ supplementId: string; name: string; price: number; quantity: number }> = [];

    for (const supplement of supplements) {
      if (!Number.isInteger(supplement.quantity) || supplement.quantity < 1) {
        throw createBadRequestError('La quantité d\'un supplément doit être positive');
      }

      const info = linked.get(supplement.supplementId);
      if (!info) {
        throw createBadRequestError('Un supplément sélectionné n\'est plus disponible pour ce produit');
      }

      frozen.push({
        supplementId: info.id,
        name: info.name,
        price: info.price,
        quantity: supplement.quantity,
      });
    }

    return frozen;
  }

  /**
   * Calculer les frais de livraison
   */
  private calculateDeliveryFee(city: string, subtotal: number): number {
    // Livraison gratuite au-dessus d'un certain montant
    if (subtotal >= 5000) return 0;

    // Tarif par ville (peut être configuré en base de données)
    const cityFees: Record<string, number> = {
      Alger: 300,
      Blida: 400,
      Boumerdes: 400,
      Tipaza: 450,
    };

    return cityFees[city] || 500; // Tarif par défaut
  }

  /**
   * Valider et appliquer un bon de récompense gamification
   */
  private async validateAndApplyUserReward(
    rewardId: string,
    userId: string,
    subtotal: number,
    deliveryFee: number
  ): Promise<{ discount: number; isFreeDelivery: boolean }> {
    const reward = await gamificationRepository.findUserRewardById(rewardId);

    if (!reward) {
      throw createBadRequestError('Bon de récompense invalide');
    }

    if (reward.userId !== userId) {
      throw createBadRequestError('Ce bon ne vous appartient pas');
    }

    if (reward.status !== 'AVAILABLE') {
      throw createBadRequestError('Ce bon a déjà été utilisé ou a expiré');
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      throw createBadRequestError('Ce bon a expiré');
    }

    switch (reward.type) {
      case RewardType.DISCOUNT_PERCENTAGE:
        return {
          discount: Math.round(subtotal * (reward.value / 100)),
          isFreeDelivery: false,
        };
      case RewardType.DISCOUNT_FIXED:
        return {
          discount: Math.min(reward.value, subtotal),
          isFreeDelivery: false,
        };
      case RewardType.FREE_DELIVERY:
        return {
          discount: deliveryFee,
          isFreeDelivery: true,
        };
      default:
        throw createBadRequestError('Type de bon non applicable à une commande');
    }
  }

  /**
   * Valider et appliquer un code promo
   */
  private async validateAndApplyPromoCode(
    code: string,
    userId: string,
    subtotal: number,
    deliveryFee: number
  ): Promise<{ discount: number; promoCodeId: string }> {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw createBadRequestError('Code promo invalide');
    }

    if (promoCode.status !== 'ACTIVE') {
      throw createBadRequestError('Ce code promo n\'est plus actif');
    }

    if (promoCode.validUntil && promoCode.validUntil < new Date()) {
      throw createBadRequestError('Ce code promo a expiré');
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw createBadRequestError('Ce code promo a atteint son nombre maximum d\'utilisations');
    }

    if (promoCode.minOrderAmount && subtotal < promoCode.minOrderAmount) {
      throw createBadRequestError(
        `Montant minimum requis: ${promoCode.minOrderAmount} DA`
      );
    }

    // Vérifier la limite d'utilisation par utilisateur
    const alreadyUsed = await prisma.order.findFirst({
      where: { userId, promoCodeId: promoCode.id },
    });
    if (alreadyUsed) {
      throw createBadRequestError('Vous avez déjà utilisé ce code promo');
    }

    // Vérifier la condition applicableTo
    if (promoCode.applicableTo === 'FIRST_ORDER') {
      const orderCount = await prisma.order.count({ where: { userId } });
      if (orderCount > 0) {
        throw createBadRequestError('Ce code promo est réservé à la première commande');
      }
    }

    if (promoCode.applicableTo === 'SUBSCRIPTION') {
      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });
      if (!activeSubscription) {
        throw createBadRequestError('Ce code promo est réservé aux abonnés actifs');
      }
    }

    // Calculer la réduction
    let discount = 0;
    switch (promoCode.type) {
      case 'PERCENTAGE':
        discount = Math.round(subtotal * (promoCode.value / 100));
        break;
      case 'FIXED':
        discount = Math.min(promoCode.value, subtotal);
        break;
      case 'FREE_DELIVERY':
        discount = deliveryFee;
        break;
    }

    return { discount, promoCodeId: promoCode.id };
  }

  /**
   * Vérifier si une transition de statut est valide
   */
  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
      IN_TRANSIT: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      DELIVERED: [], // Pas de transition possible
      CANCELLED: [], // Pas de transition possible
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * Formater la réponse commande
   */
  private formatOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryPostalCode: order.deliveryPostalCode,
      deliveryDate: order.deliveryDate,
      deliveryTimeSlot: order.deliveryTimeSlot,
      deliveryNotes: order.deliveryNotes,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      items: order.items.map((item: any) => {
        const supplementsUnitTotal = (item.supplements ?? []).reduce(
          (sum: number, s: any) => sum + s.price * s.quantity,
          0
        );
        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          unitPrice: item.price,
          supplements: (item.supplements ?? []).map((s: any) => ({
            supplementId: s.supplementId,
            name: s.name,
            price: s.price,
            quantity: s.quantity,
            subtotal: s.price * s.quantity * item.quantity,
          })),
          totalPrice: (item.price + supplementsUnitTotal) * item.quantity,
        };
      }),
      statusHistory: order.statusHistory.map((h: any) => ({
        id: h.id,
        status: h.status,
        note: h.note,
        changedBy: h.changedBy,
        timestamp: h.timestamp,
      })),
      promoCode: order.promoCode?.code || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Formater la réponse commande (Admin)
   */
  private formatOrderAdminResponse(order: any): OrderAdminResponse {
    return {
      ...this.formatOrderResponse(order),
      phoneConfirmation: {
        status: order.phoneConfirmationStatus,
        confirmedAt: order.phoneConfirmedAt,
        confirmedNumber: order.phoneConfirmedNumber,
        note: order.phoneConfirmationNote,
      },
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        orderTrustStatus: order.user.orderTrustStatus,
        orderTrustNote: order.user.orderTrustNote,
      },
    };
  }

  /**
   * Formater le résumé de commande
   */
  private formatOrderSummary(order: any): OrderSummaryResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      itemsCount: order._count?.items || order.items.length,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    };
  }
}

export const orderService = new OrderService();
