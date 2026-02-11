import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Context } from "hono";
import { UserService } from "../services/user.service.js";

// Validate SUPABASE_URL at module load
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

// Supabase JWKS URL for JWT verification
const SUPABASE_JWKS_URL = `${SUPABASE_URL}/.well-known/jwks.json`;

export interface AuthContext {
  userId: string;
  supabaseId: string;
  email: string;
}

// Cache the JWKS
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    const jwksUrl = new URL(SUPABASE_JWKS_URL);
    jwks = createRemoteJWKSet(jwksUrl);
  }
  return jwks;
}

/**
 * Extract JWT from request
 * Looks for token in:
 * 1. Cookie named "auth-token"
 * 2. Authorization header (Bearer token)
 */
function extractToken(c: Context): string | null {
  // Check cookie first (using Hono's getCookie)
  const cookieToken = getCookie(c, "auth-token");
  if (cookieToken) {
    return cookieToken;
  }

  // Check Authorization header
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Auth middleware that verifies Supabase JWT and syncs user to database
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const token = extractToken(c);

  if (!token) {
    return c.json({ success: false, error: "Unauthorized - No token provided" }, 401);
  }

  try {
    // Verify the JWT using Supabase's JWKS
    const { payload } = await jwtVerify(
      token,
      getJWKS(),
      {
        issuer: SUPABASE_URL,
        audience: "authenticated",
      }
    );

    // Extract user info from token
    const supabaseId = payload.sub;
    const email = payload.email as string | undefined;

    if (!supabaseId) {
      return c.json({ success: false, error: "Invalid token - No user ID" }, 401);
    }

    // Sync user to our database
    const user = await UserService.findOrCreateUser({
      supabaseId,
      email: email ?? "",
    });

    // Set auth context for downstream handlers
    c.set("auth", {
      userId: user.id,
      supabaseId,
      email: user.email,
    });

    await next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return c.json({ success: false, error: "Unauthorized - Invalid token" }, 401);
  }
});

/**
 * Optional auth middleware - doesn't require auth but sets context if present
 */
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  const token = extractToken(c);

  if (!token) {
    c.set("auth", null);
    await next();
    return;
  }

  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: SUPABASE_URL,
      audience: "authenticated",
    });

    const supabaseId = payload.sub;
    const email = payload.email as string | undefined;

    if (supabaseId) {
      const user = await UserService.findOrCreateUser({
        supabaseId,
        email: email ?? "",
      });

      c.set("auth", {
        userId: user.id,
        supabaseId,
        email: user.email,
      });
    } else {
      c.set("auth", null);
    }
  } catch {
    c.set("auth", null);
  }

  await next();
});

// Type augmentation for Hono context
declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext | null;
  }
}
