"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchAll } from "./api";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/features/auth/store";

export function useSearch(term: string) {
  const status = useAuthStore((s) => s.status);
  const q = term.trim();
  return useQuery({
    queryKey: queryKeys.search(q),
    queryFn: () => searchAll(q),
    enabled: status === "authenticated" && q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}
