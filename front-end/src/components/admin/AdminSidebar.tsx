"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users,
  Package,
  CirclePlus,
  ShoppingCart,
  CreditCard,
  Trophy,
  MessageSquare,
  Megaphone,
  BarChart3,
  Settings,
  UserCog,
  ChevronRight,
  Shield,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Vue d'ensemble",
    href: "/dashboard/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Clients",
    href: "/dashboard/admin/customers",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Produits",
    href: "/dashboard/admin/products",
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: "Suppléments",
    href: "/dashboard/admin/supplements",
    icon: <CirclePlus className="w-5 h-5" />,
  },
  {
    name: "Commandes",
    href: "/dashboard/admin/orders",
    icon: <ShoppingCart className="w-5 h-5" />,
    badge: 5,
  },
  {
    name: "Abonnements",
    href: "/dashboard/admin/subscriptions",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: "Gamification",
    href: "/dashboard/admin/gamification",
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    name: "Avis",
    href: "/dashboard/admin/reviews",
    icon: <MessageSquare className="w-5 h-5" />,
    badge: 3,
  },
  {
    name: "Marketing",
    href: "/dashboard/admin/marketing",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    name: "Notifications",
    href: "/dashboard/admin/notifications",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    name: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: "Paramètres",
    href: "/dashboard/admin/settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    name: "Équipe",
    href: "/dashboard/admin/team",
    icon: <UserCog className="w-5 h-5" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name || user?.firstName || "Admin User";
  const userRoleLabel = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
  const initials = (userName || "Admin User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-2 border-secondary/10 rounded-3xl h-full overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-secondary-850">
              Admin
            </h2>
            <p className="text-xs text-secondary-850/60 font-sans">
              Wonderful Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans font-medium transition-all duration-200 relative group text-sm",
                  isActive
                    ? "bg-secondary text-white shadow-md"
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
                      : "bg-secondary/20 text-secondary"
                  )}>
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="adminActiveTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                  />
                )}

                {!isActive && (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Admin Info */}
      <div className="p-4 m-3 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl border-2 border-secondary/20 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-sans font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-secondary-850 text-sm truncate">
                {userName}
              </p>
              <p className="text-xs text-secondary-850/60 font-sans truncate">
                {userRoleLabel}
              </p>
            </div>
        </div>
      </div>
    </aside>
  );
}
