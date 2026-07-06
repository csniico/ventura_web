"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { PageHeader } from "@/components/ui/data";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { Field, Input } from "@/components/ui/field";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/message";
import { useMyBusiness, useUpdateBusiness, useCategories } from "@/features/business/hooks";
import { businessSettingsForm, type BusinessSettingsForm } from "@/features/business/schemas";

export default function SettingsPage() {
  const business = useMyBusiness();

  if (business.isLoading) return <FullPageSpinner />;

  if (!business.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business settings" />
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700">
            <Store className="size-6" />
          </span>
          <p className="max-w-sm text-sm text-zinc-500">
            You haven&apos;t created a business yet.
          </p>
          <Link href="/onboarding">
            <Button>Create your business</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <SettingsForm />;
}

function SettingsForm() {
  const business = useMyBusiness();
  const update = useUpdateBusiness();
  const categoriesQuery = useCategories();
  const b = business.data!;

  const [logo, setLogo] = useState<{ logo: string | null; logoKey: string | null }>({
    logo: b.logo ?? null,
    logoKey: b.logoKey ?? null,
  });
  const [categories, setCategories] = useState<string[]>(b.categories ?? []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BusinessSettingsForm>({
    resolver: zodResolver(businessSettingsForm),
    defaultValues: {
      name: b.name ?? "",
      tagLine: b.tagLine ?? "",
      description: b.description ?? "",
      email: b.email ?? "",
      phone: b.phone ?? "",
      website: b.website ?? "",
      address: b.address ?? "",
      city: b.city ?? "",
      state: b.state ?? "",
      country: b.country ?? "",
    },
  });

  // Keep the form in sync if the business refetches.
  useEffect(() => {
    reset({
      name: b.name ?? "",
      tagLine: b.tagLine ?? "",
      description: b.description ?? "",
      email: b.email ?? "",
      phone: b.phone ?? "",
      website: b.website ?? "",
      address: b.address ?? "",
      city: b.city ?? "",
      state: b.state ?? "",
      country: b.country ?? "",
    });
  }, [b, reset]);

  const suggested = categoriesQuery.data ?? [];
  const allChips = Array.from(new Set([...categories, ...suggested]));

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const onSubmit = handleSubmit((values) => {
    // Only send non-empty text fields (empty string would blank the field).
    const patch: Record<string, unknown> = { name: values.name, categories };
    for (const [key, val] of Object.entries(values)) {
      if (key !== "name" && typeof val === "string" && val.trim()) patch[key] = val.trim();
    }
    patch.logo = logo.logo;
    patch.logoKey = logo.logoKey;

    update.mutate(
      { id: b.id, patch },
      {
        onSuccess: () => toast.success("Business updated"),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PageHeader
        title="Business settings"
        subtitle="How your business appears on invoices and to customers."
        action={
          <Button type="submit" loading={update.isPending} disabled={!isDirty && !logoChanged(b, logo) && !categoriesChanged(b, categories)}>
            Save changes
          </Button>
        }
      />

      <Card className="space-y-6 p-6">
        <Section title="Logo">
          <ImageUpload
            value={logo.logo}
            folder="logos"
            shape="square"
            label="Upload logo"
            onUploaded={(f) => setLogo({ logo: f.fileUrl, logoKey: f.fileKey })}
            onRemove={() => setLogo({ logo: null, logoKey: null })}
          />
        </Section>

        <Divider />

        <Section title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" error={errors.name?.message}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("name")} />}
            </Field>
            <Field label="Tagline" error={errors.tagLine?.message}>
              {({ id }) => <Input id={id} placeholder="A short slogan" {...register("tagLine")} />}
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            {({ id }) => <Textarea id={id} placeholder="What your business does…" {...register("description")} />}
          </Field>
        </Section>

        <Divider />

        <Section title="Contact">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Email" error={errors.email?.message}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} type="email" {...register("email")} />}
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              {({ id }) => <Input id={id} {...register("phone")} />}
            </Field>
            <Field label="Website" error={errors.website?.message}>
              {({ id }) => <Input id={id} placeholder="https://" {...register("website")} />}
            </Field>
          </div>
        </Section>

        <Divider />

        <Section title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address" error={errors.address?.message}>
              {({ id }) => <Input id={id} {...register("address")} />}
            </Field>
            <Field label="City" error={errors.city?.message}>
              {({ id }) => <Input id={id} {...register("city")} />}
            </Field>
            <Field label="State / Region" error={errors.state?.message}>
              {({ id }) => <Input id={id} {...register("state")} />}
            </Field>
            <Field label="Country" error={errors.country?.message}>
              {({ id }) => <Input id={id} {...register("country")} />}
            </Field>
          </div>
        </Section>

        <Divider />

        <Section title="Categories">
          <div className="flex flex-wrap gap-2">
            {allChips.map((c) => {
              const active = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50",
                  )}
                >
                  {c}
                </button>
              );
            })}
            {allChips.length === 0 && <p className="text-sm text-zinc-400">No categories available.</p>}
          </div>
        </Section>
      </Card>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-zinc-100" />;
}

function logoChanged(b: { logo?: string | null }, logo: { logo: string | null }) {
  return (b.logo ?? null) !== logo.logo;
}
function categoriesChanged(b: { categories?: string[] }, cats: string[]) {
  const a = (b.categories ?? []).slice().sort().join(",");
  return a !== cats.slice().sort().join(",");
}
