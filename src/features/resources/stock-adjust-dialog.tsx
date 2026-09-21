"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import {
  manualReasons,
  reasonLabels,
  stockAdjustmentForm,
  type Resource,
  type StockAdjustmentForm,
} from "./schemas";
import { useAdjustStock } from "./hooks";

/**
 * Record a manual movement on a product's stock ledger. The API takes a signed
 * delta; the form splits that into a direction + magnitude, which reads better
 * and lets us block removing more than is on hand before the round-trip.
 */
export function StockAdjustDialog({
  open,
  onClose,
  resource,
}: {
  open: boolean;
  onClose: () => void;
  resource: Resource;
}) {
  const adjust = useAdjustStock(resource.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StockAdjustmentForm>({
    resolver: zodResolver(stockAdjustmentForm),
    defaultValues: { direction: "add", quantity: 1, reason: "restock", note: "" },
  });

  const direction = useWatch({ control, name: "direction" });
  const quantity = useWatch({ control, name: "quantity" });

  const removingTooMuch =
    direction === "remove" && Number(quantity) > resource.availableQuantity;
  const balanceAfter =
    resource.availableQuantity + (direction === "remove" ? -1 : 1) * (Number(quantity) || 0);

  const onSubmit = handleSubmit((values) => {
    if (removingTooMuch) return;
    adjust.mutate(values, { onSuccess: onClose });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Adjust stock"
      description={`${resource.name} — ${resource.availableQuantity} on hand`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Same sr-only radio + has-checked pattern as the resource form's
            type toggle, so the two read identically. */}
        <Field label="Direction">
          {() => (
            <div className="grid grid-cols-2 gap-2">
              {(["add", "remove"] as const).map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium capitalize text-zinc-600 transition-colors has-checked:border-primary-500 has-checked:bg-primary-50 has-checked:text-primary-700"
                >
                  <input type="radio" value={d} className="sr-only" {...register("direction")} />
                  {d}
                </label>
              ))}
            </div>
          )}
        </Field>

        <Field
          label="Quantity"
          error={errors.quantity?.message ?? (removingTooMuch ? "More than is on hand" : undefined)}
          hint={
            removingTooMuch ? undefined : `New balance: ${balanceAfter}`
          }
        >
          {({ id, invalid }) => (
            <Input
              id={id}
              type="number"
              min={1}
              step={1}
              invalid={invalid}
              {...register("quantity", { valueAsNumber: true })}
            />
          )}
        </Field>

        <Field label="Reason" error={errors.reason?.message}>
          {({ id, invalid }) => (
            <Select id={id} invalid={invalid} {...register("reason")}>
              {manualReasons.map((r) => (
                <option key={r} value={r}>
                  {reasonLabels[r]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Note" error={errors.note?.message} hint="Optional — e.g. shipment reference.">
          {({ id, invalid }) => (
            <Textarea id={id} rows={2} invalid={invalid} {...register("note")} />
          )}
        </Field>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={adjust.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={adjust.isPending} disabled={removingTooMuch}>
            Record
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
