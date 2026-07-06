import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  appointmentSchema,
  toAppointmentPayload,
  type Appointment,
  type AppointmentForm,
  type AppointmentStatus,
} from "./schemas";

/** The list endpoint returns a bare array (from/to filter by start date). */
export async function listAppointments(range: { from?: string; to?: string } = {}): Promise<
  Appointment[]
> {
  const body = await apiFetch("/appointments", { query: { from: range.from, to: range.to } });
  return z.array(appointmentSchema).parse(body);
}

export async function createAppointment(form: AppointmentForm): Promise<Appointment> {
  return appointmentSchema.parse(
    await apiFetch("/appointments", { method: "POST", body: toAppointmentPayload(form) }),
  );
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  return appointmentSchema.parse(
    await apiFetch(`/appointments/${id}/status`, { method: "PATCH", body: { status } }),
  );
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiFetch(`/appointments/${id}`, { method: "DELETE" });
}
