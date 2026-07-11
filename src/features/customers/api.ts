import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { listPage, type ListParams, type ListResult } from "@/lib/api/list";
import { customerSchema, toCustomerPayload, type Customer, type CustomerForm } from "./schemas";

export interface ImportRow {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

const importResultSchema = z.object({
  created: z.array(z.unknown()).default([]),
  skipped: z.array(z.object({ index: z.number(), reason: z.string() })).default([]),
  failed: z.array(z.object({ index: z.number(), reason: z.string() })).default([]),
});

export type ImportResult = z.infer<typeof importResultSchema>;

export async function importCustomers(rows: ImportRow[]): Promise<ImportResult> {
  const body = await apiFetch("/customers/import", {
    method: "POST",
    body: { customers: rows },
  });
  return importResultSchema.parse(body);
}

export function listCustomers(params: ListParams): Promise<ListResult<Customer>> {
  return listPage("/customers", customerSchema, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q,
  });
}

export async function getCustomer(id: string): Promise<Customer> {
  return customerSchema.parse(await apiFetch(`/customers/${id}`));
}

export async function createCustomer(form: CustomerForm): Promise<Customer> {
  return customerSchema.parse(
    await apiFetch("/customers", { method: "POST", body: toCustomerPayload(form) }),
  );
}

export async function updateCustomer(id: string, form: CustomerForm): Promise<Customer> {
  return customerSchema.parse(
    await apiFetch(`/customers/${id}`, { method: "PATCH", body: toCustomerPayload(form) }),
  );
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch(`/customers/${id}`, { method: "DELETE" });
}
