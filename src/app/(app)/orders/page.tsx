"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Check, X } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Skeleton,
  TableWrap,
  Th,
  Td,
  Pagination,
  IconButton,
  StatusPill,
} from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { useDebounced } from "@/lib/hooks";
import { money, formatDate } from "@/lib/format";
import { orderTone } from "@/lib/status";
import { cn } from "@/lib/cn";
import { useOrders, useUpdateOrderStatus } from "@/features/orders/hooks";
import type { OrderStatus } from "@/features/orders/schemas";
import { OrderCreateDialog } from "@/features/orders/order-create-dialog";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const [createOpen, setCreateOpen] = useState(false);

  const query = useOrders({ page, q: q || undefined, status: status === "all" ? undefined : status });
  const updateStatus = useUpdateOrderStatus();
  const orders = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Sales recorded for your customers."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New order
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                status === f.value ? "bg-primary-50 text-primary-700" : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:max-w-xs sm:flex-1">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search orders…"
          />
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : orders.length === 0 ? (
        <TableWrap>
          <tbody>
            <tr>
              <td>
                <EmptyState
                  icon={ShoppingCart}
                  title={q ? "No matches" : "No orders yet"}
                  description={q ? "Try a different search." : "Record your first sale to see it here."}
                  action={
                    !q && (
                      <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" /> New order
                      </Button>
                    )
                  }
                />
              </td>
            </tr>
          </tbody>
        </TableWrap>
      ) : (
        <>
          <div className={cn("transition-opacity", query.isFetching && "opacity-60")}>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th className="hidden sm:table-cell">Date</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/60">
                    <Td>
                      <p className="font-mono text-xs text-zinc-500">{o.orderNumber}</p>
                      <p className="text-xs text-zinc-400">{o.items.length} item{o.items.length === 1 ? "" : "s"}</p>
                    </Td>
                    <Td className="font-medium text-zinc-900">{o.customerName}</Td>
                    <Td className="hidden sm:table-cell text-zinc-500">{formatDate(o.createdAt)}</Td>
                    <Td>
                      <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
                    </Td>
                    <Td className="text-right font-medium text-zinc-900">{money(o.totalAmount)}</Td>
                    <Td className="text-right">
                      {o.status === "pending" ? (
                        <div className="inline-flex gap-1">
                          <IconButton
                            label="Mark completed"
                            onClick={() => updateStatus.mutate({ id: o.id, status: "completed" })}
                          >
                            <Check className="size-4" />
                          </IconButton>
                          <IconButton
                            label="Cancel order"
                            danger
                            onClick={() => updateStatus.mutate({ id: o.id, status: "cancelled" })}
                          >
                            <X className="size-4" />
                          </IconButton>
                        </div>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          {query.data && (
            <Pagination
              page={query.data.meta.page}
              totalPages={query.data.meta.totalPages}
              total={query.data.meta.total}
              onPage={setPage}
            />
          )}
        </>
      )}

      <OrderCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
