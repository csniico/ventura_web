"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, type DashboardRange } from "./api";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/features/auth/store";

export function useDashboardSummary(range: DashboardRange) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.dashboard(range),
    queryFn: () => getDashboardSummary(range),
    enabled: status === "authenticated",
  });
}
