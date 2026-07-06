"use client";

import { useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/data";
import { FileText } from "lucide-react";
import { money, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useOrders } from "@/features/orders/hooks";
import { useCreateInvoice } from "./hooks";
import { invoiceType as invoiceTypeEnum, type InvoiceType } from "./schemas";

export function InvoiceCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Only orders not already tied to an invoice can be billed.
  const orders = useOrders({ limit: 100 });
  const create = useCreateInvoice();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [type, setType] = useState<InvoiceType>("STANDARD");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const billable = (orders.data?.data ?? []).filter((o) => !o.invoiceId && o.status !== "cancelled");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (selected.size === 0) return setError("Select at least one order");
    create.mutate(
      {
        orderIds: [...selected],
        invoiceType: type,
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
      },
      {
        onSuccess: () => {
          setSelected(new Set());
          setDueDate("");
          setError(null);
          onClose();
        },
      },
    );
  }

  const total = billable
    .filter((o) => selected.has(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <Dialog open={open} onClose={onClose} title="New invoice" description="Bill one or more orders." size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            {({ id }) => (
              <Select id={id} value={type} onChange={(e) => setType(e.target.value as InvoiceType)}>
                {invoiceTypeEnum.options.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Due date" hint="Optional">
            {({ id }) => <Input id={id} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">Orders to bill</p>
          {orders.isLoading ? (
            <p className="py-6 text-center text-sm text-zinc-400">Loading orders…</p>
          ) : billable.length === 0 ? (
            <EmptyState icon={FileText} title="No billable orders" description="Create an order first, or all orders are already invoiced." />
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {billable.map((o) => {
                const checked = selected.has(o.id);
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                      checked ? "border-primary-500 bg-primary-50/50" : "border-zinc-200 hover:bg-zinc-50",
                    )}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="size-4 accent-primary-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800">{o.customerName}</p>
                      <p className="font-mono text-xs text-zinc-400">
                        {o.orderNumber} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">{money(o.totalAmount)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-sm text-zinc-500">Subtotal (before tax)</span>
          <span className="text-lg font-semibold text-zinc-900">{money(total)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} loading={create.isPending} disabled={billable.length === 0}>
          Create invoice
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
