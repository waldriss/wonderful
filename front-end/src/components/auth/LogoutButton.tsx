"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 rounded hover:bg-gray-100 ${className}`}
    >
      Déconnexion
    </button>
  );
}