"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import type { AppointmentForm, AppointmentStatus } from "./schemas";
import { queryKeys } from "@/lib/query/keys";
import { errorMessage } from "@/lib/api/message";
import { useAuthStore } from "@/features/auth/store";

export function useAppointments(range: { from?: string; to?: string } = {}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: queryKeys.appointments.list(range),
    queryFn: () => api.listAppointments(range),
    enabled: status === "authenticated",
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: AppointmentForm) => api.createAppointment(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.invalidateQueries({ queryKey: queryKeys.setup.status });
      toast.success("Appointment scheduled");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: AppointmentForm }) =>
      api.updateAppointment(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Appointment updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      api.updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Appointment updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Appointment deleted");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
