import { z } from "zod";

/**
 * A user as seen by the platform-admin console. Wider than the session's
 * `User`: it carries the lifecycle flags the console acts on (`deleted`,
 * `isActive`, `isSystem`), which the normal app never needs.
 */
export const platformUserSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    shortId: z.string().nullable().optional(),
    firstName: z.string().default(""),
    lastName: z.string().nullable().optional(),
    email: z.string(),
    avatarUrl: z.string().nullable().optional(),
    businessId: z.string().nullable().optional(),
    isSystem: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isEmailVerified: z.boolean().default(false),
    deleted: z.boolean().default(false),
    deletedAt: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
  })
  .transform((u) => ({
    id: (u._id ?? u.id ?? "") as string,
    shortId: u.shortId ?? null,
    name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    firstName: u.firstName,
    lastName: u.lastName ?? null,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
    businessId: u.businessId ?? null,
    isSystem: u.isSystem,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    deleted: u.deleted,
    deletedAt: u.deletedAt ?? null,
    createdAt: u.createdAt ?? null,
  }));

export type PlatformUser = z.infer<typeof platformUserSchema>;

/** A record in the platform's admin directory (separate from the users table). */
export const adminProfileSchema = z
  .object({
    id: z.string(),
    shortId: z.string().nullable().optional(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .transform((a) => ({
    id: a.id,
    shortId: a.shortId ?? null,
    name: a.name,
    email: a.email,
    createdAt: a.createdAt ?? null,
  }));

export type AdminProfile = z.infer<typeof adminProfileSchema>;

export const adminProfileForm = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
});
export type AdminProfileForm = z.infer<typeof adminProfileForm>;
