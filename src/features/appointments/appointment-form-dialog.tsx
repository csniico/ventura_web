"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Textarea, Select } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { appointmentForm, recurrenceFrequency, type AppointmentForm, type Appointment } from "./schemas";
import { useCreateAppointment, useUpdateAppointment } from "./hooks";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toDateInput(iso?: string | null): string {
  const local = toLocalInput(iso);
  return local ? local.slice(0, 10) : "";
}

function defaults(a?: Appointment | null): AppointmentForm {
  return {
    title: a?.title ?? "",
    start: toLocalInput(a?.start),
    end: toLocalInput(a?.end),
    location: a?.location ?? "",
    notes: a?.notes ?? "",
    invitees: (a?.invitees ?? []).map((i) => ({ name: i.name, email: i.email ?? "" })),
    recurrenceEnabled: Boolean(a?.recurrence),
    recurrenceFrequency: a?.recurrence?.frequency ?? "weekly",
    recurrenceInterval: a?.recurrence?.interval ?? 1,
    recurrenceUntil: toDateInput(a?.recurrence?.until),
  };
}

export function AppointmentFormDialog({
  open,
  onClose,
  appointment,
}: {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}) {
  const editing = Boolean(appointment);
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const mutation = editing ? update : create;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentForm),
    values: defaults(appointment),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "invitees" });
  const recurs = useWatch({ control, name: "recurrenceEnabled" });

  const onSubmit = handleSubmit((values) => {
    if (editing && appointment) {
      update.mutate({ id: appointment.id, form: values }, { onSuccess: onClose });
    } else {
      create.mutate(values, { onSuccess: onClose });
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit appointment" : "New appointment"}
      description={editing ? undefined : "Schedule a booking or event."}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Title" error={errors.title?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder="Consultation with Jane" {...register("title")} />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Starts" error={errors.start?.message}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} type="datetime-local" {...register("start")} />
            )}
          </Field>
          <Field label="Ends" error={errors.end?.message}>
            {({ id, invalid }) => (
              <Input id={id} invalid={invalid} type="datetime-local" {...register("end")} />
            )}
          </Field>
        </div>

        <Field label="Location" error={errors.location?.message}>
          {({ id, invalid }) => (
            <Input id={id} invalid={invalid} placeholder="Optional" {...register("location")} />
          )}
        </Field>

        {/* Invitees */}
        <div className="space-y-2">
          <span className="block text-sm font-medium text-zinc-700">Invitees</span>
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input placeholder="Name" className="flex-1" {...register(`invitees.${i}.name`)} />
              <Input placeholder="Email (optional)" type="email" className="flex-1" {...register(`invitees.${i}.email`)} />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove invitee"
                className="grid size-11 shrink-0 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: "", email: "" })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Plus className="size-4" /> Add invitee
          </button>
        </div>

        {/* Recurrence */}
        <div className="space-y-3 rounded-xl border border-zinc-200 p-3">
          <label className="flex items-center gap-2.5 text-sm font-medium text-zinc-700">
            <input type="checkbox" className="size-4 accent-primary-600" {...register("recurrenceEnabled")} />
            Repeats
          </label>
          {recurs && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Every">
                {({ id }) => (
                  <Input id={id} type="number" min={1} {...register("recurrenceInterval", { valueAsNumber: true })} />
                )}
              </Field>
              <Field label="Frequency">
                {({ id }) => (
                  <Select id={id} {...register("recurrenceFrequency")}>
                    {recurrenceFrequency.options.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Until" hint="Optional">
                {({ id }) => <Input id={id} type="date" {...register("recurrenceUntil")} />}
              </Field>
            </div>
          )}
        </div>

        <Field label="Notes" error={errors.notes?.message}>
          {({ id, invalid }) => (
            <Textarea id={id} invalid={invalid} placeholder="Optional details…" {...register("notes")} />
          )}
        </Field>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {editing ? "Save changes" : "Schedule"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
