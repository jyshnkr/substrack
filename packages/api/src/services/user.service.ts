import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

export interface UserData {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  supabaseId: string;
  email: string;
  name?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export class UserService {
  /**
   * Find a user by their internal UUID
   */
  static async getUserById(id: string): Promise<UserData | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!result) return null;

    return this.mapToUserData(result);
  }

  /**
   * Find a user by their Supabase Auth ID
   */
  static async getUserBySupabaseId(supabaseId: string): Promise<UserData | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseId),
    });

    if (!result) return null;

    return this.mapToUserData(result);
  }

  /**
   * Find or create a user from Supabase Auth data.
   * This is called on first authentication to sync the user record.
   */
  static async findOrCreateUser(input: CreateUserInput): Promise<UserData> {
    // Try to find existing user first
    const existing = await this.getUserBySupabaseId(input.supabaseId);
    if (existing) {
      return existing;
    }

    // Create new user
    const [result] = await db
      .insert(users)
      .values({
        supabaseId: input.supabaseId,
        email: input.email,
        name: input.name ?? null,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to create user");
    }

    return this.mapToUserData(result);
  }

  /**
   * Update user profile
   */
  static async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<UserData | null> {
    const [result] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!result) return null;

    return this.mapToUserData(result);
  }

  /**
   * Map database result to UserData interface
   */
  private static mapToUserData(
    user: typeof users.$inferSelect
  ): UserData {
    return {
      id: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
