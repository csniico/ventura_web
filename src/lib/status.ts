import type { Tone } from "@/components/ui/data";
import type { InvoiceStatus } from "@/features/invoices/schemas";
import type { OrderStatus } from "@/features/orders/schemas";

/** Consistent tone + label mapping for each module's status enums. */

export function invoiceTone(status: string): Tone {
  switch (status) {
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "info";
    case "SENT":
      return "primary";
    case "OVERDUE":
      return "danger";
    case "CANCELLED":
      return "neutral";
    default:
      return "warning"; // DRAFT
  }
}

export function orderTone(status: string): Tone {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "warning"; // pending
  }
}

export function appointmentTone(status: string): Tone {
  switch (status) {
    case "completed":
    case "attended":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "primary"; // scheduled
  }
}

/**
 * Legal *direct* status transitions, mirroring the backend's tables
 * (`InvoiceService.INVOICE_TRANSITIONS` / `OrderService.ORDER_TRANSITIONS`).
 *
 * PAID and PARTIALLY_PAID are deliberately absent from every invoice entry:
 * they are set only by recording a payment, so `amountPaid` and `status` can
 * never disagree. CANCELLED is terminal for both modules.
 */
const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["OVERDUE", "CANCELLED"],
  PARTIALLY_PAID: ["OVERDUE", "CANCELLED"],
  OVERDUE: ["SENT", "CANCELLED"],
  PAID: ["CANCELLED"],
  CANCELLED: [],
};

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["completed", "cancelled"],
  completed: ["cancelled"],
  cancelled: [],
};

/** Statuses the invoice may be moved to directly from `status`. */
export function invoiceNextStatuses(status: InvoiceStatus): InvoiceStatus[] {
  return INVOICE_TRANSITIONS[status] ?? [];
}

/**
 * Statuses the order may be moved to directly from `status`. An order that is
 * already on an invoice cannot be cancelled — the invoice must be cancelled
 * first, which detaches its orders.
 */
export function orderNextStatuses(status: OrderStatus, onInvoice = false): OrderStatus[] {
  const next = ORDER_TRANSITIONS[status] ?? [];
  return onInvoice ? next.filter((s) => s !== "cancelled") : next;
}

/** Humanize an UPPER_SNAKE or lowercase enum for display. */
export function labelize(value: string): string {
  return value.replace(/_/g, " ").toLowerCase();
}
