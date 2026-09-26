"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, logoutUser } from "@/lib/auth";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link href="/auth" className="text-sm font-medium hover:underline">
        Connexion
      </Link>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  const isAdminUser =
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN";

  const dashboardUrl = isAdminUser ? "/dashboard/admin" : "/dashboard/user";

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Déconnexion réussie");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardUrl} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Mon Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {isAdminUser && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/user/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mon Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
