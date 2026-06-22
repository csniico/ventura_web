"use client";

import { useQuery } from "@tanstack/react-query";
import { getSetupStatus } from "@/features/setup/api";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/features/auth/store";

export function useSetupStatus() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.setup.status,
    queryFn: getSetupStatus,
    enabled: status === "authenticated",
  });
}
