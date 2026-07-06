import { env } from "@/lib/env";

/**
 * Sign in with Apple, web flow. Mirrors the mobile app:
 *  - generate a raw nonce, hand Apple its SHA-256 (as the token `nonce` claim)
 *  - send the RAW nonce to the backend so it can re-hash and verify
 *  - forward the name Apple returns on first authorization only
 */

export interface ApplePayload {
  identityToken: string;
  rawNonce: string;
  firstName?: string;
  lastName?: string;
}

interface AppleSignInResponse {
  authorization?: { id_token?: string; code?: string };
  user?: { name?: { firstName?: string; lastName?: string } };
}

interface AppleIdAuth {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    usePopup: boolean;
    nonce: string;
  }): void;
  signIn(): Promise<AppleSignInResponse>;
}

declare global {
  interface Window {
    AppleID?: { auth: AppleIdAuth };
  }
}

const SDK_URL =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.AppleID) return Promise.resolve();
  sdkPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load Apple sign-in."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

const NONCE_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._";

function generateNonce(length = 32): string {
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => NONCE_CHARSET[v % NONCE_CHARSET.length]).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const isAppleConfigured = () => Boolean(env.appleServiceId && env.appleRedirectUri);

/** Opens the Apple popup and returns the identity token + raw nonce (+ name). */
export async function signInWithApplePopup(): Promise<ApplePayload> {
  if (!isAppleConfigured()) throw new Error("Apple sign-in isn't configured.");
  await loadSdk();
  if (!window.AppleID) throw new Error("Apple sign-in unavailable.");

  const rawNonce = generateNonce();
  const hashedNonce = await sha256Hex(rawNonce);

  window.AppleID.auth.init({
    clientId: env.appleServiceId,
    scope: "name email",
    redirectURI: env.appleRedirectUri,
    usePopup: true,
    nonce: hashedNonce,
  });

  const res = await window.AppleID.auth.signIn();
  const identityToken = res.authorization?.id_token;
  if (!identityToken) throw new Error("Apple did not return an identity token.");

  return {
    identityToken,
    rawNonce,
    firstName: res.user?.name?.firstName,
    lastName: res.user?.name?.lastName,
  };
}
