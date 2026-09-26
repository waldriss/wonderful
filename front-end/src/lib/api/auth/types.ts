// ================================
// AUTH TYPES
// ================================

export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthSession {
  user: User;
  session: Session;
}

// ================================
// SERVER-SIDE TYPES
// ================================

export interface ServerUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionResponse {
  user: ServerUser;
  session: ServerSession;
}

// ================================
// REQUEST DATA TYPES
// ================================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
