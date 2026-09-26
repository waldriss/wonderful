// This file can ONLY be imported in Server Components or Server Actions.
// DO NOT import this in Client Components ("use client").

import { headers } from "next/headers";
import type { SessionResponse } from "@/lib/api/auth/types";

// Server-side base URL (can be an internal URL in production)
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

// ================================
// GET SERVER SESSION
// ================================

/**
 * Retrieves the current session server-side (SSR/RSC).
 * Forwards the request cookie so better-auth can authenticate.
 */
export async function getServerSession(): Promise<SessionResponse | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data?.session || !data?.user) return null;

    return data as SessionResponse;
  } catch {
    return null;
  }
}

// ================================
// ROLE / STATUS HELPERS
// ================================

/**
 * Check if the user has a specific role.
 */
export function hasRole(
  session: SessionResponse | null,
  role: SessionResponse["user"]["role"]
): boolean {
  if (!session?.user) return false;
  return session.user.role === role;
}

/**
 * Returns true if the user is an admin (ADMIN or SUPER_ADMIN).
 */
export function isAdmin(session: SessionResponse | null): boolean {
  if (!session?.user) return false;
  return session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
}

/**
 * Returns true if the user account is active.
 */
export function isActiveUser(session: SessionResponse | null): boolean {
  if (!session?.user) return false;
  return session.user.status === "ACTIVE";
}
