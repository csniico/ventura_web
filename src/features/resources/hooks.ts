"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { Resource, ResourceForm, ResourceType, StockAdjustmentForm } from "./schemas";
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

/** A product's stock ledger, newest first. */
export function useStockAdjustments(id: string, params: ListParams = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.resources.adjustments(id, params),
    queryFn: () => api.listStockAdjustments(id, params),
    enabled: status === "authenticated" && Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useAdjustStock(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: StockAdjustmentForm) => api.adjustStock(id, form),
    onSuccess: (row) => {
      // The ledger row carries the authoritative new balance — write it into
      // the cached product so the detail page updates without a refetch.
      qc.setQueryData(queryKeys.resources.detail(id), (prev: Resource | undefined) =>
        prev
          ? {
              ...prev,
              availableQuantity: row.balanceAfter,
              // isLowStock is derived in the schema transform, so recompute it
              // here rather than leaving a stale badge behind.
              isLowStock: prev.type === "product" && row.balanceAfter <= prev.lowStockThreshold,
            }
          : prev,
      );
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success(
        row.delta > 0 ? `Added ${row.delta} to stock` : `Removed ${Math.abs(row.delta)} from stock`,
      );
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
