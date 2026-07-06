import { z, type ZodTypeAny } from "zod";
import { apiFetch, type Query } from "@/lib/api/client";

export const metaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type PageMeta = z.infer<typeof metaSchema>;

export interface ListResult<T> {
  data: T[];
  meta: PageMeta;
}

/** Fetch and validate one page of a `{ data, meta }` list endpoint. */
export async function listPage<S extends ZodTypeAny>(
  path: string,
  item: S,
  query: Query,
): Promise<ListResult<z.infer<S>>> {
  const schema = z.object({ data: z.array(item), meta: metaSchema });
  return schema.parse(await apiFetch(path, { query }));
}

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
}
