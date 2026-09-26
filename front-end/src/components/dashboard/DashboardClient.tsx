"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatOrderStatusLabel } from "@/lib/product-labels";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Package, 
  Heart, 
  Star, 
  TrendingUp,
  ShoppingCart,
  Gift,
  Calendar,
  Bell,
  Settings,
  Plus,
  ArrowRight,
  ChefHat,
  Utensils,
  Flame,
  Award,
  MapPin,
  Loader2
} from "lucide-react";
import { useDashboard } from "@/lib/api/users";
import { useUnreadCount } from "@/lib/api/notifications";

// Import images
import white from "../../../public/images/white.png";
import yellow from "../../../public/images/yellow.png";
import blue from "../../../public/images/blue.png";

const orderImages = [white.src, yellow.src, blue.src];

export default function DashboardClient() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const { data: unreadCount = 0 } = useUnreadCount();

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-secondary-850/60 font-sans">Impossible de charger le dashboard.</p>
      </div>
    );
  }

  const { profile, stats, recentOrders, activeSubscription, nextMeals } = dashboard;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
          {/* Header avec Greeting et Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
                  <AvatarFallback className="text-xl bg-secondary text-white font-sans font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-sans font-bold text-secondary-850 tracking-wide">
                  Bonjour, {profile.name?.split(' ')[0] || profile.firstName || "Chef"}! 👋
                </h1>
                <p className="text-secondary-850/70 text-sm sm:text-base font-sans mt-1">
                  {activeSubscription ? (
                    <>Prochaine livraison : <span className="font-semibold text-secondary">{activeSubscription.nextDeliveryDate ? new Date(activeSubscription.nextDeliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'À planifier'}</span></>
                  ) : (
                    <span className="text-secondary-850/60">Pas d'abonnement actif</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/dashboard/user/notifications">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative h-10 w-10 rounded-full border-2 border-secondary/30 bg-white/50 backdrop-blur-sm flex items-center justify-center hover:border-secondary transition-colors duration-200"
                >
                  <Bell className="h-5 w-5 text-secondary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-sans font-bold flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-full border-2 border-secondary/30 bg-white/50 backdrop-blur-sm flex items-center justify-center hover:border-secondary transition-colors duration-200"
              >
                <Settings className="h-5 w-5 text-secondary" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Repas cette semaine */}
            <motion.div
              whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
              className="bg-card border-2 border-secondary/10 rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Utensils className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary-850/60 font-sans">Cette semaine</p>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-secondary-850 font-sans mb-1">{stats.totalOrders > 0 ? Math.min(stats.totalOrders, 7) : 0}</h3>
              <p className="text-sm text-secondary-850/70 font-sans">Repas planifiés</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-xs text-secondary-850/60 font-sans font-medium">3/4</span>
              </div>
            </motion.div>

            {/* Recettes favorites */}
            <motion.div
              whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
              className="bg-card border-2 border-secondary/10 rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-sans font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +3 cette semaine
                  </p>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-secondary-850 font-sans mb-1">{stats.favoritesCount}</h3>
              <p className="text-sm text-secondary-850/70 font-sans">Recettes favorites</p>
            </motion.div>

            {/* Points fidélité */}
            <motion.div
              whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
              className="bg-gradient-to-br from-primary-200/50 to-primary-300/30 border-2 border-primary-300/30 rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-300/50 rounded-xl">
                  <Award className="h-6 w-6 text-secondary-850" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary-850/60 font-sans">Fidélité</p>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-secondary-850 font-sans mb-1">{stats.totalPoints}</h3>
              <p className="text-sm text-secondary-850/70 font-sans">Points accumulés</p>
              <p className="text-xs text-secondary-850/60 font-sans mt-2">
                150 pts → récompense 🎁
              </p>
            </motion.div>

            {/* Commandes */}
            <motion.div
              whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
              className="bg-card border-2 border-secondary/10 rounded-2xl p-6 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary-850/60 font-sans">Depuis le début</p>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-secondary-850 font-sans mb-1">{stats.totalOrders}</h3>
              <p className="text-sm text-secondary-850/70 font-sans">Commandes totales</p>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prochains repas */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2 bg-card border-2 border-secondary/10 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    <ChefHat className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-sans font-bold text-secondary-850">Vos prochains repas</h2>
                    <p className="text-sm text-secondary-850/60 font-sans">Planifiés pour cette semaine</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-secondary hover:text-secondary/80 font-sans font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                >
                  Voir tout <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                {nextMeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ChefHat className="h-10 w-10 text-secondary/30 mb-3" />
                    <p className="text-sm text-secondary-850/50 font-sans">Aucun repas planifié.</p>
                    <p className="text-xs text-secondary-850/40 font-sans mt-1">Abonnez-vous pour voir vos prochains repas.</p>
                  </div>
                ) : (
                  nextMeals.map((meal, index) => (
                    <motion.div 
                      key={meal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, borderColor: "rgba(237,103,109,0.3)" }}
                      className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border-2 border-secondary/10 transition-all duration-200"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image 
                          src={meal.image} 
                          alt={meal.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-semibold text-secondary-850 truncate">{meal.name}</h4>
                        <p className="text-sm text-secondary-850/60 font-sans">{meal.mealType ?? meal.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {meal.calories !== null && (
                            <span className="text-xs text-secondary-850/60 font-sans flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-secondary/20 text-secondary border border-secondary/30">
                          {meal.category}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Abonnement Status */}
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-2 border-secondary/30 rounded-3xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-sans font-bold text-secondary-850">Mon Abonnement</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-850/70 font-sans">Plan actuel</span>
                    <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-secondary text-white">
                      {activeSubscription?.planName || "Aucun"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-850/70 font-sans">Prochaine livraison</span>
                    <span className="text-sm font-sans font-semibold text-secondary-850 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-secondary" />
                      {activeSubscription?.nextDeliveryDate ? new Date(activeSubscription.nextDeliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : "N/A"}
                    </span>
                  </div>
                  <Link href="/dashboard/user/subscription">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200"
                    >
                      Gérer mon abonnement
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Commandes récentes */}
              <motion.div 
                variants={itemVariants}
                className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-sans font-bold text-secondary-850">Commandes récentes</h3>
                </div>
                <div className="space-y-3">
                  {recentOrders.slice(0, 3).map((order, idx) => (
                    <motion.div 
                      key={order.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-secondary/10 transition-all duration-200"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={orderImages[idx % orderImages.length]} 
                          alt={order.orderNumber}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-secondary-850 text-sm truncate">#{order.orderNumber}</p>
                        <p className="text-xs text-secondary-850/60 font-sans">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${
                          order.status === "DELIVERED" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {formatOrderStatusLabel(order.status)}
                        </span>
                        <p className="text-xs text-secondary font-sans font-medium mt-1">{order.total.toLocaleString()} DA</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/dashboard/user/orders">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full mt-4 text-secondary hover:text-secondary/80 font-sans font-medium text-sm transition-colors duration-200"
                  >
                    Voir toutes les commandes
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Action Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Link href="/boutique" className="block">
              <motion.div
                whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
                className="bg-card border-2 border-secondary/10 rounded-3xl p-6 text-center cursor-pointer transition-all duration-200"
              >
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-sans font-bold text-secondary-850 mb-2">Commander à la carte</h3>
                <p className="text-sm text-secondary-850/60 font-sans mb-4">Découvrez notre sélection de plats</p>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block h-10 px-6 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 leading-10"
                >
                  Voir la boutique
                </motion.span>
              </motion.div>
            </Link>

            <Link href="/dashboard/user/subscription" className="block">
              <motion.div
                whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
                className="bg-card border-2 border-secondary/10 rounded-3xl p-6 text-center cursor-pointer transition-all duration-200"
              >
                <div className="w-16 h-16 bg-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-sans font-bold text-secondary-850 mb-2">Mon abonnement</h3>
                <p className="text-sm text-secondary-850/60 font-sans mb-4">Gérez votre plan de repas hebdomadaire</p>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block h-10 px-6 bg-secondary/80 hover:bg-secondary text-white rounded-full font-sans font-semibold transition-colors duration-200 leading-10"
                >
                  Gérer
                </motion.span>
              </motion.div>
            </Link>

            <Link href="/dashboard/user/nutrition" className="block">
              <motion.div
                whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.3)" }}
                className="bg-card border-2 border-secondary/10 rounded-3xl p-6 text-center cursor-pointer transition-all duration-200"
              >
                <div className="w-16 h-16 bg-secondary/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-sans font-bold text-secondary-850 mb-2">Ma nutrition</h3>
                <p className="text-sm text-secondary-850/60 font-sans mb-4">Suivez vos habitudes alimentaires</p>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block h-10 px-6 bg-secondary/60 hover:bg-secondary/80 text-white rounded-full font-sans font-semibold transition-colors duration-200 leading-10"
                >
                  Voir les stats
                </motion.span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
  );
}
