"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import {
  recordPaymentForm,
  PAYMENT_METHOD_LABELS,
  paymentMethod as paymentMethodEnum,
  type Invoice,
  type RecordPaymentForm,
} from "./schemas";
import { useRecordPayment } from "./hooks";

export function PaymentDialog({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}) {
  const record = useRecordPayment();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentForm>({
    resolver: zodResolver(recordPaymentForm),
    values: {
      amount: invoice?.balance ?? 0,
      paymentMethod: "CASH",
      paymentDate: "",
    },
  });

  if (!invoice) return null;

  const onSubmit = handleSubmit((form) => {
    record.mutate(
      { id: invoice.id, form },
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
      title="Record payment"
      description={`${invoice.invoiceNumber} · balance ${money(invoice.balance)}`}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Amount (GHS)" error={errors.amount?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              invalid={invalid}
              type="number"
              step="0.01"
              min="0"
              {...register("amount", { valueAsNumber: true })}
            />
          )}
        </Field>
        <Field label="Method" error={errors.paymentMethod?.message}>
          {({ id }) => (
            <Select id={id} {...register("paymentMethod")}>
              {paymentMethodEnum.options.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Date" hint="Defaults to today">
          {({ id }) => <Input id={id} type="date" {...register("paymentDate")} />}
        </Field>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={record.isPending}>
            Record payment
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
