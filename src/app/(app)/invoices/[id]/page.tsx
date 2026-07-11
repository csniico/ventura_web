"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Send, CreditCard } from "lucide-react";
import { Card, FullPageSpinner, Spinner } from "@/components/ui/misc";
import { StatusPill } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { money, formatDate } from "@/lib/format";
import { invoiceTone, labelize } from "@/lib/status";
import { useInvoice, useSendInvoice, useUpdateInvoiceStatus } from "@/features/invoices/hooks";
import { useOrdersByIds } from "@/features/orders/hooks";
import { useMyBusiness } from "@/features/business/hooks";
import { invoiceStatus, type InvoiceStatus } from "@/features/invoices/schemas";
import { PaymentDialog } from "@/features/invoices/payment-dialog";
import { InvoiceDocument } from "@/features/invoices/invoice-document";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const invoice = useInvoice(id);
  const orders = useOrdersByIds(invoice.data?.orderIds ?? []);
  const business = useMyBusiness();
  const send = useSendInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const [payOpen, setPayOpen] = useState(false);

  const items = useMemo(() => (orders.data ?? []).flatMap((o) => o.items), [orders.data]);

  if (invoice.isLoading) return <FullPageSpinner />;
  if (invoice.isError || !invoice.data) {
    return (
      <Card className="p-10 text-center text-sm text-zinc-500">
        Invoice not found.{" "}
        <Link href="/invoices" className="font-medium text-primary-600 hover:underline">
          Back to invoices
        </Link>
      </Card>
    );
  }

  const i = invoice.data;
  const isOpen = i.status !== "PAID" && i.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      {/* Actions bar — excluded from print */}
      <div className="no-print space-y-4">
        <button
          onClick={() => router.push("/invoices")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="size-4" /> Invoices
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-xl font-semibold tracking-tight text-zinc-900">
                #{i.invoiceNumber}
              </h1>
              <StatusPill tone={invoiceTone(i.status)}>{labelize(i.status)}</StatusPill>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{formatDate(i.createdAt)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Download className="size-4" /> Download / Print
            </Button>
            {i.status !== "CANCELLED" && (
              <Button
                variant="secondary"
                size="sm"
                loading={send.isPending}
                onClick={() => send.mutate(i.id)}
              >
                <Send className="size-4" /> {i.status === "DRAFT" ? "Send" : "Resend"}
              </Button>
            )}
            {isOpen && i.balance > 0 && (
              <Button size="sm" onClick={() => setPayOpen(true)}>
                <CreditCard className="size-4" /> Record payment
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="no-print grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Items</h2>
            {orders.isLoading ? (
              <div className="grid h-24 place-items-center">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">
                Line items aren&apos;t available for this invoice.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{it.name}</p>
                      <p className="text-xs text-zinc-400">
                        {it.quantity} × {money(it.price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{money(it.subTotal)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {i.notes && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">Notes</h2>
              <p className="text-sm text-zinc-600">{i.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Amount</h2>
            <dl className="space-y-1.5 text-sm">
              <Line label="Subtotal" value={money(i.subtotal)} />
              {i.vatAmount > 0 && <Line label="VAT" value={money(i.vatAmount)} />}
              {i.nhilAmount > 0 && <Line label="NHIL" value={money(i.nhilAmount)} />}
              {i.getfundAmount > 0 && <Line label="GETFund" value={money(i.getfundAmount)} />}
              <div className="my-2 border-t border-zinc-100" />
              <Line label="Total" value={money(i.totalAmount)} strong />
              {i.amountPaid > 0 && <Line label="Paid" value={money(i.amountPaid)} />}
              {i.balance > 0 && (
                <div className="flex justify-between pt-1 text-sm font-semibold text-red-600">
                  <span>Balance due</span>
                  <span>{money(i.balance)}</span>
                </div>
              )}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">Customer</h2>
            <p className="text-sm text-zinc-700">{i.customerName || "No customer"}</p>
            {i.customerEmail && <p className="text-xs text-zinc-400">{i.customerEmail}</p>}
            {i.customerId && (
              <Link
                href={`/customers/${i.customerId}`}
                className="mt-1 inline-block text-xs font-medium text-primary-600 hover:underline"
              >
                View customer
              </Link>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Details</h2>
            <dl className="space-y-1.5 text-sm">
              <Line label="Type" value={i.invoiceType.charAt(0) + i.invoiceType.slice(1).toLowerCase()} />
              {i.issueDate && <Line label="Issued" value={formatDate(i.issueDate)} />}
              {i.dueDate && <Line label="Due" value={formatDate(i.dueDate)} />}
              {i.sentAt && <Line label="Sent" value={formatDate(i.sentAt)} />}
              <Line label="Orders" value={`${i.orderIds.length} linked`} />
            </dl>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">Change status</label>
              <Select
                value={i.status}
                onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value as InvoiceStatus })}
              >
                {invoiceStatus.options.map((s) => (
                  <option key={s} value={s}>
                    {labelize(s)}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </div>
      </div>

      {/* Printable document */}
      <div id="print-doc">
        <InvoiceDocument invoice={i} items={items} businessName={business.data?.name ?? "Ventura"} />
      </div>

      <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} invoice={i} />
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold text-zinc-900" : "text-zinc-600"}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
