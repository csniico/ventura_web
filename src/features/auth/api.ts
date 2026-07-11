/**
 * Auth datasource — pure transport against ventura-api's /auth + /users
 * password endpoints. Token persistence and session state live in the hooks
 * layer (store + mutations), keeping this module side-effect free and testable.
 */
import { apiFetch } from "@/lib/api/client";
import {
  authSessionSchema,
  messageSchema,
  userSchema,
  type AuthSession,
  type User,
} from "@/features/auth/schemas";

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const body = await apiFetch("/auth/sign-in-password", {
    method: "POST",
    body: { email, password },
  });
  return authSessionSchema.parse(body);
}

/** Passwordless: requests a 6-digit code. Auto-creates the account if new. */
export async function requestEmailCode(email: string): Promise<string> {
  const body = await apiFetch("/auth/sign-in-email", { method: "POST", body: { email } });
  return messageSchema.parse(body).message;
}

export async function verifyCode(email: string, code: string): Promise<AuthSession> {
  const body = await apiFetch("/auth/verify-code", { method: "POST", body: { email, code } });
  return authSessionSchema.parse(body);
}

export async function signInWithGoogle(idToken: string): Promise<AuthSession> {
  const body = await apiFetch("/auth/sign-in-google", { method: "POST", body: { idToken } });
  return authSessionSchema.parse(body);
}

export async function signInWithApple(payload: {
  identityToken: string;
  rawNonce: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthSession> {
  const body = {
    identityToken: payload.identityToken,
    rawNonce: payload.rawNonce,
    ...(payload.firstName ? { firstName: payload.firstName } : {}),
    ...(payload.lastName ? { lastName: payload.lastName } : {}),
  };
  return authSessionSchema.parse(await apiFetch("/auth/sign-in-apple", { method: "POST", body }));
}

export async function logout(): Promise<void> {
  // Best-effort server revoke; the caller always clears local tokens regardless.
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
}

/** Set a password on a passwordless account (used by the set-password flow). */
export async function createPassword(
  userId: string,
  email: string,
  newPassword: string,
): Promise<User> {
  const body = await apiFetch("/users/password", {
    method: "POST",
    body: { userId, email, newPassword },
  });
  return userSchema.parse(body);
}
