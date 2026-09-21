"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
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
    setValue,
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
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Direction">
          {(["add", "remove"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={direction === d}
              onClick={() => setValue("direction", d)}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium capitalize transition-colors",
                direction === d
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {d}
            </button>
          ))}
        </div>

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
