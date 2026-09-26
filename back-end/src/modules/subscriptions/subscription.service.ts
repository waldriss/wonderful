import { subscriptionRepository } from './subscription.repository';
import {
  SubscribeInput,
  UpdateSubscriptionInput,
  PauseSubscriptionInput,
  CreatePlanInput,
  UpdatePlanInput,
  ListSubscriptionsQuery,
  PlanResponse,
  SubscriptionResponse,
  SubscriptionStatsResponse,
} from './subscription.dto';
import {
  createNotFoundError,
  createBadRequestError,
  createConflictError,
} from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { SubscriptionPlanType, SubscriptionStatus, SubscriptionPlan, Subscription } from '@prisma/client';

type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan };
type SubscriptionPlanWithCount = SubscriptionPlan & { _count?: { subscriptions: number } };

/**
 * Service pour la logique métier des abonnements
 */
export class SubscriptionService {
  // ============================================
  // PLANS - Client
  // ============================================

  /**
   * Récupérer tous les plans actifs
   */
  async getPlans(): Promise<{ plans: PlanResponse[] }> {
    const plans = await subscriptionRepository.findActivePlans();

    return {
      plans: plans.map((plan: SubscriptionPlan) => this.formatPlanResponse(plan)),
    };
  }

  /**
   * Récupérer un plan par ID
   */
  async getPlanById(planId: string): Promise<PlanResponse> {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw createNotFoundError('Plan');
    }

