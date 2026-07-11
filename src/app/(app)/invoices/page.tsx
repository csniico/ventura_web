"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, Send, CreditCard } from "lucide-react";
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
import { invoiceTone, labelize } from "@/lib/status";
import { cn } from "@/lib/cn";
import { useInvoices, useSendInvoice } from "@/features/invoices/hooks";
import type { Invoice, InvoiceStatus } from "@/features/invoices/schemas";
import { InvoiceCreateDialog } from "@/features/invoices/invoice-create-dialog";
import { PaymentDialog } from "@/features/invoices/payment-dialog";

const FILTERS: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PARTIALLY_PAID", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

const PAYABLE: InvoiceStatus[] = ["SENT", "PARTIALLY_PAID", "OVERDUE"];

export default function InvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const [createOpen, setCreateOpen] = useState(false);
  const [paying, setPaying] = useState<Invoice | null>(null);

  const query = useInvoices({ page, q: q || undefined, status: status === "all" ? undefined : status });
  const send = useSendInvoice();
  const invoices = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Bill customers and track what's owed."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New invoice
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
            placeholder="Search invoices…"
          />
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : invoices.length === 0 ? (
        <TableWrap>
          <tbody>
            <tr>
              <td>
                <EmptyState
                  icon={FileText}
                  title={q ? "No matches" : "No invoices yet"}
                  description={q ? "Try a different search." : "Bill an order to create your first invoice."}
                  action={
                    !q && (
                      <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" /> New invoice
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
                  <Th>Invoice</Th>
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Due</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="hidden sm:table-cell text-right">Balance</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/60">
                    <Td>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-mono text-xs font-medium text-primary-700 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-xs text-zinc-400">{formatDate(inv.createdAt)}</p>
                    </Td>
                    <Td className="font-medium text-zinc-900">{inv.customerName || "—"}</Td>
                    <Td className="hidden md:table-cell text-zinc-500">{formatDate(inv.dueDate)}</Td>
                    <Td>
                      <StatusPill tone={invoiceTone(inv.status)}>{labelize(inv.status)}</StatusPill>
                    </Td>
                    <Td className="text-right font-medium text-zinc-900">{money(inv.totalAmount)}</Td>
                    <Td className="hidden sm:table-cell text-right text-zinc-600">{money(inv.balance)}</Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-1">
                        {inv.status === "DRAFT" && (
                          <IconButton label="Send invoice" onClick={() => send.mutate(inv.id)}>
                            <Send className="size-4" />
                          </IconButton>
                        )}
                        {PAYABLE.includes(inv.status) && inv.balance > 0 && (
                          <IconButton label="Record payment" onClick={() => setPaying(inv)}>
                            <CreditCard className="size-4" />
                          </IconButton>
                        )}
                        {inv.status === "PAID" && <span className="text-zinc-300">—</span>}
                      </div>
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

      <InvoiceCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <PaymentDialog open={Boolean(paying)} onClose={() => setPaying(null)} invoice={paying} />
    </div>
  );
}
