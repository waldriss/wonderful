import { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Votre App Culinaire",
  description: "Votre tableau de bord personnalisé",
};

export default function PublicDashboardPage() {
  return <DashboardClient />;
}
