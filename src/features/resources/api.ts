import { apiFetch } from "@/lib/api/client";
import { listPage, type ListParams, type ListResult } from "@/lib/api/list";
import {
  resourceSchema,
  toCreatePayload,
  toUpdatePayload,
  type Resource,
  type ResourceForm,
  type ResourceType,
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
