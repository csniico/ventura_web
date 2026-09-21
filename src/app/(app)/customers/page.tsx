"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Skeleton,
  TableWrap,
  Th,
  Td,
  Pagination,
  IconButton,
} from "@/components/ui/data";
import { Card } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useDebounced } from "@/lib/hooks";
import { initials, tint, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  useAllCustomers,
  useDeleteCustomer,
  useDeleteCustomers,
} from "@/features/customers/hooks";
import type { Customer } from "@/features/customers/schemas";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { ImportCustomersDialog } from "@/features/customers/import-dialog";

const PAGE_SIZE = 20;
type SortKey = "name" | "created";
type SortDir = "asc" | "desc";

export default function CustomersPage() {
  const all = useAllCustomers();
  const del = useDeleteCustomer();
  const delMany = useDeleteCustomers();

  const [search, setSearch] = useState("");
  const q = useDebounced(search).trim().toLowerCase();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const list = useMemo(() => all.data ?? [], [all.data]);

  // Captured once on mount (avoids impure Date calls during render).
  const [bounds] = useState(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return { week: Date.now() - 7 * 24 * 60 * 60 * 1000, month: monthStart.getTime() };
  });

  const stats = useMemo(() => {
    const ts = (c: Customer) => (c.createdAt ? new Date(c.createdAt).getTime() : 0);
    return {
      total: list.length,
      newThisWeek: list.filter((c) => ts(c) >= bounds.week).length,
      newThisMonth: list.filter((c) => ts(c) >= bounds.month).length,
    };
  }, [list, bounds]);

  const filtered = useMemo(() => {
    const base = q
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q),
        )
      : list;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (at - bt) * dir;
    });
  }, [list, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Ids that have left the list (deleted, or filtered out by a search) are
  // dropped on read rather than pruned in an effect, so the toolbar count
  // always matches what is actually selectable without a cascading render.
  const visible = useMemo(() => {
    const ids = new Set(filtered.map((c) => c.id));
    return new Set([...selected].filter((id) => ids.has(id)));
  }, [filtered, selected]);

  const pageIds = rows.map((c) => c.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => visible.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "created" ? "desc" : "asc");
    }
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: Customer) {
    setEditing(c);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="The people and businesses you serve."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" /> Import
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" /> New customer
            </Button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total customers" value={stats.total} loading={all.isLoading} />
        <Stat label="New this week" value={stats.newThisWeek} loading={all.isLoading} />
        <Stat label="New this month" value={stats.newThisMonth} loading={all.isLoading} />
      </div>

      {/* Selection toolbar replaces the search row while a selection is live. */}
      {visible.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3">
          <span className="text-sm font-medium text-primary-900">
            {visible.size} selected
          </span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm font-medium text-primary-700 hover:underline"
          >
            Clear
          </button>
          <div className="ml-auto">
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleting(true)}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>
      ) : null}

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search customers…"
        />
      </div>

      {all.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : rows.length === 0 ? (
        <TableWrap>
          <tbody>
            <tr>
              <td>
                <EmptyState
                  icon={Users}
                  title={q ? "No matches" : "No customers yet"}
                  description={q ? "Try a different search." : "Add your first customer to get started."}
                  action={
                    !q && (
                      <Button onClick={openCreate}>
                        <Plus className="size-4" /> New customer
                      </Button>
                    )
                  }
                />
              </td>
            </tr>
          </tbody>
        </TableWrap>
      ) : (
        <>
          <div className={cn("transition-opacity", all.isFetching && "opacity-60")}>
            <TableWrap>
              <thead>
                <tr>
                  <Th className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={allOnPageSelected}
                      onChange={togglePage}
                      className="size-4 cursor-pointer rounded border-zinc-300 text-primary-600 focus:ring-primary-500/50"
                    />
                  </Th>
                  <SortableTh label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                  <Th className="hidden sm:table-cell">Contact</Th>
                  <SortableTh
                    label="Added"
                    className="hidden md:table-cell"
                    active={sortKey === "created"}
                    dir={sortDir}
                    onClick={() => toggleSort("created")}
                  />
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "hover:bg-zinc-50/60",
                      visible.has(c.id) && "bg-primary-50/60 hover:bg-primary-50",
                    )}
                  >
                    <Td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.name}`}
                        checked={visible.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="size-4 cursor-pointer rounded border-zinc-300 text-primary-600 focus:ring-primary-500/50"
                      />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className={cn("grid size-9 place-items-center rounded-full text-xs font-semibold", tint(c.name))}>
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${c.id}`}
                            className="font-medium text-zinc-900 hover:text-primary-700 hover:underline"
                          >
                            {c.name}
                          </Link>
                          {c.notes && <p className="truncate text-xs text-zinc-400">{c.notes}</p>}
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">
                      <div className="space-y-0.5 text-xs text-zinc-500">
                        {c.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="size-3.5" /> {c.email}
                          </p>
                        )}
                        {c.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="size-3.5" /> {c.phone}
                          </p>
                        )}
                        {!c.email && !c.phone && <span className="text-zinc-300">—</span>}
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell text-zinc-500">{formatDate(c.createdAt)}</Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-1">
                        <IconButton label="Edit" onClick={() => openEdit(c)}>
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton label="Delete" danger onClick={() => setDeleting(c)}>
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} onPage={setPage} />
        </>
      )}

      <CustomerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customer={editing}
        existingNames={list.map((c) => c.name)}
      />
      <ImportCustomersDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={bulkDeleting}
        onClose={() => setBulkDeleting(false)}
        onConfirm={() =>
          delMany.mutate([...visible], {
            onSuccess: () => {
              setSelected(new Set());
              setBulkDeleting(false);
            },
          })
        }
        title={`Delete ${visible.size} customer${visible.size === 1 ? "" : "s"}`}
        message={`Remove ${visible.size} selected customer${
          visible.size === 1 ? "" : "s"
        }? This can't be undone.`}
        loading={delMany.isPending}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Delete customer"
        message={`Remove ${deleting?.name}? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}

function Stat({ label, value, loading }: { label: string; value: number; loading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      )}
    </Card>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Th className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-zinc-700",
          active && "text-zinc-700",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )
        ) : (
          <ChevronDown className="size-3.5 opacity-25" />
        )}
      </button>
    </Th>
  );
}
