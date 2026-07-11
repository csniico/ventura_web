import { z } from "zod";

export const appointmentStatus = z.enum(["scheduled", "completed", "attended", "cancelled"]);
export type AppointmentStatus = z.infer<typeof appointmentStatus>;

export const recurrenceFrequency = z.enum(["daily", "weekly", "monthly"]);
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequency>;

const inviteeSchema = z.object({
  name: z.string(),
  email: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
});

export const appointmentSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    title: z.string(),
    start: z.string(),
    end: z.string(),
    notes: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    invitees: z.array(inviteeSchema).default([]),
    recurrence: z
      .object({
        frequency: recurrenceFrequency,
        interval: z.number().default(1),
        until: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    status: appointmentStatus,
  })
  .transform((a) => ({
    id: (a._id ?? a.id ?? "") as string,
    title: a.title,
    start: a.start,
    end: a.end,
    location: a.location ?? null,
    notes: a.notes ?? null,
    invitees: a.invitees.map((i) => ({ name: i.name, email: i.email ?? null })),
    recurrence: a.recurrence
      ? {
          frequency: a.recurrence.frequency,
          interval: a.recurrence.interval,
          until: a.recurrence.until ?? null,
        }
      : null,
    isRecurring: Boolean(a.recurrence),
    status: a.status,
  }));

export type Appointment = z.infer<typeof appointmentSchema>;

export const appointmentForm = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    start: z.string().min(1, "Start time is required"),
    end: z.string().min(1, "End time is required"),
    location: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    invitees: z.array(z.object({ name: z.string(), email: z.string() })),
    recurrenceEnabled: z.boolean(),
    recurrenceFrequency,
    recurrenceInterval: z.number().int().min(1),
    recurrenceUntil: z.string().optional(),
  })
  .refine((v) => new Date(v.end) > new Date(v.start), {
    message: "End must be after start",
    path: ["end"],
  });
export type AppointmentForm = z.infer<typeof appointmentForm>;

/** Build the create/update body from the form (dates → ISO). */
export function toAppointmentPayload(form: AppointmentForm) {
  const invitees = form.invitees
    .filter((i) => i.name.trim())
    .map((i) => ({ name: i.name.trim(), ...(i.email.trim() ? { email: i.email.trim() } : {}) }));

  const payload: Record<string, unknown> = {
    title: form.title,
    start: new Date(form.start).toISOString(),
    end: new Date(form.end).toISOString(),
    ...(form.location ? { location: form.location } : {}),
    ...(form.notes ? { notes: form.notes } : {}),
    ...(invitees.length ? { invitees } : {}),
  };

  if (form.recurrenceEnabled) {
    payload.recurrence = {
      frequency: form.recurrenceFrequency,
      interval: form.recurrenceInterval || 1,
      ...(form.recurrenceUntil ? { until: new Date(form.recurrenceUntil).toISOString() } : {}),
    };
  }
  return payload;
}

/** Update body — same as create, but explicitly clears recurrence when off. */
export function toAppointmentUpdate(form: AppointmentForm) {
  const payload = toAppointmentPayload(form);
  if (!form.recurrenceEnabled) payload.clearRecurrence = true;
  return payload;
}
