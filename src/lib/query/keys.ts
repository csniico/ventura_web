import type { ListParams } from "@/lib/api/list";

/** Central registry of TanStack Query keys to keep invalidation consistent. */
export const queryKeys = {
  business: { mine: ["business", "mine"] as const },
  setup: { status: ["setup", "status"] as const },
  categories: ["business", "categories"] as const,

  customers: {
    all: ["customers"] as const,
    list: (params: ListParams) => ["customers", "list", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },
  resources: {
    all: ["resources"] as const,
    list: (params: ListParams & { type?: string }) => ["resources", "list", params] as const,
    detail: (id: string) => ["resources", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: ListParams & { status?: string; customerId?: string }) =>
      ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (params: ListParams & { status?: string; customerId?: string }) =>
      ["invoices", "list", params] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (range: { from?: string; to?: string }) => ["appointments", "list", range] as const,
  },
  dashboard: (range: string) => ["dashboard", "summary", range] as const,
  search: (q: string) => ["search", q] as const,
};
