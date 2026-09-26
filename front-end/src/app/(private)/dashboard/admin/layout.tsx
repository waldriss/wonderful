import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminRealtimeProvider from "@/components/admin/AdminRealtimeProvider";
import { getServerSession, isAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Dashboard | Wonderful",
  description: "Panneau d'administration Wonderful",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Guard: only ADMIN and SUPER_ADMIN may access
  if (!isAdmin(session)) {
    redirect("/dashboard/user");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-200 pt-32">
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Sidebar - avec padding uniquement pour la sidebar */}
        <div className="pl-6 py-6">
          <AdminSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <AdminRealtimeProvider>
              {children}
            </AdminRealtimeProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
