import { apiFetch } from "@/lib/api/client";
import { businessSchema, type Business, type CreateBusinessForm } from "@/features/business/schemas";

/** Returns the signed-in user's business, or null when they have none. */
export async function getMyBusiness(): Promise<Business | null> {
  const body = await apiFetch("/businesses/mine");
  if (body == null) return null;
  return businessSchema.parse(body);
}

export async function createBusiness(input: CreateBusinessForm): Promise<Business> {
  const body = await apiFetch("/businesses", { method: "POST", body: input });
  return businessSchema.parse(body);
}

export async function updateBusiness(id: string, patch: Partial<Business>): Promise<Business> {
  const body = await apiFetch(`/businesses/${id}`, { method: "PATCH", body: patch });
  return businessSchema.parse(body);
}

export async function getCategories(): Promise<string[]> {
  const body = await apiFetch("/businesses/categories");
  return Array.isArray(body) ? (body as string[]) : [];
}
