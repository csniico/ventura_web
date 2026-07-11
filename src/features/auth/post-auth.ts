/**
 * Where a freshly-authenticated user should land. Always the dashboard — the
 * business gate in the app layout intercepts and shows onboarding if the user
 * has no business yet, so callers don't need to branch on it.
 */
export function postAuthDestination(): "/dashboard" {
  return "/dashboard";
}
