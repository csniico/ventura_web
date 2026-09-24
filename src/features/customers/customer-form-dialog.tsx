"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { customerForm, type Customer, type CustomerForm } from "./schemas";
import { useCreateCustomer, useUpdateCustomer } from "./hooks";
import { errorMessage } from "@/lib/api/message";
import { useDebounced } from "@/lib/hooks";

export function CustomerFormDialog({
  open,
  onClose,
  customer,
  existingNames,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
  /** Known customer names — enables a soft "name already exists" hint on create. */
  existingNames?: string[];
}) {
  const editing = Boolean(customer);
  const create = useCreateCustomer();
  const update = useUpdateCustomer(customer?.id ?? "");
  const mutation = editing ? update : create;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerForm),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      notes: customer?.notes ?? "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: onClose,
      onError: (e) => {
        // Surface a duplicate-email conflict (409) inline on the field.
        const msg = errorMessage(e);
        if (/e-?mail/i.test(msg) && /exist|already|taken|in use|conflict/i.test(msg)) {
          setError("email", { message: msg });
        }
      },
    });
  });

  const nameValue = useWatch({ control, name: "name" });
  const debouncedName = useDebounced(nameValue ?? "", 300);
  const dupName =
    !editing &&
    debouncedName.trim().length > 1 &&
    (existingNames ?? []).some(
      (n) => n.trim().toLowerCase() === debouncedName.trim().toLowerCase(),
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit customer" : "New customer"}
      description={editing ? undefined : "Add someone you do business with."}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Name" required error={errors.name?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder="Jane Doe" {...register("name")} />
          )}
        </Field>
        {dupName && (
          <p className="-mt-2 text-xs text-amber-600">
            A customer named “{debouncedName.trim()}” already exists — add an email to tell them apart.
          </p>
        )}
        <Field label="Email" error={errors.email?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} type="email" placeholder="jane@example.com" {...register("email")} />
          )}
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder="+233 …" {...register("phone")} />
          )}
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          {({ id, invalid }) => (
            <Textarea id={id} invalid={invalid} placeholder="Anything worth remembering…" {...register("notes")} />
          )}
        </Field>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {editing ? "Save changes" : "Add customer"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
