"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuthStore } from "@/features/auth/store";
import { useUpdateProfile, useUpdateAvatar } from "@/features/user/hooks";

const profileForm = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
});
type ProfileForm = z.infer<typeof profileForm>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();

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
      <PageHeader title="Your profile" subtitle="Your name and photo across Ventura." />

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
          <Field label="Email">
            {({ id }) => <Input id={id} value={user?.email ?? ""} disabled readOnly />}
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={updateProfile.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
