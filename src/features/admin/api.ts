import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  adminProfileSchema,
  platformUserSchema,
  type AdminProfile,
  type AdminProfileForm,
  type PlatformUser,
} from "./schemas";

/** `/admin/users` returns a bare array — there is no pagination on it. */
export async function listPlatformUsers(): Promise<PlatformUser[]> {
  return z.array(platformUserSchema).parse(await apiFetch("/admin/users"));
}

export async function getPlatformUser(id: string): Promise<PlatformUser> {
  return platformUserSchema.parse(await apiFetch(`/admin/users/${id}`));
}

/** Soft-delete: sets `deleted`, and is undone by {@link restorePlatformUser}. */
export async function softDeletePlatformUser(id: string): Promise<PlatformUser> {
  return platformUserSchema.parse(await apiFetch(`/admin/users/${id}`, { method: "DELETE" }));
}

export async function restorePlatformUser(id: string): Promise<PlatformUser> {
  return platformUserSchema.parse(
    await apiFetch(`/admin/users/${id}/restore`, { method: "POST" }),
  );
}

/** Hard delete — the row is gone, and there is no restore. */
export async function hardDeletePlatformUser(id: string): Promise<PlatformUser> {
  return platformUserSchema.parse(
    await apiFetch(`/admin/users/${id}/permanent`, { method: "DELETE" }),
  );
}

/**
 * Probe for platform-admin privilege. The JWT carries only the user id and the
 * privilege is resolved server-side (a seeded `isSystem` account, or an email
 * in the backend's ADMIN_EMAILS allow-list), so there is nothing on the user
 * object to read — asking the API is the only reliable test.
 */
export async function isPlatformAdmin(): Promise<boolean> {
  try {
    await apiFetch("/admin/users");
    return true;
  } catch {
    return false;
  }
}

/**
 * Create-or-fetch this admin's directory record. The API has no "get my admin
 * profile" route and no list, so POST (which returns the existing record when
 * the email already exists) is the only way to reach it by email.
 */
export async function claimAdminProfile(form: AdminProfileForm): Promise<AdminProfile> {
  return adminProfileSchema.parse(
    await apiFetch("/admin/profile", { method: "POST", body: form }),
  );
}

export async function updateAdminProfileName(id: string, name: string): Promise<AdminProfile> {
  return adminProfileSchema.parse(
    await apiFetch(`/admin/profile/${id}`, { method: "PATCH", body: { name } }),
  );
}
