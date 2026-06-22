/**
 * Helpers for the new API's list envelope: `{ data: T[], meta: { total, page,
 * limit, totalPages } }`. Some endpoints (e.g. /appointments) return a bare
 * array — `unwrapList` tolerates both, mirroring the mobile reference.
 */
import { apiFetch, type Query } from "@/lib/api/client";

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

/** Coerce a response body into a flat array, accepting `{data}` or a bare array. */
export function unwrapList<T = unknown>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: T[] }).data;
  }
  return [];
}

/**
 * Walk every page of a paginated endpoint and return all items flattened.
 * Port of the mobile reference's `fetchAllPages`.
 */
export async function fetchAllPages<T = unknown>(
  path: string,
  query: Query = {},
  limit = 100,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const body = await apiFetch<Paginated<T> | T[]>(path, {
      query: { ...query, page, limit },
    });
    all.push(...unwrapList<T>(body));
    totalPages =
      !Array.isArray(body) && body?.meta?.totalPages ? body.meta.totalPages : page;
    page += 1;
  } while (page <= totalPages);

  return all;
}
