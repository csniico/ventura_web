"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useSavePassword } from "./hooks";

function schemaFor(hasPassword: boolean) {
  return z
    .object({
      oldPassword: z.string().optional(),
      newPassword: z.string().min(12, "Use at least 12 characters"),
      confirm: z.string(),
    })
    .refine((v) => v.newPassword === v.confirm, {
      message: "Passwords do not match",
      path: ["confirm"],
    })
    .refine((v) => !hasPassword || Boolean(v.oldPassword), {
      message: "Enter your current password",
      path: ["oldPassword"],
    });
}

type Form = z.infer<ReturnType<typeof schemaFor>>;

export function PasswordDialog({
  open,
  onClose,
  hasPassword,
}: {
  open: boolean;
  onClose: () => void;
  hasPassword: boolean;
}) {
  const save = useSavePassword(hasPassword);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schemaFor(hasPassword)),
    defaultValues: { oldPassword: "", newPassword: "", confirm: "" },
  });

  const onSubmit = handleSubmit((form) => {
    save.mutate(
      { oldPassword: form.oldPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={hasPassword ? "Change password" : "Set a password"}
      description={
        hasPassword ? undefined : "Add a password so you can sign in without an email code."
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {hasPassword && (
          <Field label="Current password" error={errors.oldPassword?.message}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} type="password" autoComplete="current-password" {...register("oldPassword")} />
            )}
          </Field>
        )}
        <Field label="New password" error={errors.newPassword?.message} hint="At least 12 characters">
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} type="password" autoComplete="new-password" {...register("newPassword")} />
          )}
        </Field>
        <Field label="Confirm new password" error={errors.confirm?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} type="password" autoComplete="new-password" {...register("confirm")} />
          )}
        </Field>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {hasPassword ? "Change password" : "Set password"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
