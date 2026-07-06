/**
 * Typed access to public runtime configuration.
 * Only `NEXT_PUBLIC_*` vars are available in the browser, which is where the
 * client-held bearer token model needs them.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\/+$/, ""); // strip trailing slashes for base URLs
}

const apiBaseUrl = required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);

export const env = {
  apiBaseUrl,

  // Google OAuth web client id (the audience the backend verifies the ID token
  // against — mobile calls this WEB_GOOGLE_CLIENT_ID).
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",

  // Sign in with Apple (web flow). Only the Services ID is configured here; the
  // redirect URI is derived from the API base URL (the backend's registered
  // /auth/apple/callback), so it isn't a separate secret to manage.
  appleServiceId: process.env.NEXT_PUBLIC_APPLE_SERVICE_ID ?? "",
  appleRedirectUri: `${apiBaseUrl}/auth/apple/callback`,
};
