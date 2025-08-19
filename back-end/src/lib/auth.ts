import { betterAuth } from "better-auth";
import { z } from "zod";
import prisma from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { config } from "../config";

// Initialize Better Auth
export const auth = betterAuth({
  // Application name displayed in emails and UI
  appName: "NextJS Express App",
  
  // Connect to database using Prisma adapter
  database: prismaAdapter(prisma, {provider:"postgresql"}),
  
  // Base URL for auth operations
  baseURL: config.auth.baseURL,
  
  // API path for auth endpoints
  basePath: "/api/auth",
  
  // Secret used to encrypt cookies and tokens
  secret: config.auth.secret,
  
  // List of allowed origins for CORS
  trustedOrigins: [config.auth.corsOrigin],
  
  emailAndPassword: {  
    enabled: true
  },
  
  // Session configuration
  session: {
    // How long sessions last
    expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    
    // Allow multiple sessions per user
    multiSession: true,
  },
  
  // Configure authentication providers
  providers: [
    // Email and password authentication
    {
      type: "credentials",
      credentialsSchema: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
    
    // Google OAuth authentication (if credentials are provided)
    ...(config.auth.googleClientId && config.auth.googleClientSecret
      ? [
          {
            type: "oauth",
            id: "google",
            clientId: config.auth.googleClientId,
            clientSecret: config.auth.googleClientSecret,
            wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
            authorization: { params: { scope: "openid email profile" } },
            userinfo: {
              async request(context: { tokens: { profile: () => any } }) {
                // Return profile from token data
                return context.tokens.profile();
              },
            },
            profile(profile: { sub: string; name: string; email: string; picture: string }) {
              // Map Google profile to user data
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
              };
            },
          },
        ]
      : []),
  ],
});

// Export type for authenticated user
export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};