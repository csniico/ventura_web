import { z } from "zod";

export const customerSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    shortId: z.string().optional(),
    businessId: z.string().optional(),
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .transform((c) => ({
    id: (c._id ?? c.id ?? "") as string,
    shortId: c.shortId ?? null,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    notes: c.notes ?? null,
    createdAt: c.createdAt ?? null,
  }));

export type Customer = z.infer<typeof customerSchema>;

export const customerForm = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]).optional(),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
export type CustomerForm = z.infer<typeof customerForm>;

/** Strip empty optional strings so the strict API doesn't reject them. */
export function toCustomerPayload(form: CustomerForm) {
  return {
    name: form.name,
    ...(form.email ? { email: form.email } : {}),
    ...(form.phone ? { phone: form.phone } : {}),
    ...(form.notes ? { notes: form.notes } : {}),
  };
}
