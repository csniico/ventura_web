import { z } from "zod";

export const resourceType = z.enum(["product", "service"]);
export type ResourceType = z.infer<typeof resourceType>;

/**
 * An alternate bulk/retail unit for a product (VT-202). `factor` is how many
 * base units one of these equals, and `price` is the price for one of them —
 * it is not derived from the base price, so a carton can be discounted.
 */
export const resourceUnitSchema = z.object({
  name: z.string(),
  factor: z.number(),
  price: z.number(),
});
export type ResourceUnit = z.infer<typeof resourceUnitSchema>;

/** Label shown when a product has no explicit base unit. */
export const DEFAULT_BASE_UNIT = "unit";

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
    baseUnit: z.string().nullable().optional(),
    units: z.array(resourceUnitSchema).default([]),
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
    baseUnit: r.baseUnit ?? null,
    units: r.units,
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
    baseUnit: z.string().trim().optional(),
    units: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Name the unit"),
          factor: z
            .number({ message: "Enter a factor" })
            .min(1, "Must be at least 1 base unit"),
          price: z.number({ message: "Enter a price" }).min(0, "Price must be 0 or more"),
        }),
      )
      // Optional rather than defaulted so the form's input and output types
      // stay identical (react-hook-form resolves against a single type).
      .optional(),
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
    // Units are product-only; the API rejects them on a service.
    const units = (form.units ?? []).filter((u) => u.name.trim());
    return {
      ...base,
      availableQuantity: form.availableQuantity ?? 0,
      lowStockThreshold: form.lowStockThreshold ?? 5,
      ...(form.baseUnit ? { baseUnit: form.baseUnit } : {}),
      ...(units.length ? { units } : {}),
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

/**
 * Stock is an append-only ledger (VT-203): every change writes a signed row
 * with a reason and the resulting balance. `order` / `order_cancel` /
 * `opening_balance` are written by the backend; only the three manual reasons
 * below may be sent from here.
 */
export const stockAdjustmentReason = z.enum([
  "opening_balance",
  "order",
  "order_cancel",
  "restock",
  "correction",
  "manual",
]);
export type StockAdjustmentReason = z.infer<typeof stockAdjustmentReason>;

export const manualReasons = ["restock", "correction", "manual"] as const;
export type ManualReason = (typeof manualReasons)[number];

export const stockAdjustmentSchema = z
  .object({
    id: z.string(),
    resourceId: z.string(),
    delta: z.number(),
    reason: stockAdjustmentReason,
    balanceAfter: z.number(),
    note: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdAt: z.string(),
  })
  .transform((a) => ({
    id: a.id,
    resourceId: a.resourceId,
    delta: a.delta,
    reason: a.reason,
    balanceAfter: a.balanceAfter,
    note: a.note ?? null,
    /** System rows (order flow, opening balance) have no user. */
    createdBy: a.createdBy ?? null,
    createdAt: a.createdAt,
  }));

export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;

/** The dialog collects a direction + magnitude; the API wants a signed delta. */
export const stockAdjustmentForm = z.object({
  direction: z.enum(["add", "remove"]),
  quantity: z.number({ message: "Enter a quantity" }).int().min(1, "Must be at least 1"),
  reason: z.enum(manualReasons),
  note: z.string().trim().optional(),
});
export type StockAdjustmentForm = z.infer<typeof stockAdjustmentForm>;

export function toStockAdjustmentPayload(form: StockAdjustmentForm) {
  return {
    delta: form.direction === "remove" ? -form.quantity : form.quantity,
    reason: form.reason,
    ...(form.note ? { note: form.note } : {}),
  };
}

/** Human labels for ledger rows, including the system-written reasons. */
export const reasonLabels: Record<StockAdjustmentReason, string> = {
  opening_balance: "Opening balance",
  order: "Order",
  order_cancel: "Order cancelled",
  restock: "Restock",
  correction: "Correction",
  manual: "Manual",
};
