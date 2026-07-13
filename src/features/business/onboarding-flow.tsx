"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { useCategories, useCreateBusiness } from "@/features/business/hooks";
import { onboardingNameForm, type OnboardingNameForm } from "@/features/business/schemas";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/hooks";
import { errorMessage } from "@/lib/api/message";

/**
 * Full-screen onboarding shown by the business gate until the user creates a
 * business. On success the business query updates and the gate swaps in the app
 * — no manual navigation needed. Business-scoped screens are never reachable
 * before this completes (they 403 on the API).
 */
export function OnboardingFlow() {
  const user = useAuthStore((s) => s.user);
  const categories = useCategories();
  const create = useCreateBusiness();
  const logout = useLogout();

  const [selected, setSelected] = useState<string[]>([]);
  const form = useForm<OnboardingNameForm>({
    resolver: zodResolver(onboardingNameForm),
    defaultValues: { name: "" },
  });

  const toggle = (category: string) =>
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );

  const onSubmit = form.handleSubmit(({ name }) => {
    create.mutate(
      { name, categories: selected },
      {
        onSuccess: () => toast.success("Your business is ready."),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  });

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-sm font-bold text-white">
            V
          </span>
          Ventura
        </span>
        <button
          onClick={() => logout.mutate()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </header>

      <div className="mx-auto max-w-lg px-5 py-8 sm:py-12">
        <div className="mb-8 space-y-2 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700">
            <Store className="size-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-zinc-500">
            Let&apos;s set up your business so you can start managing customers, orders and invoices.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <Field label="Business name" error={form.formState.errors.name?.message}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  autoFocus
                  placeholder="e.g. Acme Studio"
                  invalid={invalid}
                  {...form.register("name")}
                />
              )}
            </Field>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-zinc-700">
                What do you do? <span className="font-normal text-zinc-400">(optional)</span>
              </span>
              {categories.isLoading ? (
                <p className="text-sm text-zinc-400">Loading suggestions…</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(categories.data ?? []).map((category) => {
                    const active = selected.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggle(category)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary-600 bg-primary-50 text-primary-700"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                        )}
                      >
                        {active && <Check className="size-3.5" />}
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button type="submit" size="lg" fullWidth loading={create.isPending}>
              Create business
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
