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
