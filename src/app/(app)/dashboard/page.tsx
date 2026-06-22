"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/features/auth/store";
import { useMyBusiness } from "@/features/business/hooks";
import { useSetupStatus } from "@/features/setup/hooks";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const business = useMyBusiness();

  if (business.isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {greeting()}, {user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {business.data ? business.data.name : "Finish setting up to get started."}
        </p>
      </div>

      {business.data ? <SetupChecklist /> : <BusinessRequired />}
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Shown when the user has authenticated but not yet created a business. */
function BusinessRequired() {
  const router = useRouter();
  return (
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700">
        <Store className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">Set up your business</h2>
        <p className="max-w-sm text-sm text-zinc-500">
          Create your business profile to unlock customers, orders, invoices and revenue insights.
        </p>
      </div>
      <Button size="lg" onClick={() => router.push("/onboarding")}>
        Get started <ArrowRight className="size-4" />
      </Button>
    </Card>
  );
}

const STEPS: { key: keyof Omit<SetupFlags, "complete">; label: string }[] = [
  { key: "hasBusiness", label: "Create your business" },
  { key: "hasCustomers", label: "Add your first customer" },
  { key: "hasResources", label: "Add a product or service" },
  { key: "hasOrders", label: "Record an order" },
  { key: "hasInvoices", label: "Send an invoice" },
  { key: "hasAppointments", label: "Schedule an appointment" },
];

type SetupFlags = {
  hasBusiness: boolean;
  hasCustomers: boolean;
  hasResources: boolean;
  hasOrders: boolean;
  hasInvoices: boolean;
  hasAppointments: boolean;
  complete: boolean;
};

function SetupChecklist() {
  const setup = useSetupStatus();

  if (setup.isLoading) {
    return <Card className="h-48 animate-pulse bg-zinc-100/60" />;
  }
  if (!setup.data || setup.data.complete) {
    return (
      <Card className="p-6 text-sm text-zinc-500">
        You&apos;re all set up. Feature dashboards are coming next.
      </Card>
    );
  }

  const done = STEPS.filter((s) => setup.data![s.key]).length;
  const pct = Math.round((done / STEPS.length) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Getting started</h2>
        <span className="text-sm text-zinc-500">
          {done} of {STEPS.length}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-primary-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-5 divide-y divide-zinc-100">
        {STEPS.map((step) => {
          const complete = setup.data![step.key];
          return (
            <li key={step.key} className="flex items-center gap-3 py-3">
              {complete ? (
                <CheckCircle2 className="size-5 text-primary-600" />
              ) : (
                <Circle className="size-5 text-zinc-300" />
              )}
              <span
                className={cn(
                  "text-sm",
                  complete ? "text-zinc-400 line-through" : "text-zinc-700",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
