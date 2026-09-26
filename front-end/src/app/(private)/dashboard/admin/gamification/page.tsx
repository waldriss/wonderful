"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Trophy,
  Search,
  Edit,
  Plus,
  X,
  Target,
  Gift,
  Coins,
  Medal,
  Check,
  Trash2,
  Loader2,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Flame,
  Info,
  AlertCircle,
  Package,
  TrendingUp,
  Users,
  Award,
  Zap,
  Gem,
  Crown,
  BarChart3,
  Crown as CrownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRewardTypeLabel } from "@/lib/product-labels";
import {
  useAdminBadges,
  useAdminMissions,
  useAdminMysteryBoxes,
  useAdminGamificationStats,
  useLeaderboardConfigs,
  useMonthlyLeaderboardAdmin,
} from "@/lib/api/admin/queries";
import {
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
  useCreateMission,
  useUpdateMission,
  useDeleteMission,
  useCreateMysteryBox,
  useUpdateMysteryBox,
  useDeleteMysteryBox,
  useUpsertLeaderboardConfig,
  useDeleteLeaderboardConfig,
  useDistributeMonthlyRewards,
} from "@/lib/api/admin/mutations";
import type {
  AdminBadge,
  AdminMission,
  AdminMysteryBox,
  BadgeRarityAPI,
  MissionTypeAPI,
  MissionStatusAPI,
  BadgeStatusAPI,
  CreateBadgeData,
  CreateMissionData,
  CreateMysteryBoxData,
  LeaderboardConfig,
} from "@/lib/api/admin/types";

// ─── Configs ────────────────────────────────────────────────────────────────

const MISSION_TYPE_CONFIG: Record<
  MissionTypeAPI,
  { label: string; description: string; unit: string; Icon: React.ElementType }
> = {
  ORDER_COUNT: {
    label: "Nombre de commandes",
    description: "Se déclenche quand l'utilisateur passe N commandes",
    unit: "commandes",
    Icon: ShoppingCart,
  },
  TOTAL_SPENT: {
    label: "Montant dépensé",
    description: "Se déclenche quand l'utilisateur dépense N DA au total",
    unit: "DA",
    Icon: DollarSign,
  },
  REFERRAL_COUNT: {
    label: "Parrainages",
    description: "Se déclenche quand l'utilisateur parraine N amis",
    unit: "parrainages",
    Icon: UserPlus,
  },
  STREAK_DAYS: {
    label: "Streak de jours",
    description: "Se déclenche quand l'utilisateur maintient une streak de N jours consécutifs",
    unit: "jours",
    Icon: Flame,
  },
};

const RARITY_CONFIG: Record<
  BadgeRarityAPI,
  { label: string; pillBg: string; bgLight: string; iconBg: string; iconColor: string; Icon: React.ElementType }
> = {
  COMMON:    { label: "Commun",     pillBg: "bg-gray-500",   bgLight: "bg-gray-100",   iconBg: "bg-gray-100",   iconColor: "text-gray-500",   Icon: Medal },
  RARE:      { label: "Rare",       pillBg: "bg-blue-500",   bgLight: "bg-blue-100",   iconBg: "bg-blue-100",   iconColor: "text-blue-500",   Icon: Award },
  EPIC:      { label: "Épique",     pillBg: "bg-purple-500", bgLight: "bg-purple-100", iconBg: "bg-purple-100", iconColor: "text-purple-500", Icon: Gem   },
  LEGENDARY: { label: "Légendaire", pillBg: "bg-yellow-500", bgLight: "bg-yellow-100", iconBg: "bg-yellow-100", iconColor: "text-amber-500",  Icon: Crown },
};

const BADGE_REQUIREMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "ORDER_COUNT", label: "Nombre de commandes" },
  { value: "TOTAL_SPENT", label: "Montant dépensé (DA)" },
  { value: "REFERRAL_COUNT", label: "Parrainages" },
  { value: "STREAK_DAYS", label: "Streak de jours" },
];

const REWARD_TYPE_OPTIONS = [
  { value: "POINTS", label: "Points" },
  { value: "DISCOUNT_PERCENTAGE", label: "Réduction en %" },
  { value: "DISCOUNT_FIXED", label: "Réduction fixe (DA)" },
  { value: "FREE_DELIVERY", label: "Livraison gratuite" },
];

const MYSTERY_BOX_REWARD_TYPES = [
  { value: "POINTS", label: "Points" },
  { value: "DISCOUNT_PERCENTAGE", label: "Réduction en %" },
  { value: "DISCOUNT_FIXED", label: "Réduction fixe (DA)" },
  { value: "FREE_DELIVERY", label: "Livraison gratuite" },
];

const STATUS_CONFIG: Record<
  MissionStatusAPI,
  { label: string; color: string }
