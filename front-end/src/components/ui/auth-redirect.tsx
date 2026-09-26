"use client";

import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthRedirectProps {
  redirectTo: string;
}

export function AuthRedirect({ redirectTo }: AuthRedirectProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session) {
      router.push(redirectTo);
    }
  }, [session, router, redirectTo]);
  
  return null;
}
