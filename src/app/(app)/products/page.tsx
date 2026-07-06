"use client";

import { useState } from "react";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Skeleton,
  TableWrap,
  Th,
  Td,
  Pagination,
  IconButton,
  StatusPill,
} from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useDebounced } from "@/lib/hooks";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useResources, useDeleteResource } from "@/features/resources/hooks";
import type { Resource, ResourceType } from "@/features/resources/schemas";
import { ResourceFormDialog } from "@/features/resources/resource-form-dialog";

const TABS: { value: ResourceType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "product", label: "Products" },
  { value: "service", label: "Services" },
];

export default function ProductsPage() {
  const [tab, setTab] = useState<ResourceType | "all">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);

  const query = useResources({
    page,
    q: q || undefined,
    type: tab === "all" ? undefined : tab,
  });
  const del = useDeleteResource();
  const items = query.data?.data ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Services"
        subtitle="What your business sells."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New item
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value ? "bg-primary-50 text-primary-700" : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="sm:max-w-xs sm:flex-1">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search items…"
          />
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : items.length === 0 ? (
        <TableWrap>
          <tbody>
            <tr>
              <td>
                <EmptyState
                  icon={Package}
                  title={q ? "No matches" : "Nothing here yet"}
                  description={q ? "Try a different search." : "Add a product or service to sell."}
                  action={
                    !q && (
                      <Button onClick={openCreate}>
                        <Plus className="size-4" /> New item
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
          <div className={cn("transition-opacity", query.isFetching && "opacity-60")}>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Type</Th>
                  <Th className="hidden sm:table-cell">Stock</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/60">
                    <Td>
                      <p className="font-medium text-zinc-900">{r.name}</p>
                      {r.description && <p className="truncate text-xs text-zinc-400">{r.description}</p>}
                    </Td>
                    <Td>
                      <span className="text-xs capitalize text-zinc-500">{r.type}</span>
                    </Td>
                    <Td className="hidden sm:table-cell">
                      {r.type === "product" ? (
                        r.isLowStock ? (
                          <StatusPill tone="danger">{r.availableQuantity} left</StatusPill>
                        ) : (
                          <span className="text-zinc-600">{r.availableQuantity}</span>
                        )
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </Td>
                    <Td className="text-right font-medium text-zinc-900">{money(r.price)}</Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-1">
                        <IconButton
                          label="Edit"
                          onClick={() => {
                            setEditing(r);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton label="Delete" danger onClick={() => setDeleting(r)}>
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          {query.data && (
            <Pagination
              page={query.data.meta.page}
              totalPages={query.data.meta.totalPages}
              total={query.data.meta.total}
              onPage={setPage}
            />
          )}
        </>
      )}

      <ResourceFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        resource={editing}
        defaultType={tab === "service" ? "service" : "product"}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Delete item"
        message={`Remove ${deleting?.name}? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}
