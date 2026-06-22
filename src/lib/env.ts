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

export const env = {
  apiBaseUrl: required(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
};
