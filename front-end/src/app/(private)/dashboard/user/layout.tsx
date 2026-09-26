import { Metadata } from "next";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UserRealtimeProvider from "@/components/dashboard/UserRealtimeProvider";
import PushNotificationsProvider from "@/components/notifications/PushNotificationsProvider";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard | Votre App Culinaire",
  description: "Gérez votre compte et vos repas",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session already validated by (private)/layout.tsx — used here to pass user info down
  await getServerSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-200 pt-32">
      <div className="flex h-[calc(100vh-8rem)]">
       <div className="pl-6 py-6">
          <DashboardSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <PushNotificationsProvider>
              <UserRealtimeProvider>
                {children}
              </UserRealtimeProvider>
            </PushNotificationsProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
