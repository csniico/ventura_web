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

/** All customers (cached), for the list's stats/search/sort/paginate. */
export function useAllCustomers() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: [...queryKeys.customers.all, "all-list"],
    queryFn: api.listAllCustomers,
    enabled: status === "authenticated",
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

/**
 * Delete several customers at once. There is no bulk endpoint, so these run as
 * concurrent DELETE /customers/:id calls; `allSettled` means one failure
 * doesn't hide the rest, and the toast reports what actually happened.
 */
export function useDeleteCustomers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => api.deleteCustomer(id)));
      const failed = results.filter((r) => r.status === "rejected").length;
      return { requested: ids.length, failed };
    },
    onSuccess: ({ requested, failed }) => {
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      const deleted = requested - failed;
      if (failed === 0) {
        toast.success(`Deleted ${deleted} customer${deleted === 1 ? "" : "s"}`);
      } else if (deleted === 0) {
        toast.error(`Couldn't delete ${failed} customer${failed === 1 ? "" : "s"}`);
      } else {
        toast.warning(`Deleted ${deleted} · ${failed} failed`);
      }
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
