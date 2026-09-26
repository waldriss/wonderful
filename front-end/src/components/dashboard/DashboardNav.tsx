"use client";

import type { User } from "@/lib/api/auth/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface DashboardNavProps {
  user?: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <Home className="w-4 h-4" />
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <UserCircle className="w-4 h-4" />
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 h-full w-64 bg-sidebar border-r border-sidebar-border hidden md:block">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Dashboard</h2>
          {user?.name && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {user.name}
            </p>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
