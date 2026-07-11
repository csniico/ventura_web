"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { env } from "@/lib/env";
import { errorMessage } from "@/lib/api/message";
import { useLinkGoogle } from "./hooks";

interface GoogleClaims {
  sub?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/** Decode a Google ID token's payload (no verification needed client-side). */
function decodeIdToken(token: string): GoogleClaims | null {
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const bytes = Uint8Array.from(atob(b64 + pad), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as GoogleClaims;
  } catch {
    return null;
  }
}

export function LinkGoogleButton() {
  const link = useLinkGoogle();

  if (!env.googleClientId) {
    return <span className="text-sm text-zinc-400">Google sign-in isn&apos;t configured.</span>;
  }

  return (
    <GoogleLogin
      text="continue_with"
      onSuccess={(cred) => {
        const claims = cred.credential ? decodeIdToken(cred.credential) : null;
        if (!claims?.sub) {
          toast.error("Couldn't read your Google account.");
          return;
        }
        link.mutate({
          googleId: claims.sub,
          firstName: claims.given_name,
          lastName: claims.family_name,
          avatarUrl: claims.picture,
        });
      }}
      onError={() => toast.error(errorMessage(null, "Google linking failed."))}
    />
  );
}
