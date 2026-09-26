import { createAuthClient } from "better-auth/react";
import { getBrowserQueryClient } from "@/components/providers";
import type { AuthSession, RegisterData, LoginData } from "@/lib/api/auth/types";

// Define base URL for backend API
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create and export Better Auth client for client components
export const authClient = createAuthClient({
  baseURL: `${NEXT_PUBLIC_API_URL}/api/auth`,
});

// Export useful authentication methods
export const { signIn, signOut, signUp } = authClient;

// ================================
// TYPED SESSION HOOK
// ================================

/**
 * Custom hook that wraps useSession with proper typing for extended user fields
 */
export function useSession() {
  const sessionResult = authClient.useSession();

  return {
    ...sessionResult,
    data: sessionResult.data as AuthSession | null,
  };
}

// ================================
// REGISTRATION FUNCTION
// ================================

/**
 * Register a new user account with extended fields (firstName, lastName, phone)
 */
export const registerUser = async (data: RegisterData) => {
  const { email, password, name, firstName, lastName, phone } = data;

  const result = await signUp.email({
    email,
    password,
    name,
    // Additional fields declared in better-auth backend config
    firstName: firstName || name.split(" ")[0],
    lastName: lastName || null,
    phone: phone || null,
  } as Parameters<typeof signUp.email>[0]);

  if (result.error) {
    const err = new Error(result.error.message || "Registration failed");
    (err as any).code = result.error.code;
    (err as any).status = result.error.status;
    throw err;
  }

  if (!result.data) {
    throw new Error("Registration failed - no data received");
  }

  return result;
};

// ================================
// LOGIN FUNCTION
// ================================

/**
 * Login with email and password
 */
export const loginUser = async (data: LoginData) => {
  const result = await signIn.email({
    email: data.email,
    password: data.password,
  });

  if (result.error) {
    const err = new Error(result.error.message || "Login failed");
    (err as any).code = result.error.code;
    (err as any).status = result.error.status;
    throw err;
  }

  if (!result.data) {
    throw new Error("Login failed - no data received");
  }

  return result;
};

// ================================
// LOGOUT FUNCTION
// ================================

/**
 * Clears TanStack Query cache then signs out
 */
export const logoutUser = async () => {
  getBrowserQueryClient()?.clear();
  await signOut();
};