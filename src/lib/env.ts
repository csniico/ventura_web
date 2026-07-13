/**
 * Public (browser-exposed) configuration. Only `NEXT_PUBLIC_*` vars are
 * available in the browser.
 *
 * Note the backend URL is intentionally NOT here: data requests go to the
 * same-origin proxy (`/api/backend`, see next.config.ts), so the real backend
 * URL stays server-side (`API_BASE_URL`) and never reaches the browser bundle.
 */
export const env = {
  // Google OAuth web client id (the audience the backend verifies the ID token
  // against — mobile calls this WEB_GOOGLE_CLIENT_ID).
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  // Sign in with Apple (web flow). Both are needed for Apple to be enabled.
  // The redirect URI must be the real, absolute backend callback registered
  // with Apple (a public, registered URL) — the Apple SDK requires an absolute
  // URL, so this one value stays client-visible by necessity.
  appleServiceId: process.env.NEXT_PUBLIC_APPLE_SERVICE_ID ?? "",
  appleRedirectUri: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI?.trim() ?? "",
};
