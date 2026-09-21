import { money, formatDate } from "@/lib/format";
import { labelize } from "@/lib/status";
import type { InvoiceDetail } from "./schemas";
import type { OrderItem } from "@/features/orders/schemas";

/**
 * Print/PDF representation of an invoice, mirroring the mobile SalesPdfService
 * layout (header, BILL TO, items table, tax totals). Rendered inside the
 * `#invoice-doc` container which is hidden on screen and shown via print CSS —
 * the browser's "Save as PDF" produces the downloadable document.
 */
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${strong ? "text-base font-semibold text-zinc-900" : "text-sm text-zinc-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function InvoiceDocument({
  invoice: i,
  items,
  businessName,
}: {
  invoice: InvoiceDetail;
  items: OrderItem[];
  businessName: string;
}) {
  return (
    <div className="mx-auto max-w-184 bg-white p-10 text-zinc-900">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
        <div>
          <p className="text-lg font-bold tracking-tight">{businessName || "Ventura"}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">Invoice</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">#{i.invoiceNumber}</p>
          <p className="text-xs capitalize text-zinc-500">{i.invoiceType.toLowerCase()}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-zinc-700">{labelize(i.status)}</p>
        </div>
      </div>

      {/* Bill to */}
      <div className="mt-6 flex justify-between gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bill to</p>
          <p className="mt-1 font-semibold">{i.customerName || "No customer"}</p>
          {i.customerEmail && <p className="text-sm text-zinc-500">{i.customerEmail}</p>}
          {i.customerPhone && <p className="text-sm text-zinc-500">{i.customerPhone}</p>}
        </div>
        <div className="text-right text-sm text-zinc-500">
          {i.issueDate && <p>Issued {formatDate(i.issueDate)}</p>}
          {i.dueDate && <p>Due {formatDate(i.dueDate)}</p>}
        </div>
      </div>

      {/* Items */}
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 text-white">
            <th className="rounded-l-md px-3 py-2 text-left font-medium">Item</th>
            <th className="px-3 py-2 text-right font-medium">Qty</th>
            <th className="px-3 py-2 text-right font-medium">Unit price</th>
            <th className="rounded-r-md px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-zinc-400">
                Line items aren&apos;t available for this invoice.
              </td>
            </tr>
          ) : (
            items.map((it, idx) => (
              <tr key={idx} className="border-b border-zinc-100">
                <td className="px-3 py-2">{it.name}</td>
                <td className="px-3 py-2 text-right">
                  {it.quantity}
                  {it.unit && (it.unitFactor ?? 1) > 1 ? ` ${it.unit}` : ""}
                </td>
                <td className="px-3 py-2 text-right">{money(it.price)}</td>
                <td className="px-3 py-2 text-right">{money(it.subTotal)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 ml-auto w-64">
        <Row label="Subtotal" value={money(i.subtotal)} />
        {i.vatAmount > 0 && <Row label="VAT" value={money(i.vatAmount)} />}
        {i.nhilAmount > 0 && <Row label="NHIL" value={money(i.nhilAmount)} />}
        {i.getfundAmount > 0 && <Row label="GETFund" value={money(i.getfundAmount)} />}
        <div className="my-1 border-t border-zinc-200" />
        <Row label="Total" value={money(i.totalAmount)} strong />
        {i.amountPaid > 0 && <Row label="Paid" value={money(i.amountPaid)} />}
        {i.balance > 0 && <Row label="Balance due" value={money(i.balance)} strong />}
      </div>

      {i.notes && (
        <div className="mt-8 border-t border-zinc-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</p>
          <p className="mt-1 text-sm text-zinc-600">{i.notes}</p>
        </div>
      )}
    </div>
  );
}
