"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { Customer, CustomerForm } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import type { ListParams } from "@/lib/api/list";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

export function useCustomers(params: ListParams) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => api.listCustomers(params),
    enabled: status === "authenticated",
    placeholderData: keepPreviousData, // smooth page/search transitions
  });
}

export function useImportCustomers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: api.ImportRow[]) => api.importCustomers(rows),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      const created = result.created.length;
      const skipped = result.skipped.length + result.failed.length;
      toast.success(
        `Imported ${created} customer${created === 1 ? "" : "s"}` +
          (skipped ? ` · ${skipped} skipped` : ""),
      );
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useCustomer(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => api.getCustomer(id),
    enabled: status === "authenticated" && Boolean(id),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CustomerForm) => api.createCustomer(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      toast.success("Customer added");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CustomerForm) => api.updateCustomer(id, form),
    onSuccess: (updated: Customer) => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      qc.setQueryData(queryKeys.customers.detail(id), updated);
      toast.success("Customer updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success("Customer deleted");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
