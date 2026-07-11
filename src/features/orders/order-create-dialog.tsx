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
import { useCreateOrder } from "./hooks";

interface Line {
  resourceId: string;
  quantity: number;
}

export function OrderCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const customers = useCustomers({ limit: 100 });
  const resources = useResources({ limit: 100 });
  const create = useCreateOrder();

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ resourceId: "", quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);

  const priceOf = useMemo(() => {
    const map = new Map((resources.data?.data ?? []).map((r) => [r.id, r.price]));
    return (id: string) => map.get(id) ?? 0;
  }, [resources.data]);

  const total = lines.reduce((sum, l) => sum + priceOf(l.resourceId) * l.quantity, 0);

  function reset() {
    setCustomerId("");
    setLines([{ resourceId: "", quantity: 1 }]);
    setError(null);
  }

  function submit() {
    const items = lines
      .filter((l) => l.resourceId && l.quantity > 0)
      .map((l) => ({ resourceId: l.resourceId, quantity: l.quantity }));
    if (!customerId) return setError("Select a customer");
    if (items.length === 0) return setError("Add at least one item");
    create.mutate(
      { customerId, items },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="New order" description="Record a sale for a customer." size="lg">
      <div className="space-y-4">
        <Field label="Customer" error={error && !customerId ? error : undefined}>
          {({ id }) => (
            <Select id={id} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
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
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} loading={create.isPending}>
          Create order
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
