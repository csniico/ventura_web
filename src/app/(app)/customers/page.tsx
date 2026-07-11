"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users, Pencil, Trash2, Mail, Phone } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useDebounced } from "@/lib/hooks";
import { initials, tint, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks";
import type { Customer } from "@/features/customers/schemas";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const query = useCustomers({ page, q: q || undefined });
  const del = useDeleteCustomer();
  const customers = query.data?.data ?? [];

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
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New customer
          </Button>
        }
      />

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

      {query.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : customers.length === 0 ? (
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
          <div className={cn("transition-opacity", query.isFetching && "opacity-60")}>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th className="hidden sm:table-cell">Contact</Th>
                  <Th className="hidden md:table-cell">Added</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/60">
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

      <CustomerFormDialog open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        title="Delete customer"
        message={`Remove ${deleting?.name}? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}
