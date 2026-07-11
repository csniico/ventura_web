"use client";

import { useMemo, useState } from "react";
import { Plus, CalendarDays, Check, X, Trash2, MapPin, Pencil } from "lucide-react";
import { PageHeader, EmptyState, Skeleton, StatusPill, IconButton } from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { appointmentTone } from "@/lib/status";
import { useAppointments, useUpdateAppointmentStatus, useDeleteAppointment } from "@/features/appointments/hooks";
import type { Appointment } from "@/features/appointments/schemas";
import { AppointmentFormDialog } from "@/features/appointments/appointment-form-dialog";

const dayKey = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function CalendarPage() {
  const query = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const del = useDeleteAppointment();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState<Appointment | null>(null);

  const openCreate = () => {
    setEditingAppt(null);
    setFormOpen(true);
  };
  const openEdit = (a: Appointment) => {
    setEditingAppt(a);
    setFormOpen(true);
  };

  // Group by day, sorted chronologically.
  const groups = useMemo(() => {
    const list = [...(query.data ?? [])].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
    const map = new Map<string, Appointment[]>();
    for (const appt of list) {
      const key = dayKey.format(new Date(appt.start));
      (map.get(key) ?? map.set(key, []).get(key)!).push(appt);
    }
    return [...map.entries()];
  }, [query.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Your upcoming appointments and bookings."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New appointment
          </Button>
        }
      />

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No appointments"
            description="Schedule your first appointment to see your agenda here."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" /> New appointment
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, appts]) => (
            <div key={day}>
              <h2 className="mb-2 text-sm font-semibold text-zinc-500">{day}</h2>
              <Card className="divide-y divide-zinc-100">
                {appts.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 p-4">
                    <div className="w-16 shrink-0 text-sm">
                      <p className="font-medium text-zinc-900">{timeFmt.format(new Date(a.start))}</p>
                      <p className="text-xs text-zinc-400">{timeFmt.format(new Date(a.end))}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-900">{a.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        {a.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" /> {a.location}
                          </span>
                        )}
                        {a.isRecurring && <span>· Recurring</span>}
                      </div>
                    </div>
                    <StatusPill tone={appointmentTone(a.status)}>{a.status}</StatusPill>
                    <div className="inline-flex gap-1">
                      {a.status === "scheduled" && (
                        <>
                          <IconButton label="Edit" onClick={() => openEdit(a)}>
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton
                            label="Mark completed"
                            onClick={() => updateStatus.mutate({ id: a.id, status: "completed" })}
                          >
                            <Check className="size-4" />
                          </IconButton>
                          <IconButton
                            label="Cancel"
                            danger
                            onClick={() => updateStatus.mutate({ id: a.id, status: "cancelled" })}
                          >
                            <X className="size-4" />
                          </IconButton>
                        </>
                      )}
                      <IconButton label="Delete" danger onClick={() => setDeleting(a)}>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      <AppointmentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        appointment={editingAppt}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Delete appointment"
        message={`Delete "${deleting?.title}"? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}
