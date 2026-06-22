"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FullPageSpinner } from "@/components/ui/misc";
import { useAuthStore } from "@/features/auth/store";
import { useSetPassword } from "@/features/auth/hooks";
import { setPasswordForm, type SetPasswordForm } from "@/features/auth/schemas";
import { postAuthDestination } from "@/features/auth/post-auth";
import { errorMessage } from "@/lib/api/message";

export default function SetPasswordPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const setPassword = useSetPassword();

  const form = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordForm),
    defaultValues: { password: "", confirm: "" },
  });

  // This page is only meaningful for an authenticated user mid-reset.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !user) return <FullPageSpinner />;

  const onSubmit = form.handleSubmit(({ password }) => {
    setPassword.mutate(
      { userId: user.id, email: user.email, newPassword: password },
      {
        onSuccess: () => {
          toast.success("Password updated.");
          router.replace(postAuthDestination(user));
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  });

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password of at least 12 characters.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="New password" error={form.formState.errors.password?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••••••"
              invalid={invalid}
              {...form.register("password")}
            />
          )}
        </Field>
        <Field label="Confirm password" error={form.formState.errors.confirm?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••••"
              invalid={invalid}
              {...form.register("confirm")}
            />
          )}
        </Field>
        <Button type="submit" size="lg" fullWidth loading={setPassword.isPending}>
          Save password
        </Button>
        <button
          type="button"
          onClick={() => router.replace(postAuthDestination(user))}
          className="block w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
        >
          Skip for now
        </button>
      </form>
    </AuthShell>
  );
}
