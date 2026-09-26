import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/session";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Not authenticated → redirect to login with returnUrl
  if (!session) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "/dashboard";
    redirect(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
  }

  // Account not active → redirect to login with reason
  if (session.user.status !== "ACTIVE") {
    redirect("/auth?reason=inactive");
  }

  return <>{children}</>;
}
