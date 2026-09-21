import { z } from "zod";

const businessHourSchema = z.object({ open: z.string(), close: z.string() }).partial();

export const businessSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    shortId: z.string().nullable().optional(),
    name: z.string(),
    ownerId: z.string().optional(),
    categories: z.array(z.string()).default([]),
    description: z.string().nullable().optional(),
    tagLine: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
    logoKey: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    businessHours: z.record(z.string(), businessHourSchema).nullable().optional(),
    socials: z.record(z.string(), z.string()).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .transform((b) => ({ ...b, id: (b._id ?? b.id ?? "") as string }));

export type Business = z.infer<typeof businessSchema>;

export const createBusinessInput = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  categories: z.array(z.string()),
});
export type CreateBusinessForm = z.infer<typeof createBusinessInput>;

/** Form schema for the onboarding screen (categories are managed separately). */
export const onboardingNameForm = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  /** Only collected when the account's name was derived from its email. */
  yourName: z.string().trim().optional(),
});
export type OnboardingNameForm = z.infer<typeof onboardingNameForm>;

/** Text fields on the business settings form (logo + categories are separate). */
export const businessSettingsForm = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  tagLine: z.string().trim().optional(),
  description: z.string().trim().optional(),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]).optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
});
export type BusinessSettingsForm = z.infer<typeof businessSettingsForm>;
