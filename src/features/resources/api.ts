import { apiFetch } from "@/lib/api/client";
import { listPage, type ListParams, type ListResult } from "@/lib/api/list";
import {
  resourceSchema,
  stockAdjustmentSchema,
  toCreatePayload,
  toStockAdjustmentPayload,
  toUpdatePayload,
  type Resource,
  type ResourceForm,
  type ResourceType,
  type StockAdjustment,
  type StockAdjustmentForm,
} from "./schemas";

export function listResources(
  params: ListParams & { type?: ResourceType },
): Promise<ListResult<Resource>> {
  return listPage("/resources", resourceSchema, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q,
    type: params.type,
  });
}

export async function getResource(id: string): Promise<Resource> {
  return resourceSchema.parse(await apiFetch(`/resources/${id}`));
}

export async function createResource(form: ResourceForm): Promise<Resource> {
  return resourceSchema.parse(
    await apiFetch("/resources", { method: "POST", body: toCreatePayload(form) }),
  );
}

export async function updateResource(id: string, form: ResourceForm): Promise<Resource> {
  return resourceSchema.parse(
    await apiFetch(`/resources/${id}`, { method: "PATCH", body: toUpdatePayload(form) }),
  );
}

export async function deleteResource(id: string): Promise<void> {
  await apiFetch(`/resources/${id}`, { method: "DELETE" });
}

/** Record a manual stock movement against a product (VT-203 ledger). */
export async function adjustStock(id: string, form: StockAdjustmentForm): Promise<StockAdjustment> {
  return stockAdjustmentSchema.parse(
    await apiFetch(`/resources/${id}/stock-adjustments`, {
      method: "POST",
      body: toStockAdjustmentPayload(form),
    }),
  );
}

/** A product's stock history, newest first, paginated. */
export function listStockAdjustments(
  id: string,
  params: ListParams = {},
): Promise<ListResult<StockAdjustment>> {
  return listPage(`/resources/${id}/stock-adjustments`, stockAdjustmentSchema, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });
}