> = {
  ACTIVE:   { label: "Actif",   color: "bg-green-100 text-green-600" },
  INACTIVE: { label: "Inactif", color: "bg-gray-100 text-gray-600"  },
  EXPIRED:  { label: "Expiré",  color: "bg-red-100 text-red-500"    },
};

// ─── Page principale ─────────────────────────────────────────────────────────

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<"missions" | "badges" | "boxes" | "leaderboard">("missions");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMission | AdminBadge | AdminMysteryBox | null>(null);

  const { data: stats } = useAdminGamificationStats();
  const { data: missions, isLoading: loadingMissions } = useAdminMissions({ search });
  const { data: badges, isLoading: loadingBadges } = useAdminBadges({ search });
  const { data: boxes, isLoading: loadingBoxes } = useAdminMysteryBoxes({ search });

  const handleOpenCreate = () => { setEditingItem(null); setShowModal(true); };
  const handleOpenEdit = (item: AdminMission | AdminBadge | AdminMysteryBox) => {
    setEditingItem(item);
    setShowModal(true);
  };
  const handleClose = () => { setShowModal(false); setEditingItem(null); };

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
            Gestion Gamification
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Gérez les missions, badges et coffres mystères
          </p>
        </div>
        {activeTab !== "leaderboard" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreate}
            className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "missions" && "Nouvelle mission"}
            {activeTab === "badges" && "Nouveau badge"}
            {activeTab === "boxes" && "Nouveau coffre"}
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Points distribués",   value: stats?.totalPointsDistributed ?? 0, bg: "bg-yellow-100",  icon: <Coins  className="w-5 h-5 text-yellow-600" /> },
          { label: "Missions complétées", value: stats?.totalMissionsCompleted  ?? 0, bg: "bg-blue-100",   icon: <Target className="w-5 h-5 text-blue-600"   /> },
          { label: "Badges obtenus",      value: stats?.totalBadgesEarned       ?? 0, bg: "bg-purple-100", icon: <Medal  className="w-5 h-5 text-purple-600"  /> },
          { label: "Coffres ouverts",     value: stats?.mysteryBoxesOpened      ?? 0, bg: "bg-green-100",  icon: <Gift   className="w-5 h-5 text-green-600"   /> },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>{icon}</div>
              <p className="text-sm font-sans text-secondary-850/60">{label}</p>
            </div>
            <p className="text-2xl font-sans font-bold text-secondary-850">{value.toLocaleString("fr-FR")}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-2">
        <div className="flex gap-2">
          {[
            { id: "missions",   label: "Missions",         icon: Target },
            { id: "badges",     label: "Badges",           icon: Medal  },
            { id: "boxes",      label: "Coffres Mystères", icon: Gift   },
            { id: "leaderboard", label: "Classement",       icon: CrownIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as typeof activeTab); setSearch(""); }}
              className={cn(
                "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-sans font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-secondary text-white"
                  : "text-secondary-850/60 hover:bg-secondary/10"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      {activeTab !== "leaderboard" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-850/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 h-10 text-sm font-sans border-2 border-secondary/20 rounded-full bg-white/30 focus:outline-none focus:border-secondary transition-colors text-secondary-850"
          />
        </div>
      )}

      {/* Tab content */}
      {activeTab === "missions" && (
        <MissionsTab
          missions={missions?.data ?? []}
          loading={loadingMissions}
          onEdit={handleOpenEdit}
        />
      )}
      {activeTab === "badges" && (
        <BadgesTab
          badges={badges?.data ?? []}
          loading={loadingBadges}
          onEdit={handleOpenEdit}
        />
      )}
      {activeTab === "boxes" && (
        <BoxesTab
          boxes={boxes?.data ?? []}
          loading={loadingBoxes}
          onEdit={handleOpenEdit}
        />
      )}
      {activeTab === "leaderboard" && <LeaderboardTab />}

      {/* Modal */}
      {showModal && activeTab !== "leaderboard" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-sans font-bold text-secondary-850">
                {editingItem
                  ? activeTab === "missions" ? "Modifier la mission" : activeTab === "badges" ? "Modifier le badge" : "Modifier le coffre"
                  : activeTab === "missions" ? "Nouvelle mission"    : activeTab === "badges" ? "Nouveau badge"     : "Nouveau coffre"}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 bg-secondary/10 hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            {activeTab === "missions" && (
              <MissionForm
                editingItem={editingItem as AdminMission | null}
                onClose={handleClose}
              />
            )}
            {activeTab === "badges" && (
              <BadgeForm
                editingItem={editingItem as AdminBadge | null}
                onClose={handleClose}
              />
            )}
            {activeTab === "boxes" && (
              <BoxForm
                editingItem={editingItem as AdminMysteryBox | null}
                onClose={handleClose}
              />
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Missions Tab ─────────────────────────────────────────────────────────────

function MissionsTab({
  missions,
  loading,
  onEdit,
}: {
  missions: AdminMission[];
  loading: boolean;
  onEdit: (item: AdminMission) => void;
}) {
  const { mutate: deleteMission } = useDeleteMission();

  if (loading) return <LoadingGrid />;
  if (!missions.length) return <EmptyState message="Aucune mission trouvée" />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-card border-2 border-secondary/10 rounded-2xl p-4 text-sm font-sans text-secondary-850/70">
        <Info className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
        <span>
          Les missions sont déclenchées automatiquement selon le <strong>type</strong> lorsque l&apos;utilisateur
          passe une commande, publie un avis, parraine un ami, etc.
        </span>
      </div>
      {missions.map((mission) => {
        const config = MISSION_TYPE_CONFIG[mission.type] ?? MISSION_TYPE_CONFIG.ORDER_COUNT;
        const statusCfg = STATUS_CONFIG[mission.status] ?? STATUS_CONFIG.INACTIVE;
        const TypeIcon = config.Icon;
        return (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-secondary/10 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center shrink-0">
                <TypeIcon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-sans font-semibold text-secondary-850">{mission.title}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-sans font-semibold", statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-sans font-semibold">
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-secondary-850/60 font-sans mt-1">{mission.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs font-sans flex-wrap">
                  <span className="text-secondary-850/60 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Objectif: {mission.targetValue} {config.unit}
                  </span>
                  <span className="text-secondary-850/60">•</span>
                  <span className="text-secondary font-semibold flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {mission.rewardType === "POINTS"
                      ? `${mission.rewardValue} pts`
                      : mission.rewardType === "DISCOUNT_PERCENTAGE"
                        ? `${mission.rewardValue}% de réduction`
                        : mission.rewardType === "DISCOUNT_FIXED"
                          ? `${mission.rewardValue} DA de réduction`
                          : formatRewardTypeLabel(mission.rewardType)}
                  </span>
                  {mission.completionsCount > 0 && (
                    <>
                      <span className="text-secondary-850/60">•</span>
                      <span className="text-secondary-850/60 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {mission.completionsCount} complétions
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(mission)}
                className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteMission(mission.id)}
                className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Badges Tab ───────────────────────────────────────────────────────────────

function BadgesTab({
  badges,
  loading,
  onEdit,
}: {
  badges: AdminBadge[];
  loading: boolean;
  onEdit: (item: AdminBadge) => void;
}) {
  const { mutate: deleteBadge } = useDeleteBadge();

  if (loading) return <LoadingGrid />;
  if (!badges.length) return <EmptyState message="Aucun badge trouvé" />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-card border-2 border-secondary/10 rounded-2xl p-4 text-sm font-sans text-secondary-850/70">
        <Info className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
        <span>
          Les badges sont attribués <strong>automatiquement</strong> quand un utilisateur atteint le seuil
          de la condition d&apos;obtention. La rareté affecte la valeur perçue. Le bonus de points est optionnel.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const rarityCfg = RARITY_CONFIG[badge.rarity] ?? RARITY_CONFIG.COMMON;
          const RarityIcon = rarityCfg.Icon;
          const reqOption = BADGE_REQUIREMENT_OPTIONS.find((o) => o.value === badge.requirementType);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border-2 border-secondary/10 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", rarityCfg.iconBg)}>
                  <RarityIcon className={cn("w-7 h-7", rarityCfg.iconColor)} />
                </div>
                <span className={cn("px-2 py-1 rounded-full text-xs font-sans font-semibold text-white", rarityCfg.pillBg)}>
                  {rarityCfg.label}
                </span>
              </div>
              <h3 className="font-sans font-semibold text-secondary-850 text-lg">{badge.name}</h3>
              {badge.category && (
                <span className="text-xs font-sans text-secondary-850/50">{badge.category}</span>
              )}
              <p className="text-sm text-secondary-850/60 font-sans mt-1">{badge.description}</p>
              {badge.requirementType && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-sans text-secondary-850/60">
                  <Zap className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>
                    {reqOption?.label ?? badge.requirementType}
                    {badge.requirementTarget != null && <> ≥ <strong>{badge.requirementTarget}</strong></>}
                  </span>
                </div>
              )}
              {badge.rewardType && badge.rewardValue != null && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-sans text-secondary-850/60">
                  <Coins className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>+{badge.rewardType === "POINTS"
                    ? `${badge.rewardValue} pts`
                    : badge.rewardType === "DISCOUNT_PERCENTAGE"
                      ? `${badge.rewardValue}% de réduction`
                      : badge.rewardType === "DISCOUNT_FIXED"
                        ? `${badge.rewardValue} DA de réduction`
                        : formatRewardTypeLabel(badge.rewardType)} à l&apos;obtention</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-secondary/10">
                <div className="flex items-center gap-1 text-sm text-secondary-850/60 font-sans">
                  <Users className="w-4 h-4" />
                  {badge.earnedCount} utilisateurs
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(badge)}
                    className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteBadge(badge.id)}
                    className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mystery Boxes Tab ────────────────────────────────────────────────────────

function BoxesTab({
  boxes,
  loading,
  onEdit,
}: {
  boxes: AdminMysteryBox[];
  loading: boolean;
  onEdit: (item: AdminMysteryBox) => void;
}) {
  const { mutate: deleteBox } = useDeleteMysteryBox();

  if (loading) return <LoadingGrid />;
  if (!boxes.length) return <EmptyState message="Aucun coffre trouvé" />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-card border-2 border-secondary/10 rounded-2xl p-4 text-sm font-sans text-secondary-850/70">
        <Info className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
        <span>
          Chaque coffre contient une liste de récompenses possibles. La colonne <strong>%</strong> indique la probabilité
          de tirer chaque récompense (total ≤ 100%). La <strong>Valeur</strong> dépend du type : pts pour Points, % pour Réduction.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boxes.map((box) => {
          const rarityCfg = RARITY_CONFIG[box.rarity] ?? RARITY_CONFIG.COMMON;
          const RarityIcon = rarityCfg.Icon;
          const totalProbability = (box.rewards ?? []).reduce((sum, r) => sum + (r.probability ?? 0), 0);
          const probabilityOk = totalProbability <= 100;
          return (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("rounded-2xl p-6 border-2 border-secondary/10", rarityCfg.bgLight)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-white/70 rounded-xl flex items-center justify-center">
                  <RarityIcon className={cn("w-8 h-8", rarityCfg.iconColor)} />
                </div>
                <span className={cn("px-3 py-1 rounded-full text-sm font-sans font-semibold text-white", rarityCfg.pillBg)}>
                  {box.cost} pts
                </span>
              </div>

              <h3 className="font-sans font-bold text-secondary-850 text-xl">{box.name}</h3>
              <p className="text-sm text-secondary-850/60 font-sans mt-1">{box.description}</p>

              {(box.rewards ?? []).length > 0 && (
                <div className="mt-4 space-y-1">
                  <h4 className="text-xs font-sans font-semibold text-secondary-850 uppercase mb-2">Récompenses possibles</h4>
                  {(box.rewards ?? []).map((reward, idx) => {
                    const rtOpt = MYSTERY_BOX_REWARD_TYPES.find((o) => o.value === reward.type);
                    const isFD  = reward.type === "FREE_DELIVERY";
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm font-sans">
                        <span className="text-secondary-850">
                          {isFD
                            ? "Livraison gratuite"
                            : `${reward.value}${reward.type === "POINTS" ? " pts" : reward.type === "DISCOUNT_PERCENTAGE" ? "%" : reward.type === "DISCOUNT_FIXED" ? " DA" : ""} ${rtOpt?.label ?? reward.type}`}
                        </span>
                        <span className="text-secondary-850/60">{reward.probability}%</span>
                      </div>
                    );
                  })}
                  <div className={cn(
                    "flex items-center justify-between text-xs font-sans pt-1 mt-1 border-t border-secondary/20",
                    probabilityOk ? "text-green-600" : "text-red-500"
                  )}>
                    <span className="flex items-center gap-1">
                      {probabilityOk ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      Total
                    </span>
                    <span className="font-bold">{totalProbability}%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary/20">
                <span className="text-sm text-secondary-850/60 font-sans">{box.openedCount} ouverts</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(box)}
                    className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-secondary hover:bg-white/70 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteBox(box.id)}
                    className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mission Form ─────────────────────────────────────────────────────────────

function MissionForm({
  editingItem,
  onClose,
}: {
  editingItem: AdminMission | null;
  onClose: () => void;
}) {
  const { mutate: createMission, isPending: creating } = useCreateMission();
  const { mutate: updateMission, isPending: updating } = useUpdateMission();
  const isMutating = creating || updating;

  const [form, setForm] = useState<CreateMissionData>({
    title: editingItem?.title ?? "",
    description: editingItem?.description ?? "",
    type: editingItem?.type ?? "ORDER_COUNT",
    targetValue: editingItem?.targetValue ?? 1,
    rewardType: editingItem?.rewardType ?? "POINTS",
    rewardValue: editingItem?.rewardValue ?? 100,
    startDate: editingItem?.startDate ?? "",
    endDate: editingItem?.endDate ?? "",
    status: (editingItem?.status as MissionStatusAPI) ?? "ACTIVE",
  });

  const selectedTypeConfig = MISSION_TYPE_CONFIG[form.type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateMissionData = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    if (editingItem) {
      updateMission({ id: editingItem.id, data: payload }, { onSuccess: onClose });
    } else {
      createMission(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Type de déclenchement</label>
        <select
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MissionTypeAPI }))}
          className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
        >
          {Object.entries(MISSION_TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        {selectedTypeConfig && (
          <p className="text-xs text-secondary-850/50 font-sans mt-1 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-secondary" />
            {selectedTypeConfig.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Titre *</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          placeholder="Ex : Premier achat"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
          rows={3}
          className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none"
          placeholder="Description visible par l'utilisateur"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">
            Objectif ({selectedTypeConfig?.unit ?? "unités"})
          </label>
          <input
            type="number"
            min={1}
            value={form.targetValue}
            onChange={(e) => setForm((f) => ({ ...f, targetValue: Number(e.target.value) }))}
            required
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Statut</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MissionStatusAPI }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="EXPIRED">Expiré</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Type de récompense</label>
          <select
            value={form.rewardType}
            onChange={(e) => setForm((f) => ({ ...f, rewardType: e.target.value as import('@/lib/api/admin/types').RewardTypeAPI }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            {REWARD_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Valeur récompense</label>
          <input
            type="number"
            min={0}
            value={form.rewardValue}
            onChange={(e) => setForm((f) => ({ ...f, rewardValue: Number(e.target.value) }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Date de début</label>
          <input
            type="date"
            value={form.startDate ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Date de fin</label>
          <input
            type="date"
            value={form.endDate ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
      </div>

      <FormActions isMutating={isMutating} editingItem={editingItem} onClose={onClose} />
    </form>
  );
}

// ─── Badge Form ───────────────────────────────────────────────────────────────

function BadgeForm({
  editingItem,
  onClose,
}: {
  editingItem: AdminBadge | null;
  onClose: () => void;
}) {
  const { mutate: createBadge, isPending: creating } = useCreateBadge();
  const { mutate: updateBadge, isPending: updating } = useUpdateBadge();
  const isMutating = creating || updating;

  const [form, setForm] = useState<CreateBadgeData>({
    name: editingItem?.name ?? "",
    description: editingItem?.description ?? "",
    icon: editingItem?.icon ?? "",
    category: editingItem?.category ?? "",
    rarity: editingItem?.rarity ?? "COMMON",
    requirementType: editingItem?.requirementType ?? undefined,
    requirementTarget: editingItem?.requirementTarget ?? undefined,
    rewardType: editingItem?.rewardType ?? "POINTS",
    rewardValue: editingItem?.rewardValue ?? undefined,
    status: editingItem?.status ?? "ACTIVE",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateBadgeData = {
      ...form,
      category: form.category || undefined,
      requirementType: form.requirementType || undefined,
      icon: form.icon || "badge",
    };
    if (editingItem) {
      updateBadge({ id: editingItem.id, data: payload }, { onSuccess: onClose });
    } else {
      createBadge(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Nom *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            placeholder="Ex : Premier pas"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Catégorie</label>
          <input
            value={form.category ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            placeholder="Ex : Commandes"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
          rows={3}
          className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none"
          placeholder="Description affichée à l'utilisateur"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Rareté</label>
          <select
            value={form.rarity}
            onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value as BadgeRarityAPI }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Statut</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BadgeStatusAPI }))}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
          </select>
        </div>
      </div>

      <div className="border-2 border-secondary/10 rounded-2xl p-4 space-y-3 bg-white/20">
        <p className="text-sm font-sans font-semibold text-secondary-850 flex items-center gap-2">
          <Zap className="w-4 h-4 text-secondary" />
          Condition d&apos;obtention
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-sans font-medium text-secondary-850/70 mb-1">Type de condition</label>
            <select
              value={form.requirementType ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, requirementType: (e.target.value as import('@/lib/api/admin/types').MissionTypeAPI) || undefined }))}
              className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Aucune</option>
              {BADGE_REQUIREMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-secondary-850/70 mb-1">Seuil requis</label>
            <input
              type="number"
              min={1}
              value={form.requirementTarget ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, requirementTarget: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors"
              placeholder="Ex : 5"
            />
          </div>
        </div>
      </div>

      <div className="border-2 border-secondary/10 rounded-2xl p-4 space-y-3 bg-white/20">
        <p className="text-sm font-sans font-semibold text-secondary-850 flex items-center gap-2">
          <Coins className="w-4 h-4 text-secondary" />
          Bonus à l&apos;obtention (optionnel)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-sans font-medium text-secondary-850/70 mb-1">Type</label>
            <select
              value={form.rewardType ?? "POINTS"}
              onChange={(e) => setForm((f) => ({ ...f, rewardType: e.target.value as import('@/lib/api/admin/types').RewardTypeAPI }))}
              className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors"
            >
              {REWARD_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-secondary-850/70 mb-1">Valeur</label>
            <input
              type="number"
              min={0}
              value={form.rewardValue ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, rewardValue: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 text-sm focus:outline-none focus:border-secondary transition-colors"
              placeholder="Ex : 50"
            />
          </div>
        </div>
      </div>

      <FormActions isMutating={isMutating} editingItem={editingItem} onClose={onClose} />
    </form>
  );
}

// ─── Box Form ─────────────────────────────────────────────────────────────────

type RewardRow = {
  type: string;
  value: number;
  probability: number;
  description: string;
};

function BoxForm({
  editingItem,
  onClose,
}: {
  editingItem: AdminMysteryBox | null;
  onClose: () => void;
}) {
  const { mutate: createBox, isPending: creating } = useCreateMysteryBox();
  const { mutate: updateBox, isPending: updating } = useUpdateMysteryBox();
  const isMutating = creating || updating;

  const [name, setName] = useState(editingItem?.name ?? "");
  const [description, setDescription] = useState(editingItem?.description ?? "");
  const [cost, setCost] = useState(editingItem?.cost ?? 0);
  const [rarity, setRarity] = useState<BadgeRarityAPI>(editingItem?.rarity ?? "COMMON");
  const [rewards, setRewards] = useState<RewardRow[]>(
    (editingItem?.rewards ?? []).map((r) => ({
      type: r.type,
      value: r.value,
      probability: r.probability,
      description: r.description ?? "",
    }))
  );

  const totalProbability = rewards.reduce((sum, r) => sum + (r.probability ?? 0), 0);
  const probabilityOk = totalProbability <= 100;

  const addReward = () =>
    setRewards((prev) => [...prev, { type: "POINTS", value: 0, probability: 0, description: "" }]);

  const removeReward = (idx: number) =>
    setRewards((prev) => prev.filter((_, i) => i !== idx));

  const updateReward = (idx: number, field: keyof RewardRow, value: string | number) =>
    setRewards((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateMysteryBoxData = {
      name,
      description: description || undefined,
      cost,
      rarity,
      rewards: rewards.map((r) => ({
        type: r.type,
        value: r.value,
        probability: r.probability,
        description: r.description || undefined,
      })),
    };
    if (editingItem) {
      updateBox({ id: editingItem.id, data: payload }, { onSuccess: onClose });
    } else {
      createBox(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Nom *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
            placeholder="Ex : Coffre Bronze"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Rareté</label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as BadgeRarityAPI)}
            className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          >
            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors resize-none"
          placeholder="Description du coffre"
        />
      </div>

      <div>
        <label className="block text-sm font-sans font-medium text-secondary-850 mb-2">Coût (points)</label>
        <input
          type="number"
          min={0}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          className="w-full h-12 px-4 bg-white/30 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 focus:outline-none focus:border-secondary transition-colors"
          placeholder="500"
        />
      </div>

      <div className="border-2 border-secondary/10 rounded-2xl p-4 space-y-3 bg-white/20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-sans font-semibold text-secondary-850 flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" />
            Récompenses possibles
          </p>
          <button
            type="button"
            onClick={addReward}
            className="text-sm font-sans text-secondary flex items-center gap-1 hover:underline"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {rewards.length > 0 && (
          <>
            <div className="rounded-xl overflow-hidden border-2 border-secondary/10">
              <table className="w-full text-sm font-sans">
                <thead className="bg-secondary/5">
                  <tr>
                    <th className="text-left px-3 py-2 text-secondary-850/60 font-medium">Type</th>
                    <th className="text-left px-3 py-2 text-secondary-850/60 font-medium">Valeur</th>
                    <th className="text-left px-3 py-2 text-secondary-850/60 font-medium">%</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/5">
                  {rewards.map((reward, idx) => {
                    const isFreeDelivery = reward.type === "FREE_DELIVERY";
                    return (
                      <tr key={idx} className="bg-white/30">
                        <td className="px-3 py-2">
                          <select
                            value={reward.type}
                            onChange={(e) => updateReward(idx, "type", e.target.value)}
                            className="w-full border-2 border-secondary/20 rounded-lg px-2 py-1 text-sm bg-white/50 focus:outline-none focus:border-secondary text-secondary-850"
                          >
                            {MYSTERY_BOX_REWARD_TYPES.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={reward.value}
                            onChange={(e) => updateReward(idx, "value", Number(e.target.value))}
                            disabled={isFreeDelivery}
                            className="w-full border-2 border-secondary/20 rounded-lg px-2 py-1 text-sm bg-white/50 focus:outline-none focus:border-secondary text-secondary-850 disabled:opacity-40"
                            placeholder={isFreeDelivery ? "N/A" : "0"}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={reward.probability}
                            onChange={(e) => updateReward(idx, "probability", Number(e.target.value))}
                            className="w-full border-2 border-secondary/20 rounded-lg px-2 py-1 text-sm bg-white/50 focus:outline-none focus:border-secondary text-secondary-850"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => removeReward(idx)}
                            className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={cn(
              "flex items-center justify-between text-sm font-sans px-1",
              probabilityOk ? "text-green-600" : "text-red-500"
            )}>
              <span className="flex items-center gap-1">
                {probabilityOk ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {probabilityOk ? "Total valide" : "Total > 100% !"}
              </span>
              <span className="font-bold">{totalProbability}%</span>
            </div>
          </>
        )}
      </div>

      <FormActions isMutating={isMutating} editingItem={editingItem} onClose={onClose} />
    </form>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab() {
  const { data: configs, isLoading: loadingConfigs } = useLeaderboardConfigs();
  const { data: monthlyLeaderboard, isLoading: loadingLeaderboard } = useMonthlyLeaderboardAdmin();
  const { mutate: upsertConfig, isPending: upserting } = useUpsertLeaderboardConfig();
  const { mutate: deleteConfig } = useDeleteLeaderboardConfig();
  const { mutate: distributeRewards, isPending: distributing } = useDistributeMonthlyRewards();

  const [editForms, setEditForms] = useState<Record<number, Partial<LeaderboardConfig>>>({});

  // Pré-remplir les formulaires quand les configs arrivent
  useEffect(() => {
    if (configs) {
      const forms: Record<number, Partial<LeaderboardConfig>> = {};
      configs.forEach((c) => {
        forms[c.rank] = { ...c };
      });
      setEditForms(forms);
    }
  }, [configs]);

  const handleAddPosition = () => {
    const existingRanks = configs?.map((c) => c.rank) ?? [];
    const nextRank = existingRanks.length > 0 ? Math.max(...existingRanks) + 1 : 1;
    if (nextRank > 10) {
      toast.error('Maximum 10 positions configurables');
      return;
    }
    setEditForms((prev) => ({
      ...prev,
      [nextRank]: { rank: nextRank, rewardType: 'POINTS', rewardValue: 0, isActive: true },
    }));
    upsertConfig({ rank: nextRank, data: { rewardType: 'POINTS', rewardValue: 0, isActive: true } });
  };

  const handleSave = (rank: number) => {
    const form = editForms[rank];
    if (!form) return;
    upsertConfig({ rank, data: { rewardType: form.rewardType, rewardValue: form.rewardValue, isActive: form.isActive } });
  };

  const handleDelete = (rank: number) => {
    if (configs?.find((c) => c.rank === rank)) {
      deleteConfig(rank);
    } else {
      setEditForms((prev) => {
        const next = { ...prev };
        delete next[rank];
        return next;
      });
    }
  };

  const handleDistribute = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir distribuer les récompenses ? Cette action est irréversible.')) {
      return;
    }
    distributeRewards({});
  };

  const renderRewardLabel = (type: string, value: number) => {
    if (type === 'POINTS') return `${value} pts`;
    if (type === 'DISCOUNT_PERCENTAGE') return `${value}% réduction`;
    if (type === 'DISCOUNT_FIXED') return `${value} DA`;
    if (type === 'FREE_DELIVERY') return 'Livraison gratuite';
    return `${value} ${type}`;
  };

  return (
    <div className="space-y-6">
      {/* Section Config Récompenses */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-sans font-bold text-secondary-850 flex items-center gap-2">
            <CrownIcon className="w-5 h-5 text-secondary" />
            Configuration des récompenses
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddPosition}
            className="h-9 px-4 bg-secondary text-white rounded-full font-sans font-semibold text-sm hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une position
          </motion.button>
        </div>

        <p className="text-sm text-secondary-850/60 font-sans mb-4">
          Configurez les récompenses pour chaque position du classement mensuel (Top 1, 2, 3...).
          Seules les positions actives seront distribuées.
        </p>

        {loadingConfigs ? (
          <LoadingGrid />
        ) : (
          <div className="space-y-3">
            {(configs ?? []).length === 0 && Object.keys(editForms).length === 0 && (
              <EmptyState message="Aucune configuration de récompense" />
            )}
            {(configs ?? []).map((config) => {
              const form = editForms[config.rank] ?? config;
              return (
                <motion.div
                  key={config.rank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-white/30 border-2 border-secondary/10 rounded-xl p-4"
                >
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-sans font-bold text-secondary">#{config.rank}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="text-xs font-sans font-medium text-secondary-850/60 mb-1 block">Type</label>
                      <select
                        value={form.rewardType ?? 'POINTS'}
                        onChange={(e) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [config.rank]: { ...prev[config.rank], rewardType: e.target.value as LeaderboardConfig['rewardType'] },
                          }))
                        }
                        className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-sm text-secondary-850 focus:outline-none focus:border-secondary"
                      >
                        {REWARD_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-sans font-medium text-secondary-850/60 mb-1 block">Valeur</label>
                      <input
                        type="number"
                        min={0}
                        value={form.rewardValue ?? 0}
                        onChange={(e) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [config.rank]: { ...prev[config.rank], rewardValue: Number(e.target.value) },
                          }))
                        }
                        className="w-full h-10 px-3 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-sm text-secondary-850 focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <label className="flex items-center gap-2 cursor-pointer h-10">
                        <input
                          type="checkbox"
                          checked={form.isActive ?? true}
                          onChange={(e) =>
                            setEditForms((prev) => ({
                              ...prev,
                              [config.rank]: { ...prev[config.rank], isActive: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 accent-secondary"
                        />
                        <span className="text-sm font-sans text-secondary-850">Actif</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSave(config.rank)}
                      disabled={upserting}
                      className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors disabled:opacity-60"
                    >
                      {upserting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(config.rank)}
                      className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section Classement mensuel */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
        <h3 className="text-lg font-sans font-bold text-secondary-850 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-secondary" />
          Classement du mois en cours
        </h3>

        {loadingLeaderboard ? (
          <LoadingGrid />
        ) : !monthlyLeaderboard || monthlyLeaderboard.length === 0 ? (
          <EmptyState message="Aucun participant ce mois-ci" />
        ) : (
          <div className="overflow-hidden rounded-xl border-2 border-secondary/10">
            <table className="w-full text-sm font-sans">
              <thead className="bg-secondary/5">
                <tr>
                  <th className="text-left px-4 py-3 text-secondary-850/60 font-medium">Rang</th>
                  <th className="text-left px-4 py-3 text-secondary-850/60 font-medium">Utilisateur</th>
                  <th className="text-right px-4 py-3 text-secondary-850/60 font-medium">Points du mois</th>
                  <th className="text-right px-4 py-3 text-secondary-850/60 font-medium">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5">
                {monthlyLeaderboard.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={cn(
                      'bg-white/30',
                      entry.rank === 1 && 'bg-yellow-50',
                      entry.rank === 2 && 'bg-gray-50',
                      entry.rank === 3 && 'bg-orange-50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
                        entry.rank === 1 && 'bg-yellow-100 text-yellow-700',
                        entry.rank === 2 && 'bg-gray-200 text-gray-700',
                        entry.rank === 3 && 'bg-orange-100 text-orange-700',
                        entry.rank > 3 && 'bg-secondary/10 text-secondary-850'
                      )}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {entry.userAvatar ? (
                          <img src={entry.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                        <span className="font-sans font-medium text-secondary-850">
                          {entry.userName ?? 'Utilisateur anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-sans font-semibold text-secondary">
                      {entry.monthlyPoints.toLocaleString('fr-FR')} pts
                    </td>
                    <td className="px-4 py-3 text-right text-secondary-850/60">
                      {entry.badgeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section Distribution */}
      <div className="bg-card border-2 border-secondary/10 rounded-2xl p-6">
        <h3 className="text-lg font-sans font-bold text-secondary-850 flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-secondary" />
          Distribution des récompenses
        </h3>

        <div className="bg-white/30 border-2 border-secondary/10 rounded-xl p-4 mb-4">
          <p className="text-sm font-sans text-secondary-850/70 mb-2">Récompenses configurées pour ce mois :</p>
          <div className="flex flex-wrap gap-2">
            {(configs ?? []).filter((c) => c.isActive).map((config) => (
              <span
                key={config.rank}
                className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-sans font-semibold"
              >
                Top {config.rank} → {renderRewardLabel(config.rewardType, config.rewardValue)}
              </span>
            ))}
            {(configs ?? []).filter((c) => c.isActive).length === 0 && (
              <span className="text-sm text-secondary-850/40 font-sans">Aucune récompense active configurée</span>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDistribute}
          disabled={distributing || (configs ?? []).filter((c) => c.isActive).length === 0}
          className="h-12 px-6 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2 disabled:opacity-60"
        >
          {distributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          Distribuer les récompenses du mois
        </motion.button>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function FormActions({
  isMutating,
  editingItem,
  onClose,
}: {
  isMutating: boolean;
  editingItem: unknown;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="flex-1 h-12 bg-white/30 border-2 border-secondary/20 text-secondary-850 rounded-full font-sans font-semibold hover:border-secondary/40 transition-colors duration-200"
      >
        Annuler
      </motion.button>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isMutating}
        className="flex-1 h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {editingItem ? "Modifier" : "Créer"}
      </motion.button>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card border-2 border-secondary/10 rounded-2xl p-4 h-20 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-secondary-850/30">
      <Trophy className="w-12 h-12 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
