"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { ResourceForm, ResourceType } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import type { ListParams } from "@/lib/api/list";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

export function useResources(params: ListParams & { type?: ResourceType }) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.resources.list(params),
    queryFn: () => api.listResources(params),
    enabled: status === "authenticated",
    placeholderData: keepPreviousData,
  });
}

export function useResource(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.resources.detail(id),
    queryFn: () => api.getResource(id),
    enabled: status === "authenticated" && Boolean(id),
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: ResourceForm) => api.createResource(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      toast.success("Saved");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateResource(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: ResourceForm) => api.updateResource(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success("Updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteResource(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success("Deleted");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
