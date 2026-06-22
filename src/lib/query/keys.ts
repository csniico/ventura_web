/** Central registry of TanStack Query keys to keep invalidation consistent. */
export const queryKeys = {
  business: { mine: ["business", "mine"] as const },
  setup: { status: ["setup", "status"] as const },
  categories: ["business", "categories"] as const,
};
