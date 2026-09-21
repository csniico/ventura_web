import { z } from "zod";

export const orderStatus = z.enum(["pending", "completed", "cancelled"]);
export type OrderStatus = z.infer<typeof orderStatus>;

const orderItemSchema = z.object({
  resourceId: z.string(),
  type: z.enum(["product", "service"]),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  /** The sell unit snapshotted on the line (VT-202); base unit by default. */
  unit: z.string().nullable().optional(),
  /** Base units per one `unit` — stock moves by quantity * this. */
  unitFactor: z.number().nullable().optional(),
  subTotal: z.number(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    orderNumber: z.string(),
    customerId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().nullable().optional(),
    customerPhone: z.string().nullable().optional(),
    items: z.array(orderItemSchema).default([]),
    totalAmount: z.number(),
    status: orderStatus,
    invoiceId: z.string().nullable().optional(),
    createdAt: z.string().optional(),
  })
  .transform((o) => ({
    id: (o._id ?? o.id ?? "") as string,
    orderNumber: o.orderNumber,
    customerId: o.customerId,
    customerName: o.customerName,
    items: o.items,
    totalAmount: o.totalAmount,
    status: o.status,
    invoiceId: o.invoiceId ?? null,
    createdAt: o.createdAt ?? null,
  }));

export type Order = z.infer<typeof orderSchema>;

/**
 * Client sends resourceId + quantity (and optionally a named bulk unit) per
 * item; the server snapshots name, price, unit and unitFactor.
 */
export const createOrderInput = z.object({
  customerId: z.string().min(1, "Select a customer"),
  items: z
    .array(
      z.object({
        resourceId: z.string().min(1),
        quantity: z.number().int().min(1),
        unit: z.string().optional(),
      }),
    )
    .min(1, "Add at least one item"),
});
export type CreateOrderInput = z.infer<typeof createOrderInput>;
