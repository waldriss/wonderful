"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "@/lib/auth";
import { 
  Trophy,
  Coins,
  Flame,
  Target,
  Users,
  Gift,
  Star,
  Award,
  Zap,
  Calendar,
  Share2,
  ChevronRight,
  Lock,
  CheckCircle,
  Clock,
  Sparkles,
  Crown,
  Medal,
  Heart,
  Package,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRewardTypeLabel } from "@/lib/product-labels";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useGamificationOverview,
  usePoints,
  useBadges,
  useMyBadges,
  useMissions,
  useMysteryBoxes,
  useStreak,
  useReferral,
  useLeaderboard,
  useLeaderboardConfigsPublic,
} from "@/lib/api/gamification/queries";
import {
  useSpendPoints,
  useClaimMissionReward,
  useBuyMysteryBox,
  useOpenMysteryBox,
  useGenerateReferralCode,
  useUseReferralCode,
} from "@/lib/api/gamification/mutations";
import type { Badge, BadgeRarity, Mission, MysteryBox } from "@/lib/api/gamification/types";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "missions" | "leaderboard">("overview");
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"all" | "monthly">("all");

  // ============================================
  // API HOOKS
  // ============================================

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { data: overview, isLoading: overviewLoading } = useGamificationOverview();
  const { data: pointsBalance } = usePoints();
  const { data: allBadges = [], isLoading: isBadgesLoading } = useBadges();
  const { data: myBadges = [], isLoading: isMyBadgesLoading } = useMyBadges();
  const { data: allMissions = [], isLoading: isMissionsLoading } = useMissions();
  const { data: mysteryBoxes = [], isLoading: mysteryBoxesLoading } = useMysteryBoxes();
  const { data: streak } = useStreak();
  const { data: referral } = useReferral();
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useLeaderboard({ period: leaderboardPeriod, limit: 20 });
  const { data: leaderboardConfigs = [], isLoading: isConfigsLoading } = useLeaderboardConfigsPublic();

  // Mutations
  const spendPoints = useSpendPoints();
  const claimMission = useClaimMissionReward();
  const buyBox = useBuyMysteryBox();
  const openBox = useOpenMysteryBox();
  const generateCode = useGenerateReferralCode();
  const applyCode = useUseReferralCode();

  // Derived values
  const points = pointsBalance ?? overview?.points ?? { totalPoints: 0, availablePoints: 0, lifetimeEarned: 0, lifetimeSpent: 0 };
  const streakData = streak ?? overview?.streak ?? { currentStreak: 0, longestStreak: 0, lastOrderDate: null, active: false };
  const earnedBadges = myBadges;
  const referralCode = referral?.code ?? overview?.referralCode ?? null;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getRarityColor = (rarity: BadgeRarity | string) => {
    switch (rarity) {
      case "COMMON": return "text-gray-600 bg-gray-100";
      case "RARE": return "text-blue-600 bg-blue-100";
      case "EPIC": return "text-purple-600 bg-purple-100";
      case "LEGENDARY": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRarityLabel = (rarity: BadgeRarity | string) => {
    switch (rarity) {
      case "COMMON": return "Commun";
      case "RARE": return "Rare";
      case "EPIC": return "Épique";
      case "LEGENDARY": return "Légendaire";
      default: return rarity;
    }
  };

  const getMissionProgress = (mission: Mission) => {
    if (mission.completed) return 100;
    if (!mission.currentProgress || !mission.targetValue) return 0;
    return Math.round((mission.currentProgress / mission.targetValue) * 100);
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case "ORDER": return <Package className="w-5 h-5 text-secondary" />;
      case "SOCIAL": return <Share2 className="w-5 h-5 text-secondary" />;
      case "NUTRITION": return <Heart className="w-5 h-5 text-secondary" />;
      case "EXPLORATION": return <Sparkles className="w-5 h-5 text-secondary" />;
      case "STREAK": return <Flame className="w-5 h-5 text-secondary" />;
      default: return <Target className="w-5 h-5 text-secondary" />;
    }
  };

  const getBadgeRewardLabel = (badge: Badge) => {
    if (!badge.rewardType || !badge.rewardValue) return null;
    if (badge.rewardType === "POINTS") return `${badge.rewardValue} points`;
    if (badge.rewardType === "DISCOUNT_PERCENTAGE") return `${badge.rewardValue}% de réduction`;
    if (badge.rewardType === "DISCOUNT_FIXED") return `${badge.rewardValue} DA de réduction`;
    if (badge.rewardType === "FREE_DELIVERY") return "Livraison gratuite";
    return `${badge.rewardValue} ${formatRewardTypeLabel(badge.rewardType)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-secondary" />
            Récompenses Wonderful
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Gagnez des points et débloquez des récompenses exclusives
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          Historique
        </motion.button>
      </div>

      {/* Main Stats Grid */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Points Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-secondary/20 to-secondary/30 border-2 border-secondary/40 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-sans font-medium text-secondary-850/60">
                  Wonderful Points
                </p>
                <p className="text-2xl font-sans font-bold text-secondary-850">
                  {points.availablePoints.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs font-sans text-secondary-850/60">
              <p>Gagnés: {points.lifetimeEarned.toLocaleString()}</p>
              <p>Dépensés: {points.lifetimeSpent.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-sans font-medium text-secondary-850/60">
                  Streak Actuel
                </p>
                <p className="text-2xl font-sans font-bold text-secondary-850">
                  {streakData.currentStreak} jours
                </p>
              </div>
            </div>
            <div className="text-xs font-sans text-secondary-850/60">
              <p>Record: {streakData.longestStreak} jours 🏆</p>
            </div>
          </motion.div>

          {/* Badges Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-sans font-medium text-secondary-850/60">
                  Badges
                </p>
                <p className="text-2xl font-sans font-bold text-secondary-850">
                  {overview?.badgesEarned ?? earnedBadges.length}/{overview?.totalBadges ?? allBadges.length}
                </p>
              </div>
            </div>
            <div className="text-xs font-sans text-secondary-850/60">
              <p>{(overview?.totalBadges ?? allBadges.length) - (overview?.badgesEarned ?? earnedBadges.length)} à débloquer</p>
            </div>
          </motion.div>

          {/* Referrals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-sans font-medium text-secondary-850/60">
                  Amis parrainés
                </p>
                <p className="text-2xl font-sans font-bold text-secondary-850">
                  {referral?.successfulReferrals ?? 0}
                </p>
              </div>
            </div>
            <div className="text-xs font-sans text-secondary-850/60">
              <p>Gagné: {referral?.totalEarned ?? 0} pts</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-2 flex flex-wrap gap-2">
        {[
          { id: "overview" as const, label: "Vue d'ensemble", icon: Sparkles },
          { id: "badges" as const, label: "Badges", icon: Award },
          { id: "missions" as const, label: "Missions", icon: Target },
          { id: "leaderboard" as const, label: "Classement", icon: Crown }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 min-w-[140px] h-12 px-4 rounded-xl font-sans font-semibold transition-all duration-200 flex items-center justify-center gap-2",
              activeTab === tab.id
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary-850/60 hover:bg-secondary/10"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Mystery Boxes Shop */}
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-bold text-secondary-850 flex items-center gap-2">
                <Gift className="w-6 h-6 text-secondary" />
                Coffres Mystère
              </h2>
              <span className="text-sm font-sans font-medium text-secondary-850/60">
                Achetez avec vos points
              </span>
            </div>

            {mysteryBoxesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[180px] rounded-2xl" />
                ))}
              </div>
            ) : mysteryBoxes.length === 0 ? (
              <div className="text-center py-8 text-secondary-850/40">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-sans">Aucun coffre mystère disponible pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mysteryBoxes.map((box) => {
                  const canAfford = points.availablePoints >= box.cost;
                  
                  return (
                    <motion.div
                      key={box.id}
                      variants={itemVariants}
                      whileHover={{ scale: canAfford ? 1.03 : 1 }}
                      onClick={() => {
                        if (!canAfford) return;
                        buyBox.mutate(box.id, {
                          onSuccess: (data) => {
                            openBox.mutate(data.userMysteryBoxId);
                          },
                        });
                      }}
                      className={cn(
                        "relative bg-card border-2 rounded-2xl p-6 transition-all duration-200",
                        canAfford 
                          ? "border-secondary/30 cursor-pointer hover:border-secondary hover:shadow-lg" 
                          : "border-secondary/10 opacity-50"
                      )}
                    >
                      {!canAfford && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-secondary-850/30" />
                        </div>
                      )}

                      <div className="text-4xl mb-3">{box.icon || "🎁"}</div>
                      <h3 className="font-sans font-bold text-secondary-850 mb-1">
                        {box.name}
                      </h3>
                      <p className="text-xs text-secondary-850/60 font-sans mb-4">
                        {box.description || getRarityLabel(box.rarity)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-secondary font-sans font-bold">
                          <Coins className="w-4 h-4" />
                          {box.cost}
                        </div>
                        {canAfford && !buyBox.isPending && (
                          <ChevronRight className="w-4 h-4 text-secondary" />
                        )}
                        {buyBox.isPending && (
                          <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Streak Progress */}
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-bold text-secondary-850 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                Votre Streak
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-sans font-semibold">
                {streakData.active ? "Actif" : "Inactif"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Progress */}
              <div className="bg-card border-2 border-orange-300/30 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl font-sans font-bold text-orange-500 mb-2">
                    {streakData.currentStreak}
                  </div>
                  <p className="text-sm font-sans font-medium text-secondary-850/70">
                    jours consécutifs
                  </p>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (streakData.currentStreak / 14) * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-orange-500"
                  />
                </div>
                <p className="text-xs text-center font-sans text-secondary-850/60 mt-2">
                  {streakData.currentStreak < 14 && (
                    <>Plus que {14 - streakData.currentStreak} jours pour la prochaine récompense</>
                  )}
                  {streakData.currentStreak >= 14 && streakData.currentStreak < 30 && (
                    <>Plus que {30 - streakData.currentStreak} jours pour un repas gratuit</>
                  )}
                  {streakData.currentStreak >= 30 && (
                    <>Incroyable ! Continuez comme ça !</>
                  )}
                </p>
              </div>

              {/* Streak Milestones */}
              <div className="space-y-3">
                {[
                  { days: 7, reward: "-10% sur commande", achieved: streakData.currentStreak >= 7 },
                  { days: 14, reward: "1 boisson offerte", achieved: streakData.currentStreak >= 14 },
                  { days: 30, reward: "1 repas gratuit", achieved: streakData.currentStreak >= 30 }
                ].map((milestone) => (
                  <div
                    key={milestone.days}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                      milestone.achieved
                        ? "bg-green-100/50 border-green-300"
                        : "bg-card border-secondary/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      milestone.achieved ? "bg-green-500" : "bg-secondary-850/10"
                    )}>
                      {milestone.achieved ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm font-sans font-bold text-secondary-850/60">
                          {milestone.days}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-secondary-850">
                        {milestone.days} jours
                      </p>
                      <p className="text-xs text-secondary-850/60 font-sans">
                        {milestone.reward}
                      </p>
                    </div>
                    {milestone.achieved && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Missions */}
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-bold text-secondary-850 flex items-center gap-2">
                <Target className="w-6 h-6 text-secondary" />
                Missions actives
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("missions")}
                className="text-sm font-sans font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {isMissionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[200px] rounded-2xl" />
                ))}
              </div>
            ) : allMissions.length === 0 ? (
              <div className="text-center py-8 text-secondary-850/40">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-sans">Aucune mission active pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allMissions.slice(0, 3).map((mission: Mission) => {
                  const progress = getMissionProgress(mission);
                  return (
                    <motion.div
                      key={mission.id}
                      variants={itemVariants}
                      className="bg-card border-2 border-secondary/10 rounded-2xl p-5 hover:border-secondary/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                          {getMissionTypeIcon(mission.type)}
                        </div>
                        {mission.endDate && (
                          <div className="flex items-center gap-1 text-xs font-sans text-secondary-850/60">
                            <Clock className="w-3 h-3" />
                            {new Date(mission.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </div>
                        )}
                      </div>

                      <h3 className="font-sans font-bold text-secondary-850 mb-2">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-secondary-850/60 font-sans mb-4">
                        {mission.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-sans font-medium text-secondary-850/70">
                            {mission.currentProgress ?? 0}/{mission.targetValue}
                          </span>
                          <span className="text-xs font-sans font-medium text-secondary">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary-850/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-secondary"
                          />
                        </div>
                      </div>

                      {/* Reward + Claim */}
                      <div className="flex items-center justify-between pt-3 border-t border-secondary/10">
                        <span className="text-xs font-sans font-medium text-secondary-850/60">
                          Récompense
                        </span>
                        {mission.completed && !mission.claimed ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => claimMission.mutate(mission.id)}
                            disabled={claimMission.isPending}
                            className="text-sm font-sans font-bold text-white bg-secondary px-3 py-1 rounded-full hover:bg-secondary/90 disabled:opacity-50"
                          >
                            {claimMission.isPending ? "..." : "Réclamer"}
                          </motion.button>
                        ) : (
                          <span className="text-sm font-sans font-bold text-secondary">
                            {mission.rewardType === "POINTS"
                              ? `${mission.rewardValue} pts`
                              : mission.rewardType === "DISCOUNT_PERCENTAGE"
                                ? `${mission.rewardValue}% de réduction`
                                : mission.rewardType === "DISCOUNT_FIXED"
                                  ? `${mission.rewardValue} DA de réduction`
                                  : formatRewardTypeLabel(mission.rewardType)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Referral Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Info */}
              <div>
                <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-3 flex items-center gap-2">
                  <Users className="w-7 h-7 text-green-600" />
                  Parrainez vos amis
                </h2>
                <p className="text-secondary-850/70 font-sans mb-6">
                  Invitez vos amis et gagnez tous les deux des points bonus !
                </p>

                {/* Referral Code */}
                <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4 mb-6">
                  <p className="text-xs font-sans font-medium text-secondary-850/60 mb-2">
                    Votre code de parrainage
                  </p>
                  <div className="flex items-center justify-between">
                    {referralCode ? (
                      <>
                        <span className="text-2xl font-sans font-bold text-secondary tracking-wider">
                          {referralCode}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(referralCode);
                          }}
                          className="h-9 px-4 bg-secondary text-white rounded-full text-sm font-sans font-semibold hover:bg-secondary/90"
                        >
                          Copier
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => generateCode.mutate()}
                        disabled={generateCode.isPending}
                        className="h-9 px-4 bg-secondary text-white rounded-full text-sm font-sans font-semibold hover:bg-secondary/90 disabled:opacity-50"
                      >
                        {generateCode.isPending ? "Génération..." : "Générer mon code"}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-card border-2 border-secondary/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-sans font-bold text-secondary-850">
                      {referral?.successfulReferrals ?? 0}
                    </p>
                    <p className="text-xs font-sans text-secondary-850/60 mt-1">
                      Amis inscrits
                    </p>
                  </div>
                  <div className="bg-card border-2 border-secondary/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-sans font-bold text-green-600">
                      {referral?.totalEarned ?? 0} pts
                    </p>
                    <p className="text-xs font-sans text-secondary-850/60 mt-1">
                      Gagné
                    </p>
                  </div>
                </div>

                {/* Utiliser le code d'un ami */}
                <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
                  <p className="text-xs font-sans font-medium text-secondary-850/60 mb-2">
                    Vous avez été parrainé ? Entrez le code de votre ami
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC12XYZ"
                      maxLength={20}
                      className="flex-1 h-9 px-3 rounded-full border-2 border-secondary/10 bg-background text-sm font-sans font-bold tracking-wider uppercase focus:outline-none focus:border-secondary/40"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!referralInput.trim()) return;
                        applyCode.mutate(referralInput.trim(), {
                          onSuccess: () => setReferralInput(""),
                        });
                      }}
                      disabled={applyCode.isPending || !referralInput.trim()}
                      className="h-9 px-4 bg-green-600 text-white rounded-full text-sm font-sans font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {applyCode.isPending ? "..." : "Appliquer"}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right: Milestones */}
              <div>
                <h3 className="text-lg font-sans font-bold text-secondary-850 mb-4">
                  Récompenses de parrainage
                </h3>
                <div className="space-y-3">
                  {[
                    { count: 1, reward: "50 points bonus", achieved: (referral?.successfulReferrals ?? 0) >= 1 },
                    { count: 5, reward: "250 points + Badge", achieved: (referral?.successfulReferrals ?? 0) >= 5 },
                    { count: 10, reward: "1000 points", achieved: (referral?.successfulReferrals ?? 0) >= 10 },
                    { count: 20, reward: "2500 points", achieved: (referral?.successfulReferrals ?? 0) >= 20 }
                  ].map((milestone) => (
                    <div
                      key={milestone.count}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                        milestone.achieved
                          ? "bg-green-500 border-green-600"
                          : "bg-card border-secondary/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-sans font-bold",
                        milestone.achieved
                          ? "bg-white text-green-600"
                          : "bg-green-100 text-green-600"
                      )}>
                        {milestone.achieved ? "✓" : milestone.count}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-sans font-semibold",
                          milestone.achieved ? "text-white" : "text-secondary-850"
                        )}>
                          {milestone.count} ami{milestone.count > 1 ? "s" : ""}
                        </p>
                        <p className={cn(
                          "text-xs font-sans",
                          milestone.achieved ? "text-white/80" : "text-secondary-850/60"
                        )}>
                          {milestone.reward}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReferralModal(true)}
                  className="w-full h-12 mt-4 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Partager mon code
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mystery Box CTA */}
          {mysteryBoxes && mysteryBoxes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-purple-300 rounded-3xl p-8 text-center"
            >
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-2">
                Coffres Mystère disponibles !
              </h2>
              <p className="text-secondary-850/70 font-sans mb-6">
                {mysteryBoxes.length} coffre{mysteryBoxes.length > 1 ? "s" : ""} disponible{mysteryBoxes.length > 1 ? "s" : ""} à l&apos;achat
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("badges")}
                className="h-14 px-8 bg-gradient-to-r from-secondary to-pink-500 text-white rounded-full font-sans font-bold text-lg hover:shadow-lg transition-all duration-200"
              >
                Voir les coffres ✨
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* BADGES TAB */}
      {activeTab === "badges" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-sans font-bold text-secondary-850">
                  Collection de badges
                </h2>
                {myBadges && allBadges && (
                  <p className="text-sm text-secondary-850/60 font-sans mt-1">
                    {myBadges.length} badges débloqués sur {allBadges.length}
                  </p>
                )}
              </div>
            </div>

            {isBadgesLoading || isMyBadgesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : allBadges && allBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBadges.map((badge) => {
                  const earned = !!badge.earnedAt;
                  return (
                    <motion.div
                      key={badge.id}
                      variants={itemVariants}
                      className={cn(
                        "bg-card border-2 rounded-2xl p-6 transition-all duration-200",
                        earned
                          ? "border-secondary/30 hover:border-secondary hover:shadow-lg"
                          : "border-secondary/10 opacity-70"
                      )}
                    >
                      {/* Badge Icon & Rarity */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "text-5xl w-16 h-16 flex items-center justify-center rounded-xl",
                          earned ? "bg-secondary/20" : "bg-secondary-850/5 grayscale"
                        )}>
                          {badge.icon}
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-sans font-bold",
                          getRarityColor(badge.rarity)
                        )}>
                          {getRarityLabel(badge.rarity)}
                        </span>
                      </div>

                      {/* Badge Info */}
                      <h3 className="font-sans font-bold text-secondary-850 mb-2 flex items-center gap-2">
                        {badge.name}
                        {earned && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </h3>
                      <p className="text-sm text-secondary-850/60 font-sans mb-4">
                        {badge.description}
                      </p>

                      {/* Progress */}
                      {!earned && badge.progress !== undefined && badge.progress !== null && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-sans font-medium text-secondary-850/70">
                              Progression
                            </span>
                            <span className="text-xs font-sans font-bold text-secondary">
                              {badge.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-secondary-850/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${badge.progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-secondary"
                            />
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      {badge.rewardType && badge.rewardValue && (
                        <div className="pt-4 border-t border-secondary/10">
                          <p className="text-xs font-sans font-medium text-secondary-850/60 mb-1">
                            Récompense
                          </p>
                          <p className="text-sm font-sans font-bold text-secondary">
                            {badge.rewardType === "POINTS"
                              ? `${badge.rewardValue} points`
                              : badge.rewardType === "DISCOUNT_PERCENTAGE"
                                ? `${badge.rewardValue}% de réduction`
                                : badge.rewardType === "DISCOUNT_FIXED"
                                  ? `${badge.rewardValue} DA de réduction`
                                  : formatRewardTypeLabel(badge.rewardType)}
                          </p>
                        </div>
                      )}

                      {/* Earned Date */}
                      {earned && badge.earnedAt && (
                        <p className="text-xs text-secondary-850/50 font-sans mt-3">
                          Débloqué le {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary-850/40">
                <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-sans">Aucun badge disponible</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* MISSIONS TAB */}
      {activeTab === "missions" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-2">
                Missions
              </h2>
              <p className="text-sm text-secondary-850/60 font-sans">
                Complétez les missions pour gagner des récompenses
              </p>
            </div>

            {isMissionsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : allMissions && allMissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {allMissions.map((mission) => {
                  const progress = getMissionProgress(mission);
                  return (
                    <motion.div
                      key={mission.id}
                      variants={itemVariants}
                      className="bg-card border-2 border-secondary/10 rounded-2xl p-6 hover:border-secondary/30 transition-all duration-200"
                    >
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getMissionTypeIcon(mission.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-sans font-bold text-secondary-850 mb-1">
                                {mission.title}
                              </h3>
                              <p className="text-sm text-secondary-850/60 font-sans">
                                {mission.description}
                              </p>
                            </div>
                            {mission.endDate && (
                              <div className="flex items-center gap-2 text-sm font-sans text-secondary-850/60 flex-shrink-0">
                                <Clock className="w-4 h-4" />
                                {new Date(mission.endDate).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long"
                                })}
                              </div>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-sans font-medium text-secondary-850/70">
                                Progression: {mission.currentProgress ?? 0}/{mission.targetValue}
                              </span>
                              <span className="text-sm font-sans font-bold text-secondary">
                                {progress}%
                              </span>
                            </div>
                            <div className="h-3 bg-secondary-850/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-secondary to-pink-500"
                              />
                            </div>
                          </div>

                          {/* Reward & Action */}
                          <div className="flex items-center justify-between pt-4 border-t border-secondary/10">
                            <div className="flex items-center gap-2">
                              <Gift className="w-5 h-5 text-secondary" />
                              <span className="text-sm font-sans font-medium text-secondary-850/70">
                                Récompense:
                              </span>
                              <span className="text-base font-sans font-bold text-secondary">
                                {mission.rewardType === "POINTS"
                                  ? `${mission.rewardValue} points`
                                  : mission.rewardType === "DISCOUNT_PERCENTAGE"
                                    ? `${mission.rewardValue}% de réduction`
                                    : mission.rewardType === "DISCOUNT_FIXED"
                                      ? `${mission.rewardValue} DA de réduction`
                                      : formatRewardTypeLabel(mission.rewardType)}
                              </span>
                            </div>
                            {mission.completed && !mission.claimed && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => claimMission.mutate(mission.id)}
                                disabled={claimMission.isPending}
                                className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-sans font-semibold hover:bg-green-600 disabled:opacity-50"
                              >
                                {claimMission.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Réclamer"}
                              </motion.button>
                            )}
                            {mission.claimed && (
                              <span className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-sans font-semibold">
                                ✓ Réclamé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary-850/40">
                <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-sans">Aucune mission disponible</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="bg-card border-2 border-secondary/10 rounded-3xl p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-2 flex items-center gap-2">
                  <Crown className="w-7 h-7 text-yellow-500" />
                  Classement
                </h2>
                <p className="text-sm text-secondary-850/60 font-sans">
                  {leaderboardPeriod === "monthly"
                    ? "Top des meilleurs membres ce mois-ci"
                    : "Top des meilleurs membres de tous les temps"}
                </p>
              </div>

              {/* Period Selector */}
              <div className="bg-secondary/10 rounded-xl p-1 flex gap-1">
                <button
                  onClick={() => setLeaderboardPeriod("monthly")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all",
                    leaderboardPeriod === "monthly"
                      ? "bg-secondary text-white shadow-sm"
                      : "text-secondary-850/60 hover:text-secondary-850"
                  )}
                >
                  Ce mois-ci
                </button>
                <button
                  onClick={() => setLeaderboardPeriod("all")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all",
                    leaderboardPeriod === "all"
                      ? "bg-secondary text-white shadow-sm"
                      : "text-secondary-850/60 hover:text-secondary-850"
                  )}
                >
                  Tous les temps
                </button>
              </div>
            </div>

            {/* Rewards at stake (monthly only) */}
            {leaderboardPeriod === "monthly" && (
              <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5">
                <h3 className="text-sm font-sans font-bold text-secondary-850 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-600" />
                  Récompenses du mois en jeu
                </h3>
                {isConfigsLoading ? (
                  <div className="flex gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                    ))}
                  </div>
                ) : leaderboardConfigs.filter(c => c.isActive).length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {leaderboardConfigs
                      .filter((c) => c.isActive)
                      .sort((a, b) => a.rank - b.rank)
                      .map((config) => (
                        <div
                          key={config.rank}
                          className="flex items-center gap-2 bg-white border border-yellow-200 rounded-xl px-4 py-2 shadow-sm"
                        >
                          <span className="text-lg">
                            {config.rank === 1 ? "🥇" : config.rank === 2 ? "🥈" : config.rank === 3 ? "🥉" : `#${config.rank}`}
                          </span>
                          <span className="text-sm font-sans font-semibold text-secondary-850">
                            {config.rewardType === "POINTS" && `${config.rewardValue} pts`}
                            {config.rewardType === "DISCOUNT_PERCENTAGE" && `${config.rewardValue}% de réduction`}
                            {config.rewardType === "DISCOUNT_FIXED" && `${config.rewardValue} DA de réduction`}
                            {config.rewardType === "FREE_DELIVERY" && "Livraison gratuite"}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary-850/60 font-sans">
                    Aucune récompense configurée pour ce mois-ci.
                  </p>
                )}
              </div>
            )}

            {isLeaderboardLoading ? (
              <div className="space-y-3">
                {/* Podium skeleton */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" style={{ marginTop: i === 1 ? 0 : "2rem" }} />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => {
                      if (!entry) return null;
                      const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                      const isMe = entry.userId === currentUserId;
                      return (
                        <div
                          key={entry.userId}
                          className={cn(
                            "rounded-2xl p-6 text-center relative",
                            rank === 1 ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 order-2" : "",
                            rank === 2 ? "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 order-1" : "",
                            rank === 3 ? "bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 order-3" : ""
                          )}
                          style={{ marginTop: rank === 1 ? "0" : "2rem" }}
                        >
                          {isMe && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-secondary text-white text-[10px] font-sans font-bold rounded-full uppercase tracking-wide">
                              Vous
                            </span>
                          )}
                          <div className={cn(
                            "w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center font-sans font-bold text-2xl",
                            rank === 1 ? "bg-yellow-500 text-white" : "",
                            rank === 2 ? "bg-gray-400 text-white" : "",
                            rank === 3 ? "bg-orange-400 text-white" : ""
                          )}>
                            {rank === 1 && "🥇"}
                            {rank === 2 && "🥈"}
                            {rank === 3 && "🥉"}
                          </div>
                          <h3 className="font-sans font-bold text-secondary-850 mb-1">
                            {entry.userName}
                          </h3>
                          <p className="text-sm text-secondary-850/60 font-sans mb-2">
                            {entry.totalPoints.toLocaleString()} {leaderboardPeriod === "monthly" ? "pts ce mois" : "points"}
                          </p>
                          <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-sans font-semibold text-secondary">
                            {entry.badgeCount} badge{entry.badgeCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rest of Leaderboard */}
                <div className="space-y-2">
                  {leaderboard.slice(3).map((entry, idx) => {
                    const isMe = entry.userId === currentUserId;
                    return (
                      <div
                        key={entry.userId}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                          isMe
                            ? "bg-secondary/10 border-secondary/40"
                            : "bg-card border-secondary/10 hover:border-secondary/20"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold flex-shrink-0 bg-secondary-850/10 text-secondary-850/60">
                          #{idx + 4}
                        </div>
                        <div className="flex-1">
                          <p className="font-sans font-bold text-secondary-850 flex items-center gap-2">
                            {entry.userName}
                            {isMe && (
                              <span className="px-2 py-0.5 bg-secondary text-white text-[10px] font-sans font-bold rounded-full uppercase tracking-wide">
                                Vous
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-sans font-bold text-secondary-850">
                            {entry.totalPoints.toLocaleString()}
                          </p>
                          <p className="text-xs font-sans text-secondary-850/60">
                            {leaderboardPeriod === "monthly" ? "pts ce mois" : "points"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* My position if not in top 20 */}
                {(() => {
                  const myRank = leaderboard.findIndex((e) => e.userId === currentUserId);
                  if (myRank === -1 && currentUserId) {
                    return (
                      <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-secondary/30 bg-secondary/5 text-center">
                        <p className="text-sm font-sans text-secondary-850/70">
                          Vous n&apos;êtes pas encore dans le top 20. Continuez à grimper !
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <div className="text-center py-12 text-secondary-850/40">
                <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-sans">Classement non disponible</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* SHARE REFERRAL MODAL */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl text-center">Partager mon code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Code affiché */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-sans text-secondary-850/60 mb-1">Votre code de parrainage</p>
              <p className="text-3xl font-sans font-bold text-secondary tracking-widest">
                {referralCode ?? "—"}
              </p>
            </div>

            {/* Bouton copier */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!referralCode) return;
                navigator.clipboard.writeText(referralCode);
              }}
              className="w-full h-11 bg-secondary text-white rounded-full font-sans font-semibold text-sm hover:bg-secondary/90 transition-colors"
            >
              Copier le code
            </motion.button>

            {/* WhatsApp */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`https://wa.me/?text=${encodeURIComponent(`Rejoins-moi sur NutriFlow et utilise mon code de parrainage ${referralCode ?? ""} pour gagner 50 points bonus dès ton inscription !`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-[#25D366] text-white rounded-full font-sans font-semibold text-sm hover:bg-[#1ebe5a] transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Partager sur WhatsApp
            </motion.a>

            {/* Email */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`mailto:?subject=${encodeURIComponent("Rejoins-moi sur NutriFlow !")}&body=${encodeURIComponent(`Salut !\n\nRejoins-moi sur NutriFlow et utilise mon code de parrainage : ${referralCode ?? ""}\n\nTu gagneras 50 points bonus dès ton inscription !`)}`}
              className="w-full h-11 bg-gray-100 text-secondary-850 rounded-full font-sans font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Envoyer par email
            </motion.a>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
