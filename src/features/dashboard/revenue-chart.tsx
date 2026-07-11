"use client";

import { money } from "@/lib/format";

/** Minimal, dependency-free revenue bar chart with hover tooltips. */
export function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const hasRevenue = data.some((d) => d.amount > 0);

  if (!hasRevenue) {
    return (
      <div className="grid h-40 place-items-center text-sm text-zinc-400">
        No revenue in this period yet
      </div>
    );
  }

  return (
    <div className="flex h-40 items-end gap-0.5" role="img" aria-label="Daily revenue">
      {data.map((d) => (
        <div key={d.date} className="group relative flex-1">
          <div
            className="rounded-t bg-primary-500/80 transition-colors group-hover:bg-primary-600"
            style={{ height: `${Math.max(2, (d.amount / max) * 100)}%`, minHeight: "2px" }}
          />
          <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block">
            {money(d.amount)}
            <span className="block text-[10px] text-zinc-400">{d.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
