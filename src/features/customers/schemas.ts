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

// Requires a proper domain with a TLD — zod's .email() accepts "a@b", which QA flagged.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with optional +, spaces, hyphens, parentheses; 7–20 chars.
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
// Allow people AND business names (letters, numbers, spaces, . , ' & ( ) -) but
// require at least one letter, so pure numbers/symbols are rejected.
const NAME_ALLOWED_RE = /^[\p{L}\p{N}\s.,'&()-]+$/u;

export const customerForm = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .refine((v) => /\p{L}/u.test(v), { message: "Name must include a letter" })
    .refine((v) => NAME_ALLOWED_RE.test(v), { message: "Name contains invalid characters" }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || EMAIL_RE.test(v), { message: "Enter a valid email" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || PHONE_RE.test(v), { message: "Enter a valid phone number" }),
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
