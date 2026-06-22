"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { useSignInGoogle } from "@/features/auth/hooks";
import { postAuthDestination } from "@/features/auth/post-auth";
import { errorMessage } from "@/lib/api/message";

/** Renders the Google credential button, wired to /auth/sign-in-google. */
export function GoogleButton() {
  const router = useRouter();
  const signIn = useSignInGoogle();

  if (!env.googleClientId) return null;

  return (
    <div className="flex justify-center">
      <GoogleLogin
        width="320"
        onSuccess={(cred) => {
          if (!cred.credential) return;
          signIn.mutate(cred.credential, {
            onSuccess: (session) => router.replace(postAuthDestination(session.user)),
            onError: (error) => toast.error(errorMessage(error)),
          });
        }}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
      />
    </div>
  );
}

/** Visual "or" divider used between credential options. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      <span className="h-px flex-1 bg-zinc-200" />
      or
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
