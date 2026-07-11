import { z } from "zod";

export const resourceType = z.enum(["product", "service"]);
export type ResourceType = z.infer<typeof resourceType>;

export const resourceSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    shortId: z.string().optional(),
    type: resourceType,
    name: z.string(),
    price: z.number(),
    primaryImage: z.string().nullable().optional(),
    primaryImageKey: z.string().nullable().optional(),
    supportingImages: z.array(z.string()).default([]),
    supportingImageKeys: z.array(z.string()).default([]),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    availableQuantity: z.number().default(0),
    lowStockThreshold: z.number().default(5),
    createdAt: z.string().optional(),
  })
  .transform((r) => ({
    id: (r._id ?? r.id ?? "") as string,
    type: r.type,
    name: r.name,
    price: r.price,
    primaryImage: r.primaryImage ?? null,
    description: r.description ?? null,
    notes: r.notes ?? null,
    availableQuantity: r.availableQuantity,
    lowStockThreshold: r.lowStockThreshold,
    isLowStock: r.type === "product" && r.availableQuantity <= r.lowStockThreshold,
  }));

export type Resource = z.infer<typeof resourceSchema>;

export const resourceForm = z
  .object({
    type: resourceType,
    name: z.string().trim().min(1, "Name is required"),
    price: z.number({ message: "Enter a price" }).min(0, "Price must be 0 or more"),
    description: z.string().trim().optional(),
    availableQuantity: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    primaryImage: z.string().optional(),
    primaryImageKey: z.string().optional(),
  })
  .refine((v) => v.type !== "product" || v.availableQuantity !== undefined, {
    message: "Quantity is required for products",
    path: ["availableQuantity"],
  });
export type ResourceForm = z.infer<typeof resourceForm>;

/** Build a create payload — only send type-relevant fields (strict API). */
export function toCreatePayload(form: ResourceForm) {
  const base = {
    type: form.type,
    name: form.name,
    price: form.price,
    ...(form.description ? { description: form.description } : {}),
    ...(form.primaryImage ? { primaryImage: form.primaryImage } : {}),
    ...(form.primaryImageKey ? { primaryImageKey: form.primaryImageKey } : {}),
  };
  if (form.type === "product") {
    return {
      ...base,
      availableQuantity: form.availableQuantity ?? 0,
      lowStockThreshold: form.lowStockThreshold ?? 5,
    };
  }
  return base;
}

/** Update payload omits `type` (immutable server-side). */
export function toUpdatePayload(form: ResourceForm) {
  const payload = { ...(toCreatePayload(form) as Record<string, unknown>) };
  delete payload.type;
  return payload;
}
