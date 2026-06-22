"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { useMyBusiness, useCategories, useCreateBusiness } from "@/features/business/hooks";
import { onboardingNameForm, type OnboardingNameForm } from "@/features/business/schemas";
import { useAuthStore } from "@/features/auth/store";
import { errorMessage } from "@/lib/api/message";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const myBusiness = useMyBusiness();
  const categories = useCategories();
  const create = useCreateBusiness();

  const [selected, setSelected] = useState<string[]>([]);
  const form = useForm<OnboardingNameForm>({
    resolver: zodResolver(onboardingNameForm),
    defaultValues: { name: "" },
  });

  // Already onboarded → straight to the dashboard.
  useEffect(() => {
    if (myBusiness.data) router.replace("/dashboard");
  }, [myBusiness.data, router]);

  if (myBusiness.isLoading) return <FullPageSpinner />;

  const toggle = (category: string) =>
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );

  const onSubmit = form.handleSubmit(({ name }) => {
    create.mutate(
      { name, categories: selected },
      {
        onSuccess: () => {
          toast.success("Your business is ready.");
          router.replace("/dashboard");
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  });

  return (
    <div className="mx-auto max-w-lg py-6">
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
  );
}
