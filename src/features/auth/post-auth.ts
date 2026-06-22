import type { User } from "@/features/auth/schemas";

/**
 * Where a freshly-authenticated user should land: the onboarding gate if they
 * have no business yet, otherwise the dashboard. Mirrors the mobile reference's
 * post-auth routing.
 */
export function postAuthDestination(user: User): "/onboarding" | "/dashboard" {
  return user.businessId ? "/dashboard" : "/onboarding";
}
