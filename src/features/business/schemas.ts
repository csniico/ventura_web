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
});
export type OnboardingNameForm = z.infer<typeof onboardingNameForm>;
