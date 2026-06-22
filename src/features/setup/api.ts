import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const setupStatusSchema = z.object({
  hasBusiness: z.boolean(),
  hasCustomers: z.boolean(),
  hasResources: z.boolean(),
  hasOrders: z.boolean(),
  hasInvoices: z.boolean(),
  hasAppointments: z.boolean(),
  complete: z.boolean(),
});

export type SetupStatus = z.infer<typeof setupStatusSchema>;

/** Safe to call before a business exists — all flags come back false. */
export async function getSetupStatus(): Promise<SetupStatus> {
  return setupStatusSchema.parse(await apiFetch("/setup/status"));
}
