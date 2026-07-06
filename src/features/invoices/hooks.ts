"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { CreateInvoiceInput, InvoiceStatus, RecordPaymentForm } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import type { ListParams } from "@/lib/api/list";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

export function useInvoices(params: ListParams & { status?: InvoiceStatus; customerId?: string }) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn: () => api.listInvoices(params),
    enabled: status === "authenticated",
    placeholderData: keepPreviousData,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => api.createInvoice(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      toast.success("Invoice created");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

/** Shared invalidation for the per-invoice mutations. */
function useInvoiceAction<TArgs>(fn: (args: TArgs) => Promise<unknown>, message: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard("30d") });
      toast.success(message);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useRecordPayment() {
  return useInvoiceAction(
    ({ id, form }: { id: string; form: RecordPaymentForm }) => api.recordPayment(id, form),
    "Payment recorded",
  );
}

export function useSendInvoice() {
  return useInvoiceAction((id: string) => api.sendInvoice(id), "Invoice sent");
}

export function useUpdateInvoiceStatus() {
  return useInvoiceAction(
    ({ id, status }: { id: string; status: InvoiceStatus }) => api.updateInvoiceStatus(id, status),
    "Invoice updated",
  );
}
