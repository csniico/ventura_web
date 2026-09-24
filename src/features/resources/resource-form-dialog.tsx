"use client";

import { useId } from "react";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  DEFAULT_BASE_UNIT,
  resourceForm,
  type Resource,
  type ResourceForm,
  type ResourceType,
} from "./schemas";
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
      baseUnit: resource?.baseUnit ?? "",
      units: resource?.units ?? [],
      primaryImage: resource?.primaryImage ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const units = useFieldArray({ control, name: "units" });
  const baseUnit = useWatch({ control, name: "baseUnit" });
  const baseUnitLabel = (baseUnit || DEFAULT_BASE_UNIT).trim() + "s";
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

        <Field label="Name" required error={errors.name?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder={type === "service" ? "Consultation" : "T-shirt"} {...register("name")} />
          )}
        </Field>

        <Field label="Price (GHS)" required error={errors.price?.message}>
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
            <Field label="Quantity" required error={errors.availableQuantity?.message}>
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

        {type === "product" && (
          <>
            <Field
              label="Base unit"
              error={errors.baseUnit?.message}
              hint="What stock is counted in — e.g. piece, bottle, kg."
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  placeholder={DEFAULT_BASE_UNIT}
                  {...register("baseUnit")}
                />
              )}
            </Field>

            {/* Bulk units: each sells as `factor` base units at its own price,
                so a carton can be priced below 24 × the piece price. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-zinc-700">Bulk units</span>
                <button
                  type="button"
                  onClick={() => units.append({ name: "", factor: 1, price: 0 })}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                >
                  <Plus className="size-4" /> Add unit
                </button>
              </div>

              {units.fields.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Optional — add a carton, crate or pack to sell in bulk.
                </p>
              ) : (
                <ul className="space-y-3">
                  {units.fields.map((field, index) => {
                    const rowErrors = errors.units?.[index];
                    return (
                      <li key={field.id} className="flex items-start gap-2">
                        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                          <LabelledCell label="Unit name" className="col-span-2 sm:col-span-1">
                            {(id) => (
                              <Input
                                id={id}
                                placeholder="carton"
                                invalid={Boolean(rowErrors?.name)}
                                {...register(`units.${index}.name`)}
                              />
                            )}
                          </LabelledCell>
                          <LabelledCell
                            label={`How many ${baseUnitLabel}`}
                          >
                            {(id) => (
                              <Input
                                id={id}
                                type="number"
                                min="1"
                                step="1"
                                invalid={Boolean(rowErrors?.factor)}
                                {...register(`units.${index}.factor`, { valueAsNumber: true })}
                              />
                            )}
                          </LabelledCell>
                          <LabelledCell label="Price for one">
                            {(id) => (
                              <Input
                                id={id}
                                type="number"
                                min="0"
                                step="0.01"
                                invalid={Boolean(rowErrors?.price)}
                                {...register(`units.${index}.price`, { valueAsNumber: true })}
                              />
                            )}
                          </LabelledCell>

                          {/* Errors for this row only — a bad value three rows
                              down used to show a red border and no message. */}
                          {(rowErrors?.name || rowErrors?.factor || rowErrors?.price) && (
                            <p className="col-span-2 text-xs text-red-600 sm:col-span-3">
                              {rowErrors.name?.message ??
                                rowErrors.factor?.message ??
                                rowErrors.price?.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => units.remove(index)}
                          aria-label={`Remove unit ${index + 1}`}
                          className="mt-6 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        >
                          <X className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
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

/**
 * A compact labelled cell for the bulk-units grid. The units rows are a table
 * in spirit, so each column needs a visible heading — an aria-label alone left
 * you guessing what the two number fields meant.
 */
function LabelledCell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-zinc-500">
        {label}
      </label>
      {children(id)}
    </div>
  );
}
