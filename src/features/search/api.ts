import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { customerSchema } from "@/features/customers/schemas";
import { resourceSchema } from "@/features/resources/schemas";
import { orderSchema } from "@/features/orders/schemas";
import { invoiceSchema } from "@/features/invoices/schemas";
import { appointmentSchema } from "@/features/appointments/schemas";

/** Business-scoped global search, capped at 5 results per group by the API. */
const searchSchema = z.object({
  query: z.string().optional(),
  customers: z.array(customerSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  orders: z.array(orderSchema).default([]),
  invoices: z.array(invoiceSchema).default([]),
  appointments: z.array(appointmentSchema).default([]),
});

export type SearchResults = z.infer<typeof searchSchema>;

export async function searchAll(q: string): Promise<SearchResults> {
  return searchSchema.parse(await apiFetch("/search", { query: { q } }));
}
