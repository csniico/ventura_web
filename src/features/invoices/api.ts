import { apiFetch } from "@/lib/api/client";
import { listPage, type ListParams, type ListResult } from "@/lib/api/list";
import {
  invoiceSchema,
  invoiceDetailSchema,
  type CreateInvoiceInput,
  type Invoice,
  type InvoiceDetail,
  type InvoiceStatus,
  type RecordPaymentForm,
} from "./schemas";

export function listInvoices(
  params: ListParams & { status?: InvoiceStatus; customerId?: string },
): Promise<ListResult<Invoice>> {
  return listPage("/invoices", invoiceSchema, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q,
    status: params.status,
    customerId: params.customerId,
  });
}

export async function getInvoice(id: string): Promise<InvoiceDetail> {
  return invoiceDetailSchema.parse(await apiFetch(`/invoices/${id}`));
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const body = {
    orderIds: input.orderIds,
    ...(input.invoiceType ? { invoiceType: input.invoiceType } : {}),
    ...(input.dueDate ? { dueDate: input.dueDate } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
  return invoiceSchema.parse(await apiFetch("/invoices", { method: "POST", body }));
}

export async function recordPayment(id: string, form: RecordPaymentForm): Promise<Invoice> {
  const body = {
    amount: form.amount,
    paymentMethod: form.paymentMethod,
    ...(form.paymentDate ? { paymentDate: form.paymentDate } : {}),
  };
  return invoiceSchema.parse(
    await apiFetch(`/invoices/${id}/payment`, { method: "PATCH", body }),
  );
}

export async function sendInvoice(id: string): Promise<Invoice> {
  return invoiceSchema.parse(await apiFetch(`/invoices/${id}/send`, { method: "POST", body: {} }));
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  return invoiceSchema.parse(
    await apiFetch(`/invoices/${id}/status`, { method: "PATCH", body: { status } }),
  );
}
