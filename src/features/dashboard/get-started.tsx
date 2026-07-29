"use client";

import { useState } from "react";
import { Check, X, Store, Users, Package, ShoppingCart, FileText, CalendarDays, Lock } from "lucide-react";
import { Card } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSetupStatus } from "@/features/setup/hooks";
import type { SetupStatus } from "@/features/setup/api";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { ResourceFormDialog } from "@/features/resources/resource-form-dialog";
import { OrderCreateDialog } from "@/features/orders/order-create-dialog";
import { InvoiceCreateDialog } from "@/features/invoices/invoice-create-dialog";
import { AppointmentFormDialog } from "@/features/appointments/appointment-form-dialog";

type DialogKey = "customer" | "resource" | "order" | "invoice" | "appointment";

const DISMISS_KEY = "ventura.getStartedDismissed";

interface Step {
  key: string;
  done: (s: SetupStatus) => boolean;
  locked?: (s: SetupStatus) => boolean;
  lockedHint?: string;
  dialog?: DialogKey;
  icon: typeof Users;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    key: "business",
    done: (s) => s.hasBusiness,
    icon: Store,
    title: "Create your business",
    description: "Your business profile is set up.",
  },
  {
    key: "customer",
    done: (s) => s.hasCustomers,
    dialog: "customer",
    icon: Users,
    title: "Add your first customer",
    description: "The people and businesses you serve.",
  },
  {
    key: "resource",
    done: (s) => s.hasResources,
    dialog: "resource",
    icon: Package,
    title: "Add a product or service",
    description: "What your business sells.",
  },
  {
    key: "order",
    done: (s) => s.hasOrders,
    locked: (s) => !s.hasCustomers || !s.hasResources,
    lockedHint: "Add a customer and a product first",
    dialog: "order",
    icon: ShoppingCart,
    title: "Record an order",
    description: "Turn a sale into an order.",
  },
  {
    key: "invoice",
    done: (s) => s.hasInvoices,
    locked: (s) => !s.hasOrders,
    lockedHint: "Record an order first",
    dialog: "invoice",
    icon: FileText,
    title: "Create an invoice",
    description: "Bill an order and get paid.",
  },
  {
    key: "appointment",
    done: (s) => s.hasAppointments,
    dialog: "appointment",
    icon: CalendarDays,
    title: "Schedule an appointment",
    description: "Add a booking to your calendar.",
  },
];

export function GetStarted() {
  const setup = useSetupStatus();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1",
  );
  const [dialog, setDialog] = useState<DialogKey | null>(null);

  const s = setup.data;
  if (!s) return null;

  const done = STEPS.filter((step) => step.done(s)).length;
  if (dismissed || s.complete || done === STEPS.length) return null;

  const pct = Math.round((done / STEPS.length) * 100);
  const nextKey = STEPS.find((step) => !step.done(s) && !step.locked?.(s))?.key;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Get started</h2>
            <p className="mt-1 text-sm text-zinc-500">
              A few quick steps to get the most out of Ventura.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">
              {done} of {STEPS.length} done
            </span>
            <span className="text-zinc-400">{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ul className="divide-y divide-zinc-100 p-2">
          {STEPS.map((step) => {
            const isDone = step.done(s);
            const isLocked = !isDone && Boolean(step.locked?.(s));
            const isNext = step.key === nextKey;
            return (
              <li
                key={step.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  isNext && "bg-primary-50/50",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    isDone ? "bg-primary-600 text-white" : "bg-zinc-100 text-zinc-400",
                  )}
                >
                  {isDone ? <Check className="size-5" /> : <step.icon className="size-4.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", isDone ? "text-zinc-400 line-through" : "text-zinc-900")}>
                    {step.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {isLocked ? step.lockedHint : step.description}
                  </p>
                </div>
                {isDone ? null : isLocked ? (
                  <Lock className="size-4 shrink-0 text-zinc-300" />
                ) : step.dialog ? (
                  <Button
                    size="sm"
                    variant={isNext ? "primary" : "secondary"}
                    onClick={() => setDialog(step.dialog!)}
                  >
                    Start
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>

      <CustomerFormDialog open={dialog === "customer"} onClose={() => setDialog(null)} />
      <ResourceFormDialog open={dialog === "resource"} onClose={() => setDialog(null)} />
      <OrderCreateDialog open={dialog === "order"} onClose={() => setDialog(null)} />
      <InvoiceCreateDialog open={dialog === "invoice"} onClose={() => setDialog(null)} />
      <AppointmentFormDialog open={dialog === "appointment"} onClose={() => setDialog(null)} />
    </>
  );
}
