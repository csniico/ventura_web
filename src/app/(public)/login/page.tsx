"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialSignIn, OrDivider } from "@/components/auth/social-sign-in";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  emailForm,
  passwordSignInForm,
  type EmailForm,
  type PasswordSignInForm,
} from "@/features/auth/schemas";
import { useRequestEmailCode, useSignInPassword } from "@/features/auth/hooks";
import { postAuthDestination } from "@/features/auth/post-auth";
import { errorMessage } from "@/lib/api/message";

type Mode = "email" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("email");

  return (
    <AuthShell
      title={mode === "email" ? "Sign in to Ventura" : "Sign in with password"}
      subtitle={
        mode === "email"
          ? "Continue with a provider, or get a secure code by email."
          : "Use the password you set up for your account."
      }
      footer={<span>New to Ventura? Just enter your email — we&apos;ll set you up.</span>}
    >
      <div className="space-y-6">
        {/* Social providers first, mirroring the mobile app's ordering */}
        <SocialSignIn />
        <OrDivider />

        {mode === "email" ? (
          <EmailMode onUsePassword={() => setMode("password")} />
        ) : (
          <PasswordMode onUseEmail={() => setMode("email")} />
        )}
      </div>
    </AuthShell>
  );
}

function EmailMode({ onUsePassword }: { onUsePassword: () => void }) {
  const router = useRouter();
  const requestCode = useRequestEmailCode();
  const form = useForm<EmailForm>({ resolver: zodResolver(emailForm), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit(({ email }) => {
    requestCode.mutate(email, {
      onSuccess: () => router.push(`/verify-email?email=${encodeURIComponent(email)}`),
      onError: (error) => toast.error(errorMessage(error)),
    });
  });

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email address" error={form.formState.errors.email?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              invalid={invalid}
              {...form.register("email")}
            />
          )}
        </Field>
        <Button type="submit" size="lg" fullWidth loading={requestCode.isPending}>
          <Mail className="size-4" /> Continue with email
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Have a password?{" "}
        <button type="button" onClick={onUsePassword} className="font-medium text-primary-600 hover:underline">
          Sign in with password
        </button>
      </p>
    </div>
  );
}

function PasswordMode({ onUseEmail }: { onUseEmail: () => void }) {
  const router = useRouter();
  const signIn = useSignInPassword();
  const requestCode = useRequestEmailCode();
  const form = useForm<PasswordSignInForm>({
    resolver: zodResolver(passwordSignInForm),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(({ email, password }) => {
    signIn.mutate(
      { email, password },
      {
        onSuccess: (session) => router.replace(postAuthDestination(session.user)),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  });

  const onForgot = () => {
    const email = form.getValues("email").trim();
    if (!email) {
      form.setError("email", { message: "Enter your email first" });
      return;
    }
    requestCode.mutate(email, {
      onSuccess: () => router.push(`/verify-email?email=${encodeURIComponent(email)}&intent=reset`),
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email address" error={form.formState.errors.email?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              invalid={invalid}
              {...form.register("email")}
            />
          )}
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              invalid={invalid}
              {...form.register("password")}
            />
          )}
        </Field>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-sm font-medium text-primary-600 hover:underline disabled:opacity-50"
            disabled={requestCode.isPending}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" size="lg" fullWidth loading={signIn.isPending}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        <button type="button" onClick={onUseEmail} className="font-medium text-primary-600 hover:underline">
          Use a one-time email code instead
        </button>
      </p>
    </div>
  );
}
