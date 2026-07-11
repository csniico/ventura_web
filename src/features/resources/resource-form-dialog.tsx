"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { resourceForm, type Resource, type ResourceForm, type ResourceType } from "./schemas";
import { useCreateResource, useUpdateResource } from "./hooks";

export function ResourceFormDialog({
  open,
  onClose,
  resource,
  defaultType = "product",
}: {
  open: boolean;
  onClose: () => void;
  resource?: Resource | null;
  defaultType?: ResourceType;
}) {
  const editing = Boolean(resource);
  const create = useCreateResource();
  const update = useUpdateResource(resource?.id ?? "");
  const mutation = editing ? update : create;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceForm),
    defaultValues: {
      type: resource?.type ?? defaultType,
      name: resource?.name ?? "",
      price: resource?.price ?? 0,
      description: resource?.description ?? "",
      availableQuantity: resource?.availableQuantity ?? 0,
      lowStockThreshold: resource?.lowStockThreshold ?? 5,
      primaryImage: resource?.primaryImage ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const primaryImage = useWatch({ control, name: "primaryImage" });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, { onSuccess: onClose });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit item" : "New item"}
      description={editing ? undefined : "Add a product or service you sell."}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Type toggle (locked when editing — type is immutable server-side) */}
        <Field label="Type">
          {() => (
            <div className="grid grid-cols-2 gap-2">
              {(["product", "service"] as const).map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium capitalize text-zinc-600 transition-colors has-checked:border-primary-500 has-checked:bg-primary-50 has-checked:text-primary-700 has-disabled:opacity-50"
                >
                  <input
                    type="radio"
                    value={t}
                    disabled={editing}
                    className="sr-only"
                    {...register("type")}
                  />
                  {t}
                </label>
              ))}
            </div>
          )}
        </Field>

        <Field label="Image">
          {() => (
            <ImageUpload
              value={primaryImage || null}
              folder="products"
              shape="square"
              label="Upload image"
              onUploaded={(f) => {
                setValue("primaryImage", f.fileUrl, { shouldDirty: true });
                setValue("primaryImageKey", f.fileKey);
              }}
              onRemove={() => {
                setValue("primaryImage", "", { shouldDirty: true });
                setValue("primaryImageKey", "");
              }}
            />
          )}
        </Field>

        <Field label="Name" error={errors.name?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder={type === "service" ? "Consultation" : "T-shirt"} {...register("name")} />
          )}
        </Field>

        <Field label="Price (GHS)" error={errors.price?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              invalid={invalid}
              type="number"
              step="0.01"
              min="0"
              {...register("price", { valueAsNumber: true })}
            />
          )}
        </Field>

        {type === "product" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" error={errors.availableQuantity?.message}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="number"
                  min="0"
                  {...register("availableQuantity", { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Low stock at" error={errors.lowStockThreshold?.message} hint="Alert threshold">
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="number"
                  min="0"
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                />
              )}
            </Field>
          </div>
        )}

        <Field label="Description" error={errors.description?.message}>
          {({ id, invalid }) => (
            <Textarea id={id} invalid={invalid} placeholder="Optional details…" {...register("description")} />
          )}
        </Field>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {editing ? "Save changes" : "Add item"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
