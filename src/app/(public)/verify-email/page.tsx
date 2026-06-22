"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { FullPageSpinner } from "@/components/ui/misc";
import { useRequestEmailCode, useVerifyCode } from "@/features/auth/hooks";
import { postAuthDestination } from "@/features/auth/post-auth";
import { errorMessage } from "@/lib/api/message";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const isReset = params.get("intent") === "reset";

  const [code, setCode] = useState("");
  const verify = useVerifyCode();
  const resend = useRequestEmailCode();

  if (!email) {
    return (
      <AuthShell title="Check your email" subtitle="We need your email to verify the code.">
        <Button fullWidth size="lg" onClick={() => router.replace("/login")}>
          Back to sign in
        </Button>
      </AuthShell>
    );
  }

  const submit = (value: string) => {
    verify.mutate(
      { email, code: value },
      {
        onSuccess: (session) =>
          router.replace(isReset ? "/set-password" : postAuthDestination(session.user)),
        onError: (error) => {
          setCode("");
          toast.error(errorMessage(error, "That code didn't work. Try again."));
        },
      },
    );
  };

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${email}.`}
      footer={
        <button
          type="button"
          className="font-medium text-primary-600 hover:underline disabled:opacity-50"
          disabled={resend.isPending}
          onClick={() =>
            resend.mutate(email, {
              onSuccess: () => toast.success("A new code is on its way."),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }
        >
          {resend.isPending ? "Sending…" : "Resend code"}
        </button>
      }
    >
      <div className="space-y-6">
        <OtpInput value={code} onChange={setCode} onComplete={submit} invalid={verify.isError} disabled={verify.isPending} />
        <Button
          fullWidth
          size="lg"
          loading={verify.isPending}
          disabled={code.length < 6}
          onClick={() => submit(code)}
        >
          Verify and continue
        </Button>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="block w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
        >
          Use a different email
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
