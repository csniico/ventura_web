"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight, PackageX, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { EmptyState, Skeleton, StatusPill } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { invoiceTone, labelize } from "@/lib/status";
import { useAuthStore } from "@/features/auth/store";
import { useMyBusiness } from "@/features/business/hooks";
import { useDashboardSummary } from "@/features/dashboard/hooks";
import type { DashboardRange, DashboardSummary } from "@/features/dashboard/api";
import { RevenueChart } from "@/features/dashboard/revenue-chart";
import { GetStarted } from "@/features/dashboard/get-started";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const business = useMyBusiness();

  if (business.isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {greeting()}, {user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {business.data ? business.data.name : "Finish setting up to get started."}
        </p>
      </div>

      {business.data ? <Overview /> : <BusinessRequired />}
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

function Overview() {
  const [range, setRange] = useState<DashboardRange>("30d");
  const summary = useDashboardSummary(range);

  return (
    <div className="space-y-6">
      <GetStarted />

      <div className="flex justify-end">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.value
                  ? "bg-primary-50 text-primary-700"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {summary.isLoading ? (
        <DashboardSkeleton />
      ) : summary.isError ? (
        <Card className="p-6 text-sm text-red-600">
          Couldn&apos;t load your dashboard. Try again.
        </Card>
      ) : summary.data ? (
        <>
          <StatGrid summary={summary.data} />

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Revenue</h2>
              <span className="text-sm text-zinc-400">Paid invoices</span>
            </div>
            <RevenueChart data={summary.data.dailyRevenue} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentInvoices invoices={summary.data.recentInvoices} />
            <TopProducts products={summary.data.inventory.topProducts} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total revenue" value={money(summary.revenue.total)} />
      <StatCard
        label="Last 30 days"
        value={money(summary.revenue.last30Days)}
        trend={summary.revenue.trendPercent}
      />
      <StatCard
        label="Low stock items"
        value={String(summary.inventory.lowStockCount)}
        muted={summary.inventory.lowStockCount === 0}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  muted,
}: {
  label: string;
  value: string;
  trend?: number | null;
  muted?: boolean;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          muted ? "text-zinc-400" : "text-zinc-900",
        )}
      >
        {value}
      </p>
      {trend != null && (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs font-medium",
            up ? "text-emerald-600" : "text-red-600",
          )}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(trend).toFixed(1)}% vs prior 30 days
        </p>
      )}
    </Card>
  );
}

function RecentInvoices({ invoices }: { invoices: DashboardSummary["recentInvoices"] }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">Recent invoices</h2>
        <Link href="/invoices" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all
        </Link>
      </div>
      {invoices.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">No invoices yet</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {invoices.map((inv) => (
            <li key={inv.invoiceId} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-800">{inv.customerName || "—"}</p>
                <p className="truncate text-xs text-zinc-400">{inv.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={invoiceTone(inv.status)}>{labelize(inv.status)}</StatusPill>
                <span className="text-sm font-semibold text-zinc-900">{money(inv.totalAmount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TopProducts({ products }: { products: DashboardSummary["inventory"]["topProducts"] }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-900">Top products</h2>
      {products.length === 0 ? (
        <EmptyState icon={PackageX} title="No sales yet" description="Your best sellers will appear here." />
      ) : (
        <ul className="space-y-3">
          {products.map((p, i) => (
            <li key={p.resourceId} className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-500">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-zinc-800">{p.name}</span>
              <span className="text-sm text-zinc-500">{p.unitsSold} sold</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
