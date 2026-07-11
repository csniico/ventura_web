"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader, Skeleton } from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuthStore } from "@/features/auth/store";
import {
  useUpdateProfile,
  useUpdateAvatar,
  useHasPassword,
  useDeleteAccount,
} from "@/features/user/hooks";
import { PasswordDialog } from "@/features/user/password-dialog";
import { EmailChangeDialog } from "@/features/user/email-change-dialog";
import { LinkGoogleButton } from "@/features/user/link-google-button";

const profileForm = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
});
type ProfileForm = z.infer<typeof profileForm>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const hasPassword = useHasPassword();
  const deleteAccount = useDeleteAccount();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileForm),
    values: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" },
  });

  const onSubmit = handleSubmit((values) =>
    updateProfile.mutate({ firstName: values.firstName, lastName: values.lastName || null }),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" subtitle="Your details, security and account." />

      {/* Profile */}
      <Card className="space-y-6 p-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Photo</h2>
          <ImageUpload
            value={user?.avatarUrl}
            folder="avatars"
            shape="circle"
            label="Upload photo"
            onUploaded={(f) => updateAvatar.mutate({ avatarUrl: f.fileUrl, avatarKey: f.fileKey })}
            onRemove={() => updateAvatar.mutate({ avatarUrl: null, avatarKey: null })}
          />
        </div>

        <div className="h-px bg-zinc-100" />

        <form onSubmit={onSubmit} className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Name</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName?.message}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("firstName")} />}
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              {({ id }) => <Input id={id} {...register("lastName")} />}
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={updateProfile.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Security</h2>
        <div className="divide-y divide-zinc-100">
          <Row
            title="Password"
            description={
              hasPassword.data
                ? "Change the password you use to sign in."
                : "Add a password to sign in without an email code."
            }
            action={
              hasPassword.isLoading ? (
                <Skeleton className="h-9 w-28 rounded-lg" />
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
                  {hasPassword.data ? "Change" : "Set password"}
                </Button>
              )
            }
          />
          <Row
            title="Email"
            description={user?.email ?? ""}
            action={
              <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
                Change
              </Button>
            }
          />
        </div>
      </Card>

      {/* Linked accounts */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Linked accounts</h2>
        <Row
          title="Google"
          description="Link your Google account to sign in with one tap."
          action={<LinkGoogleButton />}
        />
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-700">Delete account</h2>
        <p className="mt-1 max-w-md text-sm text-zinc-500">
          Permanently delete your account and business data. You can reactivate within 90 days by
          signing back in.
        </p>
        <Button variant="destructive" size="sm" className="mt-4" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </Card>

      {hasPassword.data !== undefined && (
        <PasswordDialog
          open={passwordOpen}
          onClose={() => setPasswordOpen(false)}
          hasPassword={Boolean(hasPassword.data)}
        />
      )}
      <EmailChangeDialog open={emailOpen} onClose={() => setEmailOpen(false)} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteAccount.mutate()}
        title="Delete your account?"
        message="This deletes your account and business data. You can reactivate within 90 days by signing in again."
        confirmLabel="Delete account"
        loading={deleteAccount.isPending}
      />
    </div>
  );
}

function Row({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {description && <p className="truncate text-sm text-zinc-500">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
