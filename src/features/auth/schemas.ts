import { z } from "zod";

/**
 * The user object returned in every auth response. The API uses Mongo `_id`;
 * we normalize to `id` (the mobile reference reads `_id ?? id`).
 */
export const userSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    shortId: z.string().optional(),
    firstName: z.string().default(""),
    lastName: z.string().nullable().optional(),
    email: z.string(),
    avatarUrl: z.string().nullable().optional(),
    avatarKey: z.string().nullable().optional(),
    businessId: z.string().nullable().optional(),
    isEmailVerified: z.boolean().default(false),
  })
  .transform((u) => ({
    id: (u._id ?? u.id ?? "") as string,
    shortId: u.shortId ?? null,
    firstName: u.firstName,
    lastName: u.lastName ?? null,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
    avatarKey: u.avatarKey ?? null,
    businessId: u.businessId ?? null,
    isEmailVerified: u.isEmailVerified,
  }));

export type User = z.infer<typeof userSchema>;

export const authSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const messageSchema = z.object({ message: z.string() });

// ---- Form schemas (shared by RHF + inferred types) ----

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const emailForm = z.object({ email: emailSchema });
export type EmailForm = z.infer<typeof emailForm>;

export const passwordSignInForm = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type PasswordSignInForm = z.infer<typeof passwordSignInForm>;

export const setPasswordForm = z
  .object({
    password: z.string().min(12, "Use at least 12 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type SetPasswordForm = z.infer<typeof setPasswordForm>;
