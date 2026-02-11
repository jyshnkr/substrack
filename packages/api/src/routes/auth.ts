import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, signupSchema } from "@substrack/shared";
import { supabase } from "../lib/supabase.js";
import { UserService } from "../services/user.service.js";
import { authMiddleware } from "../middleware/auth.js";

const auth = new Hono();

// Cookie settings
const COOKIE_NAME = "auth-token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

/**
 * POST /api/auth/signup
 * Create a new account with email and password
 */
auth.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { email, password, name } = c.req.valid("json");

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name ?? null,
        },
      },
    });

    if (authError) {
      return c.json(
        { success: false, error: authError.message },
        (authError.status as 400 | 401 | 403 | 404 | 500) ?? 400
      );
    }

    if (!authData.user) {
      return c.json(
        { success: false, error: "Failed to create user" },
        500
      );
    }

    // Sync user to our database
    const user = await UserService.findOrCreateUser({
      supabaseId: authData.user.id,
      email: authData.user.email ?? email,
      name: name ?? null,
    });

    // Get session for the token
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session ?? authData.session;
    const token = session?.access_token;
    const refreshToken = session?.refresh_token;

    if (token) {
      setCookie(c, COOKIE_NAME, token, COOKIE_OPTIONS);
    }

    return c.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            supabaseId: user.supabaseId,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token: token ?? "",
          refreshToken: refreshToken ?? "",
        },
      },
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return c.json(
      { success: false, error: "An unexpected error occurred" },
      500
    );
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return c.json(
        { success: false, error: authError.message },
        (authError.status as 400 | 401 | 403 | 404 | 500) ?? 400
      );
    }

    if (!authData.user) {
      return c.json(
        { success: false, error: "Invalid credentials" },
        401
      );
    }

    // Sync user to our database
    const user = await UserService.findOrCreateUser({
      supabaseId: authData.user.id,
      email: authData.user.email ?? email,
      name: authData.user.user_metadata?.name ?? null,
    });

    const token = authData.session.access_token;
    const refreshToken = authData.session.refresh_token;

    // Set HTTP-only cookie
    setCookie(c, COOKIE_NAME, token, COOKIE_OPTIONS);

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          supabaseId: user.supabaseId,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      { success: false, error: "An unexpected error occurred" },
      500
    );
  }
});

/**
 * POST /api/auth/logout
 * Clear auth cookie and sign out from Supabase
 */
auth.post("/logout", async (c) => {
  try {
    // Clear the cookie by setting maxAge to 0
    setCookie(c, COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });

    // Sign out from Supabase (this also invalidates the session on Supabase side)
    await supabase.auth.signOut();

    return c.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json(
      { success: false, error: "An unexpected error occurred" },
      500
    );
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
auth.get("/me", authMiddleware, async (c) => {
  const auth = c.get("auth")!;

  const user = await UserService.getUserById(auth.userId);

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  return c.json({
    success: true,
    data: { user },
  });
});

export { auth };
