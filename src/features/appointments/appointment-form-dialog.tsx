"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { appointmentForm, type AppointmentForm } from "./schemas";
import { useCreateAppointment } from "./hooks";

export function AppointmentFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateAppointment();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentForm),
    defaultValues: { title: "", start: "", end: "", location: "", notes: "" },
  });

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  });

  return (
    <Dialog open={open} onClose={onClose} title="New appointment" description="Schedule a booking or event.">
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
        <Field label="Notes" error={errors.notes?.message}>
          {({ id, invalid }) => (
            <Textarea id={id} invalid={invalid} placeholder="Optional details…" {...register("notes")} />
          )}
        </Field>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Schedule
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
