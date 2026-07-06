"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as businessApi from "@/features/business/api";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/features/auth/store";
import type { Business, CreateBusinessForm } from "@/features/business/schemas";

/** The signed-in user's business (null = none yet). Only runs once authed. */
export function useMyBusiness() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.business.mine,
    queryFn: businessApi.getMyBusiness,
    enabled: status === "authenticated",
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: businessApi.getCategories,
    staleTime: Infinity,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Business> }) =>
      businessApi.updateBusiness(id, patch),
    onSuccess: (business: Business) => {
      queryClient.setQueryData(queryKeys.business.mine, business);
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (input: CreateBusinessForm) => businessApi.createBusiness(input),
    onSuccess: (business: Business) => {
      // Reflect the new business locally and refresh dependent server state.
      queryClient.setQueryData(queryKeys.business.mine, business);
      queryClient.invalidateQueries({ queryKey: queryKeys.setup.status });
      if (user) setUser({ ...user, businessId: business.id });
    },
  });
}
