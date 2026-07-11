"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { StatusPill, Skeleton } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { money, formatDate, initials, tint } from "@/lib/format";
import { orderTone, invoiceTone, labelize } from "@/lib/status";
import { cn } from "@/lib/cn";
import { useCustomer, useDeleteCustomer } from "@/features/customers/hooks";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { useOrders } from "@/features/orders/hooks";
import { useInvoices } from "@/features/invoices/hooks";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const customer = useCustomer(id);
  const orders = useOrders({ customerId: id, limit: 50 });
  const invoices = useInvoices({ customerId: id, limit: 50 });
  const del = useDeleteCustomer();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (customer.isLoading) return <FullPageSpinner />;
  if (customer.isError || !customer.data) {
    return (
      <Card className="p-10 text-center text-sm text-zinc-500">
        Customer not found.{" "}
        <Link href="/customers" className="font-medium text-primary-600 hover:underline">
          Back to customers
        </Link>
      </Card>
    );
  }

  const c = customer.data;
  const orderList = orders.data?.data ?? [];
  const invoiceList = invoices.data?.data ?? [];
  const invoiced = invoiceList.reduce((s, i) => s + i.totalAmount, 0);
  const outstanding = invoiceList.reduce((s, i) => s + i.balance, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/customers")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" /> Customers
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={cn("grid size-14 place-items-center rounded-2xl text-lg font-semibold", tint(c.name))}>
            {initials(c.name)}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{c.name}</h1>
            <p className="text-sm text-zinc-400">Customer since {formatDate(c.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Orders" value={String(orderList.length)} />
        <Stat label="Invoices" value={String(invoiceList.length)} />
        <Stat label="Invoiced" value={money(invoiced)} />
        <Stat label="Outstanding" value={money(outstanding)} tone={outstanding > 0 ? "danger" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ListCard title="Orders" href="/orders" empty="No orders yet." loading={orders.isLoading}>
            {orderList.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-zinc-50/60">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-zinc-500">{o.orderNumber}</p>
                  <p className="text-xs text-zinc-400">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={orderTone(o.status)}>{o.status}</StatusPill>
                  <span className="text-sm font-semibold text-zinc-900">{money(o.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </ListCard>

          <ListCard title="Invoices" href="/invoices" empty="No invoices yet." loading={invoices.isLoading}>
            {invoiceList.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-zinc-50/60">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-zinc-500">{inv.invoiceNumber}</p>
                  <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={invoiceTone(inv.status)}>{labelize(inv.status)}</StatusPill>
                  <span className="text-sm font-semibold text-zinc-900">{money(inv.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </ListCard>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Contact</h2>
            <div className="space-y-2 text-sm text-zinc-600">
              {c.email ? (
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-zinc-400" /> {c.email}
                </p>
              ) : null}
              {c.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-zinc-400" /> {c.phone}
                </p>
              ) : null}
              {!c.email && !c.phone && <p className="text-zinc-400">No contact details.</p>}
            </div>
          </Card>
          {c.notes && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">Notes</h2>
              <p className="text-sm text-zinc-600">{c.notes}</p>
            </Card>
          )}
        </div>
      </div>

      <CustomerFormDialog open={editOpen} onClose={() => setEditOpen(false)} customer={c} />
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => del.mutate(c.id, { onSuccess: () => router.push("/customers") })}
        title="Delete customer"
        message={`Remove ${c.name}? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tracking-tight", tone === "danger" ? "text-red-600" : "text-zinc-900")}>
        {value}
      </p>
    </Card>
  );
}

function ListCard({
  title,
  href,
  empty,
  loading,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <Link href={href} className="text-xs font-medium text-primary-600 hover:underline">
          All {title.toLowerCase()}
        </Link>
      </div>
      {loading ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : hasChildren ? (
        <div className="divide-y divide-zinc-100">{children}</div>
      ) : (
        <p className="py-6 text-center text-sm text-zinc-400">{empty}</p>
      )}
    </Card>
  );
}
