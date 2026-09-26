"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Flame, 
  Lightbulb, 
  Heart, 
  Package, 
  User, 
  Clock,
  Trophy,
  Bell,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/api/users";
import { useUnreadCount } from "@/lib/api/notifications";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Accueil",
    href: "/dashboard/user",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Nutrition",
    href: "/dashboard/user/nutrition",
    icon: <Flame className="w-5 h-5" />,
  },
  {
    name: "Suggestions",
    href: "/dashboard/user/suggestions",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    name: "Favoris",
    href: "/dashboard/user/favorites",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    name: "Mon Abonnement",
    href: "/dashboard/user/subscription",
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: "Profil",
    href: "/dashboard/user/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Historique",
    href: "/dashboard/user/orders",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    name: "Récompenses",
    href: "/dashboard/user/rewards",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    name: "Notifications",
    href: "/dashboard/user/notifications",
    icon: <Bell className="w-5 h-5" />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: dashboard } = useDashboard();
  const { data: unreadCount } = useUnreadCount();
  const points = dashboard?.stats.totalPoints ?? null;

  const navItems = NAV_ITEMS.map((item) =>
    item.href === "/dashboard/user/notifications" && unreadCount
      ? { ...item, badge: unreadCount }
      : item
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-2 border-secondary/10 rounded-3xl h-full overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <h2 className="text-2xl font-sans font-bold text-secondary-850 mb-2">
          Dashboard
        </h2>
        <p className="text-sm text-secondary-850/60 font-sans">
          Gérez votre compte
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isDisabled = item.badge === "Bientôt";

          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              className={cn(
                "block",
                isDisabled && "pointer-events-none"
              )}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!isDisabled ? { x: 4 } : {}}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-secondary text-white shadow-md"
                    : isDisabled
                    ? "text-secondary-850/30 cursor-not-allowed"
                    : "text-secondary-850/70 hover:bg-secondary/10 hover:text-secondary"
                )}
              >
                <span className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                
                {item.badge && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-sans font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : typeof item.badge === "number"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-primary-300/30 text-secondary-850"
                  )}>
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded-r-full"
                  />
                )}

                {!isActive && !isDisabled && (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 m-3 bg-gradient-to-br from-primary-200/50 to-primary-300/30 rounded-2xl border-2 border-primary-300/30 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <span className="font-sans font-bold text-secondary-850">
            {points !== null ? `${points.toLocaleString()} points` : '— points'}
          </span>
        </div>
        <p className="text-xs text-secondary-850/60 font-sans">
          Vos points de fidélité 🎁
        </p>
        {points !== null && (
          <div className="mt-2 h-2 bg-secondary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
