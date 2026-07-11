"use client";

import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { useSignInGoogle, useSignInApple } from "@/features/auth/hooks";
import { isAppleConfigured } from "@/features/auth/apple";
import { postAuthDestination } from "@/features/auth/post-auth";
import { errorMessage } from "@/lib/api/message";
import type { AuthSession } from "@/features/auth/schemas";
import { cn } from "@/lib/cn";

/** The real Apple brand mark (lucide's Apple icon is a generic fruit). */
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z" />
    </svg>
  );
}

/** Shared outlined social button (used for Apple + the unconfigured states). */
function SocialButton({
  icon,
  label,
  loading,
  onClick,
  dark,
}: {
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-70",
        dark
          ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {label}
    </button>
  );
}

export function SocialSignIn() {
  const router = useRouter();
  const google = useSignInGoogle();
  const apple = useSignInApple();

  const onSession = (session: AuthSession) => router.replace(postAuthDestination(session.user));

  return (
    <div className="space-y-3">
      {/* Google — official credential button yields an ID token */}
      {env.googleClientId ? (
        <div className="flex justify-center">
          <GoogleLogin
            width="360"
            text="continue_with"
            onSuccess={(cred) => {
              if (!cred.credential) return;
              google.mutate(cred.credential, {
                onSuccess: onSession,
                onError: (e) => toast.error(errorMessage(e)),
              });
            }}
            onError={() => toast.error("Google sign-in failed. Please try again.")}
          />
        </div>
      ) : (
        <SocialButton
          icon={<GoogleIcon />}
          label="Continue with Google"
          onClick={() => toast.info("Google sign-in isn't configured yet.")}
        />
      )}

      {/* Apple — web popup flow */}
      <SocialButton
        dark
        icon={<AppleLogo />}
        label="Continue with Apple"
        loading={apple.isPending}
        onClick={() => {
          if (!isAppleConfigured()) {
            toast.info("Apple sign-in isn't configured yet.");
            return;
          }
          apple.mutate(undefined, {
            onSuccess: onSession,
            onError: (e) => {
              // Popup closed / cancelled shouldn't read as a hard error.
              const msg = errorMessage(e);
              if (!/popup|closed|cancel/i.test(msg)) toast.error(msg);
            },
          });
        }}
      />
    </div>
  );
}

/** Visual "or" divider between social and email/password options. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      <span className="h-px flex-1 bg-zinc-200" />
      or
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
