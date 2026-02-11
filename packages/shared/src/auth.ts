import { z } from "zod";

// ─── Auth Input Schemas ───────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().max(100).optional(),
});

// ─── Auth Response Schemas ────────────────────────────────

export const authUserSchema = z.object({
  id: z.string(),
  supabaseId: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const authResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: authUserSchema,
    token: z.string(),
  }),
});

export const authErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

// ─── Types ────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;

// ─── Auth Context Types (Frontend) ────────────────────────

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}
