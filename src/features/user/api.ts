import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { userSchema, type User } from "@/features/auth/schemas";

/** Parse a user response, tolerating endpoints that return an empty body. */
function parseUser(body: unknown): User | null {
  if (body && typeof body === "object") return userSchema.parse(body);
  return null;
}

export async function updateProfile(
  id: string,
  patch: { firstName?: string; lastName?: string | null },
): Promise<User | null> {
  return parseUser(await apiFetch(`/users/${id}/profile`, { method: "PATCH", body: patch }));
}

export async function updateAvatar(
  id: string,
  patch: { avatarUrl: string | null; avatarKey: string | null },
): Promise<User | null> {
  return parseUser(await apiFetch(`/users/${id}/avatar`, { method: "PATCH", body: patch }));
}

/* ---- Account & security ---- */

const hasPasswordSchema = z.object({ hasPassword: z.boolean() });

export async function getHasPassword(id: string): Promise<boolean> {
  const body = await apiFetch(`/users/${id}/has-password`);
  return hasPasswordSchema.parse(body).hasPassword;
}

/** First-time password (passwordless account). */
export async function setPassword(userId: string, email: string, newPassword: string): Promise<void> {
  await apiFetch("/users/password", { method: "POST", body: { userId, email, newPassword } });
}

/** Change an existing password (verifies the old one server-side). */
export async function changePassword(
  userId: string,
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await apiFetch("/users/password", {
    method: "PUT",
    body: { userId, email, oldPassword, newPassword },
  });
}

/** Step 1 of email change — sends a 6-digit code to the new address. */
export async function requestEmailChange(id: string, newEmail: string): Promise<void> {
  await apiFetch(`/users/${id}/email`, { method: "POST", body: { newEmail } });
}

/** Step 2 — confirm the code; returns the updated user (new email). */
export async function confirmEmailChange(id: string, code: string): Promise<User | null> {
  return parseUser(await apiFetch(`/users/${id}/email/confirm`, { method: "POST", body: { code } }));
}

export async function deleteAccount(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}

export async function linkGoogle(payload: {
  email: string;
  googleId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<User | null> {
  return parseUser(await apiFetch("/users/link-google", { method: "POST", body: payload }));
}
