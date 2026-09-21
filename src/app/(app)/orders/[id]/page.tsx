"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, X, FileText, Pencil } from "lucide-react";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { StatusPill, Skeleton, TableWrap, Th, Td } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { money, formatDateTime } from "@/lib/format";
import { orderTone, orderNextStatuses } from "@/lib/status";
import { useOrder, useUpdateOrderStatus } from "@/features/orders/hooks";
import { OrderCreateDialog } from "@/features/orders/order-create-dialog";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const order = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [editOpen, setEditOpen] = useState(false);

  if (order.isLoading) return <FullPageSpinner />;
  if (order.isError || !order.data) {
    return (
      <Card className="p-10 text-center text-sm text-zinc-500">
        Order not found.{" "}
        <Link href="/orders" className="font-medium text-primary-600 hover:underline">
          Back to orders
        </Link>
      </Card>
    );
  }

  const o = order.data;
  // An order already on an invoice can't be cancelled — cancel the invoice
  // first, which detaches its orders. A completed order can only be cancelled.
  const nextStatuses = orderNextStatuses(o.status, Boolean(o.invoiceId));
  const canComplete = nextStatuses.includes("completed");
  const canCancel = nextStatuses.includes("cancelled");

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push("/orders")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="size-4" /> Orders
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-xl font-semibold tracking-tight text-zinc-900">
              {o.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{formatDateTime(o.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
            {o.status === "pending" && (
              <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> Edit
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                variant="secondary"
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: o.id, status: "completed" })}
              >
                <Check className="size-4" /> Complete
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateStatus.mutate({ id: o.id, status: "cancelled" })}
              >
                <X className="size-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Subtotal</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {o.items.map((it, i) => (
                  <tr key={i}>
                    <Td>
                      <p className="font-medium text-zinc-900">{it.name}</p>
                      <p className="text-xs capitalize text-zinc-400">{it.type}</p>
                    </Td>
                    <Td className="text-right text-zinc-600">{money(it.price)}</Td>
                    <Td className="text-right text-zinc-600">{it.quantity}</Td>
                    <Td className="text-right font-medium text-zinc-900">{money(it.subTotal)}</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200">
                  <Td className="font-semibold text-zinc-900" />
                  <Td />
                  <Td className="text-right text-sm text-zinc-500">Total</Td>
                  <Td className="text-right text-base font-semibold text-zinc-900">
                    {money(o.totalAmount)}
                  </Td>
                </tr>
              </tfoot>
            </TableWrap>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Customer</h2>
            <p className="mt-2 text-sm text-zinc-700">{o.customerName}</p>
            <Link
              href={`/customers/${o.customerId}`}
              className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline"
            >
              View customer
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Invoice</h2>
            {o.invoiceId ? (
              <Link href={`/invoices/${o.invoiceId}`}>
                <Button variant="secondary" size="sm" className="mt-2">
                  <FileText className="size-4" /> View invoice
                </Button>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                Not invoiced yet. Create one from the Invoices page.
              </p>
            )}
          </Card>
        </div>
      </div>

      {order.isFetching && <Skeleton className="h-1 w-full" />}

      <OrderCreateDialog open={editOpen} onClose={() => setEditOpen(false)} order={o} />
    </div>
  );
}
