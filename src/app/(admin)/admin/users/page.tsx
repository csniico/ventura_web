"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Users, RotateCcw, Ban, Trash2 } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Skeleton,
  TableWrap,
  Th,
  Td,
  StatusPill,
  IconButton,
} from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useDebounced } from "@/lib/hooks";
import { initials, tint, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  usePlatformUsers,
  useSoftDeleteUser,
  useRestoreUser,
  useHardDeleteUser,
} from "@/features/admin/hooks";
import type { PlatformUser } from "@/features/admin/schemas";

type Filter = "active" | "suspended" | "all";

export default function AdminUsersPage() {
  const users = usePlatformUsers();
  const suspend = useSoftDeleteUser();
  const restore = useRestoreUser();
  const hardDelete = useHardDeleteUser();

  const [search, setSearch] = useState("");
  const q = useDebounced(search).trim().toLowerCase();
  const [filter, setFilter] = useState<Filter>("active");
  const [suspending, setSuspending] = useState<PlatformUser | null>(null);
  const [purging, setPurging] = useState<PlatformUser | null>(null);

  const list = useMemo(() => users.data ?? [], [users.data]);

  const counts = useMemo(
    () => ({
      all: list.length,
      active: list.filter((u) => !u.deleted).length,
      suspended: list.filter((u) => u.deleted).length,
    }),
    [list],
  );

  const rows = useMemo(() => {
    const byFilter = list.filter((u) =>
      filter === "all" ? true : filter === "suspended" ? u.deleted : !u.deleted,
    );
    const byQuery = q
      ? byFilter.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        )
      : byFilter;
    // Suspended last, then newest first.
    return [...byQuery].sort((a, b) => {
      if (a.deleted !== b.deleted) return a.deleted ? 1 : -1;
      return (
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
        (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      );
    });
  }, [list, filter, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform users"
        subtitle="Every account on Ventura, across all businesses."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
          {(["active", "suspended", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-primary-50 text-primary-700"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {f} <span className="text-xs text-zinc-400">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="sm:max-w-sm sm:flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email…" />
        </div>
      </div>

      {users.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : users.isError ? (
        <Card className="p-10 text-center text-sm text-zinc-500">Couldn&apos;t load users.</Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={q ? "No matches" : "Nothing here"}
            description={q ? "Try a different search." : `No ${filter} accounts.`}
          />
        </Card>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th className="hidden md:table-cell">Business</Th>
              <Th className="hidden sm:table-cell">Joined</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((u) => (
              <tr key={u.id} className={cn("hover:bg-zinc-50/60", u.deleted && "opacity-60")}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full text-xs font-semibold",
                        tint(u.name),
                      )}
                    >
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-zinc-900 hover:text-primary-700 hover:underline"
                      >
                        {u.name}
                      </Link>
                      <p className="truncate text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td className="hidden md:table-cell text-xs text-zinc-500">
                  {u.businessId ? (
                    <span className="font-mono">{u.businessId.slice(0, 8)}…</span>
                  ) : (
                    <span className="text-zinc-300">None</span>
                  )}
                </Td>
                <Td className="hidden sm:table-cell text-zinc-500">{formatDate(u.createdAt)}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.deleted ? (
                      <StatusPill tone="danger">Suspended</StatusPill>
                    ) : (
                      <StatusPill tone="success">Active</StatusPill>
                    )}
                    {u.isSystem && (
                      <StatusPill tone="primary">
                        <ShieldCheck className="size-3" /> System
                      </StatusPill>
                    )}
                    {!u.isEmailVerified && <StatusPill tone="warning">Unverified</StatusPill>}
                  </div>
                </Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1">
                    {u.deleted ? (
                      <IconButton
                        label="Restore"
                        onClick={() => restore.mutate(u.id)}
                        disabled={restore.isPending}
                      >
                        <RotateCcw className="size-4" />
                      </IconButton>
                    ) : (
                      <IconButton
                        label="Suspend"
                        onClick={() => setSuspending(u)}
                        disabled={u.isSystem}
                        title={u.isSystem ? "System accounts can't be suspended" : "Suspend"}
                      >
                        <Ban className="size-4" />
                      </IconButton>
                    )}
                    <IconButton
                      label="Delete permanently"
                      danger
                      onClick={() => setPurging(u)}
                      disabled={u.isSystem}
                      title={
                        u.isSystem ? "System accounts can't be deleted" : "Delete permanently"
                      }
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <ConfirmDialog
        open={Boolean(suspending)}
        onClose={() => setSuspending(null)}
        onConfirm={() =>
          suspending &&
          suspend.mutate(suspending.id, { onSuccess: () => setSuspending(null) })
        }
        title="Suspend account"
        message={`Suspend ${suspending?.email}? They lose access immediately, and you can restore the account afterwards.`}
        confirmLabel="Suspend"
        loading={suspend.isPending}
      />
      <ConfirmDialog
        open={Boolean(purging)}
        onClose={() => setPurging(null)}
        onConfirm={() =>
          purging && hardDelete.mutate(purging.id, { onSuccess: () => setPurging(null) })
        }
        title="Delete permanently"
        message={`Permanently delete ${purging?.email}? The account is erased and this cannot be undone or restored.`}
        confirmLabel="Delete forever"
        loading={hardDelete.isPending}
      />
    </div>
  );
}
