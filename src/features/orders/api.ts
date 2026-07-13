import { apiFetch } from "@/lib/api/client";
import { listPage, type ListParams, type ListResult } from "@/lib/api/list";
import { orderSchema, type CreateOrderInput, type Order, type OrderStatus } from "./schemas";

export function listOrders(
  params: ListParams & { status?: OrderStatus; customerId?: string },
): Promise<ListResult<Order>> {
  return listPage("/orders", orderSchema, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q,
    status: params.status,
    customerId: params.customerId,
  });
}

export async function getOrder(id: string): Promise<Order> {
  return orderSchema.parse(await apiFetch(`/orders/${id}`));
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return orderSchema.parse(await apiFetch("/orders", { method: "POST", body: input }));
}

/** Replace a (pending) order's line items. Server re-snapshots prices + total. */
export async function updateOrder(
  id: string,
  items: CreateOrderInput["items"],
): Promise<Order> {
  return orderSchema.parse(await apiFetch(`/orders/${id}`, { method: "PATCH", body: { items } }));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return orderSchema.parse(
    await apiFetch(`/orders/${id}/status`, { method: "PATCH", body: { status } }),
  );
}
