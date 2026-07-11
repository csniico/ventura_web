"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { CreateOrderInput, OrderStatus } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import type { ListParams } from "@/lib/api/list";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

export function useOrders(params: ListParams & { status?: OrderStatus; customerId?: string }) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => api.listOrders(params),
    enabled: status === "authenticated",
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => api.getOrder(id),
    enabled: status === "authenticated" && Boolean(id),
  });
}

/** Fetch several orders by id — used to derive an invoice's line items. */
export function useOrdersByIds(ids: string[]) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ["orders", "byIds", [...ids].sort()],
    queryFn: () => Promise.all(ids.map((id) => api.getOrder(id))),
    enabled: status === "authenticated" && ids.length > 0,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.createOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      toast.success("Order created");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: CreateOrderInput["items"] }) =>
      api.updateOrder(id, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Order updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success("Order updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
