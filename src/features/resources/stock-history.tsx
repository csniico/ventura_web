"use client";

import { useState } from "react";
import { Card } from "@/components/ui/misc";
import { EmptyState, Pagination, Skeleton } from "@/components/ui/data";
import { History } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { reasonLabels } from "./schemas";
import { useStockAdjustments } from "./hooks";

/**
 * A product's stock ledger, newest first. Rows written by the order flow
 * (`order`, `order_cancel`) and the migration (`opening_balance`) appear
 * alongside manual ones — the ledger is the full history, not just edits.
 */
export function StockHistory({ resourceId }: { resourceId: string }) {
  const [page, setPage] = useState(1);
  const history = useStockAdjustments(resourceId, { page, limit: 10 });

  return (
    <Card className="p-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <History className="size-4 text-zinc-400" /> Stock history
      </h2>

      {history.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : history.isError ? (
        <p className="py-6 text-center text-sm text-zinc-500">Couldn&apos;t load stock history.</p>
      ) : (history.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={History}
          title="No movements yet"
          description="Stock changes from orders and manual adjustments show up here."
        />
      ) : (
        <>
          <ul className="divide-y divide-zinc-100">
            {history.data?.data.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{reasonLabels[row.reason]}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {formatDateTime(row.createdAt)}
                    {row.note ? ` · ${row.note}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      row.delta > 0 ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </p>
                  <p className="text-xs text-zinc-400 tabular-nums">{row.balanceAfter} on hand</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Pagination
              page={history.data?.meta.page ?? 1}
              totalPages={history.data?.meta.totalPages ?? 1}
              total={history.data?.meta.total ?? 0}
              onPage={setPage}
            />
          </div>
        </>
      )}
    </Card>
  );
}