    return this.formatPlanResponse(plan);
  }

  // ============================================
  // SUBSCRIPTIONS - Client
  // ============================================

  /**
   * Souscrire à un abonnement
   */
  async subscribe(userId: string, data: SubscribeInput): Promise<SubscriptionResponse> {
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const existingSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (existingSubscription) {
      throw createConflictError('Vous avez déjà un abonnement actif');
    }

    // Vérifier le plan
    const plan = await subscriptionRepository.findPlanById(data.planId);
    if (!plan || !plan.isActive) {
      throw createNotFoundError('Plan');
    }

    const subscription = await subscriptionRepository.create({
      userId,
      ...data,
    });

    // Le repository retourne avec plan inclus
    return this.formatSubscriptionResponse(subscription as any);
  }

  /**
   * Récupérer l'abonnement actif de l'utilisateur
   */
  async getMySubscription(userId: string): Promise<SubscriptionResponse | null> {
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      return null;
    }

    return this.formatSubscriptionResponse(subscription);
  }

  /**
   * Récupérer l'historique des abonnements
   */
  async getMySubscriptionHistory(userId: string): Promise<{ subscriptions: SubscriptionResponse[] }> {
    const subscriptions = await subscriptionRepository.findByUserId(userId);

    return {
      subscriptions: subscriptions.map((sub: SubscriptionWithPlan) => this.formatSubscriptionResponse(sub)),
    };
  }

  /**
   * Modifier son abonnement
   */
  async updateMySubscription(
    userId: string,
    data: UpdateSubscriptionInput
  ): Promise<SubscriptionResponse> {
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    const updated = await subscriptionRepository.update(subscription.id, {
      ...(data.deliveryAddress && { deliveryAddress: data.deliveryAddress }),
      ...(data.deliveryDays && { deliveryDays: data.deliveryDays }),
      ...(data.deliveryTimeSlot && { deliveryTimeSlot: data.deliveryTimeSlot }),
    });

    return this.formatSubscriptionResponse(updated);
  }

  /**
   * Mettre en pause son abonnement
   */
  async pauseMySubscription(
    userId: string,
    data?: PauseSubscriptionInput
  ): Promise<{ message: string; subscription: SubscriptionResponse }> {
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    if (subscription.status !== 'ACTIVE') {
      throw createBadRequestError('L\'abonnement n\'est pas actif');
    }

    const paused = await subscriptionRepository.pause(
      subscription.id,
      data?.pauseReason
    );

    return {
      message: 'Abonnement mis en pause avec succès',
      subscription: this.formatSubscriptionResponse(paused),
    };
  }

  /**
   * Reprendre son abonnement
   */
  async resumeMySubscription(
    userId: string
  ): Promise<{ message: string; subscription: SubscriptionResponse }> {
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    if (subscription.status !== 'PAUSED') {
      throw createBadRequestError('L\'abonnement n\'est pas en pause');
    }

    const resumed = await subscriptionRepository.resume(subscription.id);

    return {
      message: 'Abonnement repris avec succès',
      subscription: this.formatSubscriptionResponse(resumed),
    };
  }

  /**
   * Annuler son abonnement
   */
  async cancelMySubscription(
    userId: string,
    reason?: string
  ): Promise<{ message: string }> {
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    await subscriptionRepository.cancel(subscription.id, reason);

    return {
      message: 'Abonnement annulé avec succès',
    };
  }

  // ============================================
  // PLANS - Admin
  // ============================================

  /**
   * Récupérer tous les plans (admin)
   */
  async getAllPlans(): Promise<{ plans: PlanResponse[] }> {
    const plans = await subscriptionRepository.findAllPlans();

    return {
      plans: plans.map((plan: SubscriptionPlanWithCount) => ({
        ...this.formatPlanResponse(plan),
        subscriberCount: plan._count?.subscriptions || 0,
      })),
    };
  }

  /**
   * Créer un plan
   */
  async createPlan(data: CreatePlanInput): Promise<PlanResponse> {
    const plan = await subscriptionRepository.createPlan(data);

    return this.formatPlanResponse(plan);
  }

  /**
   * Modifier un plan
   */
  async updatePlan(planId: string, data: UpdatePlanInput): Promise<PlanResponse> {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw createNotFoundError('Plan');
    }

    const updated = await subscriptionRepository.updatePlan(planId, data);

    return this.formatPlanResponse(updated);
  }

  /**
   * Supprimer un plan
   */
  async deletePlan(planId: string): Promise<{ message: string }> {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw createNotFoundError('Plan');
    }

    const totalSubscriptions = plan._count?.subscriptions ?? 0;
    if (totalSubscriptions > 0) {
      const activeCount = await subscriptionRepository.countActiveSubscriptionsByPlan(planId);

      if (plan.isActive) {
        await subscriptionRepository.updatePlan(planId, { isActive: false });
      }

      if (activeCount > 0) {
        return {
          message:
            `Plan désactivé au lieu d'être supprimé car ${activeCount} abonnement(s) actif(s) l'utilisent encore`,
        };
      }

      return {
        message:
          'Plan archivé au lieu d\'être supprimé car il est déjà lié à des abonnements existants',
      };
    }

    await subscriptionRepository.deletePlan(planId);

    return { message: 'Plan supprimé avec succès' };
  }

  /**
   * Activer/Désactiver un plan
   */
  async changePlanStatus(
    planId: string,
    isActive: boolean
  ): Promise<{ message: string; plan: PlanResponse }> {
    const plan = await subscriptionRepository.findPlanById(planId);

    if (!plan) {
      throw createNotFoundError('Plan');
    }

    const updated = await subscriptionRepository.updatePlan(planId, { isActive });

    return {
      message: isActive ? 'Plan activé' : 'Plan désactivé',
      plan: this.formatPlanResponse(updated),
    };
  }

  // ============================================
  // SUBSCRIPTIONS - Admin
  // ============================================

  /**
   * Liste des abonnements avec filtres
   */
  async listSubscriptions(query: ListSubscriptionsQuery): Promise<{
    data: SubscriptionResponse[];
    pagination: ReturnType<typeof buildPaginationMeta>;
  }> {
    const { subscriptions, total, page, limit } = await subscriptionRepository.findMany(query);

    return {
      data: subscriptions.map((sub: SubscriptionWithPlan) => this.formatSubscriptionResponse(sub)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Détail d'un abonnement
   */
  async getSubscriptionById(subscriptionId: string): Promise<SubscriptionResponse> {
    const subscription = await subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    return this.formatSubscriptionResponse(subscription);
  }

  /**
   * Action admin sur un abonnement (pause/resume/cancel)
   */
  async adminSubscriptionAction(
    subscriptionId: string,
    action: 'pause' | 'resume' | 'cancel',
    reason?: string
  ): Promise<{ message: string; subscription: SubscriptionResponse }> {
    const subscription = await subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw createNotFoundError('Abonnement');
    }

    let updated: SubscriptionWithPlan;
    let message: string;

    switch (action) {
      case 'pause':
        if (subscription.status !== 'ACTIVE') {
          throw createBadRequestError('L\'abonnement n\'est pas actif');
        }
        updated = await subscriptionRepository.pause(subscriptionId, reason);
        message = 'Abonnement mis en pause';
        break;

      case 'resume':
        if (subscription.status !== 'PAUSED') {
          throw createBadRequestError('L\'abonnement n\'est pas en pause');
        }
        updated = await subscriptionRepository.resume(subscriptionId);
        message = 'Abonnement repris';
        break;

      case 'cancel':
        if (subscription.status === 'CANCELLED') {
          throw createBadRequestError('L\'abonnement est déjà annulé');
        }
        updated = await subscriptionRepository.cancel(subscriptionId, reason);
        message = 'Abonnement annulé';
        break;

      default:
        throw createBadRequestError('Action non valide');
    }

    return {
      message,
      subscription: this.formatSubscriptionResponse(updated),
    };
  }

  /**
   * Statistiques des abonnements
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsResponse> {
    const stats = await subscriptionRepository.getStats();

    // Calcul des stats par statut
    type StatusCount = { status: SubscriptionStatus; _count: number };
    const statusMap = new Map(
      stats.statusCounts.map((s: StatusCount) => [s.status, s._count])
    );

    const activeCount = statusMap.get('ACTIVE') || 0;
    const pausedCount = statusMap.get('PAUSED') || 0;
    const cancelledCount = statusMap.get('CANCELLED') || 0;

    // Récupérer les noms des plans pour la distribution
    const plans = await subscriptionRepository.findAllPlans();
    const planMap = new Map(plans.map((p: SubscriptionPlan) => [p.id, p.name]));

    const totalActive = activeCount + pausedCount;
    
    type PlanDistribution = { planId: string; _count: number };
    const planDistribution = stats.planDistribution.map((pd: PlanDistribution) => ({
      planId: pd.planId,
      planName: planMap.get(pd.planId) || 'Inconnu',
      count: pd._count,
      percentage: totalActive > 0 ? Math.round((pd._count / totalActive) * 100) : 0,
    }));

    // Calcul du churn rate (simplifié)
    const churnRate =
      stats.totalSubscriptions > 0
        ? Math.round((cancelledCount / stats.totalSubscriptions) * 100)
        : 0;

    return {
      totalSubscriptions: stats.totalSubscriptions,
      activeSubscriptions: activeCount,
      pausedSubscriptions: pausedCount,
      cancelledSubscriptions: cancelledCount,
      monthlyRevenue: stats.monthlyRevenue,
      churnRate,
      planDistribution,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Formatter la réponse d'un plan
   */
  private formatPlanResponse(plan: SubscriptionPlan | SubscriptionPlanWithCount): PlanResponse {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      type: plan.type,
      basePrice: plan.basePrice,
      maxProducts: plan.maxProducts,
      features: plan.features,
      discount: plan.discount,
      isActive: plan.isActive,
      subscriberCount: (plan as SubscriptionPlanWithCount)._count?.subscriptions,
    };
  }

  /**
   * Formatter la réponse d'un abonnement
   */
  private formatSubscriptionResponse(subscription: SubscriptionWithPlan & { user?: { id: string; name: string | null; email: string } }): SubscriptionResponse {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      startDate: subscription.startDate,
      nextBillingDate: subscription.nextBillingDate,
      nextDeliveryDate: subscription.nextDeliveryDate,
      deliveryDays: subscription.deliveryDays,
      deliveryAddress: subscription.deliveryAddress,
      deliveryTimeSlot: subscription.deliveryTimeSlot,
      paymentMethod: subscription.paymentMethod,
      totalPaid: subscription.totalPaid,
      deliveriesCount: subscription.deliveriesCount,
      pausedAt: subscription.pausedAt,
      pauseReason: subscription.pauseReason,
      cancelledAt: subscription.cancelledAt,
      cancelReason: subscription.cancelReason,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      plan: this.formatPlanResponse(subscription.plan),
      user: subscription.user,
    };
  }
}

export const subscriptionService = new SubscriptionService();
