"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { useCustomers } from "@/features/customers/hooks";
import { useResources } from "@/features/resources/hooks";
import { useCreateOrder, useUpdateOrder } from "./hooks";
import type { Order } from "./schemas";

interface Line {
  resourceId: string;
  quantity: number;
}

export function OrderCreateDialog({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
}) {
  const editing = Boolean(order);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit order" : "New order"}
      description={editing ? "Update the items on this order." : "Record a sale for a customer."}
      size="lg"
    >
      {/* Dialog unmounts children when closed, so this form re-initialises on each open. */}
      <OrderForm order={order} onDone={onClose} />
    </Dialog>
  );
}

function OrderForm({ order, onDone }: { order?: Order | null; onDone: () => void }) {
  const editing = Boolean(order);
  const customers = useCustomers({ limit: 100 });
  const resources = useResources({ limit: 100 });
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const mutation = editing ? update : create;

  const [customerId, setCustomerId] = useState(order?.customerId ?? "");
  const [lines, setLines] = useState<Line[]>(
    order ? order.items.map((it) => ({ resourceId: it.resourceId, quantity: it.quantity })) : [{ resourceId: "", quantity: 1 }],
  );
  const [error, setError] = useState<string | null>(null);

  const priceOf = useMemo(() => {
    const map = new Map((resources.data?.data ?? []).map((r) => [r.id, r.price]));
    return (id: string) => map.get(id) ?? 0;
  }, [resources.data]);

  const total = lines.reduce((sum, l) => sum + priceOf(l.resourceId) * l.quantity, 0);

  function submit() {
    const items = lines
      .filter((l) => l.resourceId && l.quantity > 0)
      .map((l) => ({ resourceId: l.resourceId, quantity: l.quantity }));
    if (!editing && !customerId) return setError("Select a customer");
    if (items.length === 0) return setError("Add at least one item");

    if (editing && order) {
      update.mutate({ id: order.id, items }, { onSuccess: onDone });
    } else {
      create.mutate({ customerId, items }, { onSuccess: onDone });
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Field label="Customer" error={error && !customerId ? error : undefined}>
          {({ id }) => (
            <Select id={id} value={customerId} disabled={editing} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {(customers.data?.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Items</p>
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <Select
                  value={line.resourceId}
                  onChange={(e) =>
                    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, resourceId: e.target.value } : l)))
                  }
                >
                  <option value="">Select item…</option>
                  {(resources.data?.data ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {money(r.price)}
                    </option>
                  ))}
                </Select>
              </div>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setLines((ls) =>
                    ls.map((l, j) => (j === i ? { ...l, quantity: Math.max(1, Number(e.target.value) || 1) } : l)),
                  )
                }
                className="h-11 w-20 rounded-xl border border-zinc-200 px-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))}
                aria-label="Remove item"
                className="grid size-11 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, { resourceId: "", quantity: 1 }])}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Plus className="size-4" /> Add item
          </button>
        </div>

        {error && (customerId || lines.some((l) => l.resourceId)) && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-sm text-zinc-500">Estimated total</span>
          <span className="text-lg font-semibold text-zinc-900">{money(total)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={submit} loading={mutation.isPending}>
          {editing ? "Save changes" : "Create order"}
        </Button>
      </DialogFooter>
    </>
  );
}
