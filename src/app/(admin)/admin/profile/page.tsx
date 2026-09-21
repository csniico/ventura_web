"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/format";
import { useAuthStore } from "@/features/auth/store";
import { adminProfileForm, type AdminProfile, type AdminProfileForm } from "@/features/admin/schemas";
import { useClaimAdminProfile, useUpdateAdminProfileName } from "@/features/admin/hooks";

/**
 * This admin's record in the platform admin directory.
 *
 * The API has no "get my admin profile" route and no list — the only way to
 * reach a record by email is POST /admin/profile, which returns the existing
 * one when the email already exists. So the record is fetched on an explicit
 * save rather than on page load: creating a directory entry as a side effect
 * of merely opening a screen would be the wrong default.
 */
export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user);
  const claim = useClaimAdminProfile();

  // Populated by the claim mutation; nothing is requested on mount.
  const { data: profile } = useQuery<AdminProfile | undefined>({
    queryKey: queryKeys.admin.profile,
    enabled: false,
    initialData: undefined,
  });

  const update = useUpdateAdminProfileName(profile?.id ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProfileForm>({
    resolver: zodResolver(adminProfileForm),
    defaultValues: {
      name: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
      email: user?.email ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (profile) update.mutate(values.name);
    else claim.mutate(values);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin profile"
        subtitle="Your entry in the platform administrator directory."
      />

      <Card className="max-w-lg p-6">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Name" error={errors.name?.message}>
            {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("name")} />}
          </Field>

          <Field
            label="Email"
            error={errors.email?.message}
            hint={
              profile
                ? "Email identifies the directory record and can't be changed here."
                : "Use the email your administrator access is granted to."
            }
          >
            {({ id, invalid }) => (
              <Input
                id={id}
                type="email"
                invalid={invalid}
                readOnly={Boolean(profile)}
                {...register("email")}
              />
            )}
          </Field>

          {profile && (
            <dl className="space-y-1 border-t border-zinc-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Directory id</dt>
                <dd className="font-mono text-xs text-zinc-700">{profile.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Created</dt>
                <dd className="text-zinc-700">{formatDateTime(profile.createdAt)}</dd>
              </div>
            </dl>
          )}

          <Button type="submit" loading={claim.isPending || update.isPending}>
            {profile ? "Save changes" : "Save admin profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
