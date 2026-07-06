import { z } from "zod";

export const invoiceStatus = z.enum([
  "DRAFT",
  "SENT",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "CANCELLED",
]);
export type InvoiceStatus = z.infer<typeof invoiceStatus>;

export const invoiceType = z.enum(["STANDARD", "PROFORMA", "RECEIPT"]);
export type InvoiceType = z.infer<typeof invoiceType>;

export const paymentMethod = z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]);
export type PaymentMethod = z.infer<typeof paymentMethod>;

export const invoiceSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    invoiceNumber: z.string(),
    orderIds: z.array(z.string()).default([]),
    customerId: z.string().nullable().optional(),
    customerName: z.string().nullable().optional(),
    invoiceType: invoiceType,
    subtotal: z.number(),
    vatAmount: z.number(),
    nhilAmount: z.number(),
    getfundAmount: z.number(),
    totalTax: z.number(),
    totalAmount: z.number(),
    amountPaid: z.number(),
    status: invoiceStatus,
    paymentMethod: paymentMethod.nullable().optional(),
    paymentDate: z.string().nullable().optional(),
    issueDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    sentAt: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    createdAt: z.string().optional(),
  })
  .transform((i) => ({
    id: (i._id ?? i.id ?? "") as string,
    invoiceNumber: i.invoiceNumber,
    orderIds: i.orderIds,
    customerName: i.customerName ?? null,
    invoiceType: i.invoiceType,
    subtotal: i.subtotal,
    totalTax: i.totalTax,
    totalAmount: i.totalAmount,
    amountPaid: i.amountPaid,
    balance: Math.max(0, i.totalAmount - i.amountPaid),
    status: i.status,
    dueDate: i.dueDate ?? null,
    createdAt: i.createdAt ?? null,
  }));

export type Invoice = z.infer<typeof invoiceSchema>;

export const createInvoiceInput = z.object({
  orderIds: z.array(z.string()).min(1, "Select at least one order"),
  invoiceType: invoiceType.optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceInput>;

/** Payment body uses `amount` / `paymentMethod` / `paymentDate` (not amountPaid). */
export const recordPaymentForm = z.object({
  amount: z.number({ message: "Enter an amount" }).min(0.01, "Enter an amount"),
  paymentMethod: paymentMethod,
  paymentDate: z.string().optional(),
});
export type RecordPaymentForm = z.infer<typeof recordPaymentForm>;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CHEQUE: "Cheque",
};
