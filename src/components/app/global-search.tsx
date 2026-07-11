"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CalendarDays,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { money, formatDate } from "@/lib/format";
import { Spinner } from "@/components/ui/misc";
import { useDebounced } from "@/lib/hooks";
import { useSearch } from "@/features/search/hooks";

interface ResultRow {
  key: string;
  href: string;
  icon: LucideIcon;
  primary: string;
  secondary?: string;
  trailing?: string;
}

/** Trigger button + ⌘K command palette for global search. */
export function GlobalSearch({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {variant === "sidebar" ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-400 shadow-sm transition-colors hover:border-zinc-300"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[10px] font-medium text-zinc-400">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
        >
          <Search className="size-5" />
        </button>
      )}

      {open && <SearchPalette onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term, 250);
  const search = useSearch(debounced);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const rows = useMemo<ResultRow[]>(() => {
    const d = search.data;
    if (!d) return [];
    return [
      ...d.customers.map((c) => ({
        key: `c-${c.id}`,
        href: `/customers/${c.id}`,
        icon: Users,
        primary: c.name,
        secondary: c.email ?? c.phone ?? "Customer",
      })),
      ...d.resources.map((r) => ({
        key: `r-${r.id}`,
        href: `/products/${r.id}`,
        icon: Package,
        primary: r.name,
        secondary: r.type,
        trailing: money(r.price),
      })),
      ...d.orders.map((o) => ({
        key: `o-${o.id}`,
        href: `/orders/${o.id}`,
        icon: ShoppingCart,
        primary: o.orderNumber,
        secondary: o.customerName,
        trailing: money(o.totalAmount),
      })),
      ...d.invoices.map((i) => ({
        key: `i-${i.id}`,
        href: `/invoices/${i.id}`,
        icon: FileText,
        primary: i.invoiceNumber,
        secondary: i.customerName ?? "Invoice",
        trailing: money(i.totalAmount),
      })),
      ...d.appointments.map((a) => ({
        key: `a-${a.id}`,
        href: `/calendar`,
        icon: CalendarDays,
        primary: a.title,
        secondary: formatDate(a.start),
      })),
    ];
  }, [search.data]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  const hasQuery = debounced.trim().length >= 2;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative z-10 flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
          <Search className="size-5 text-zinc-400" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search customers, products, orders, invoices…"
            className="h-14 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          {search.isFetching && hasQuery && <Spinner className="size-4" />}
        </div>

        <div className="overflow-y-auto p-2">
          {!hasQuery ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-400">
              Type at least 2 characters to search.
            </p>
          ) : rows.length === 0 && !search.isFetching ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-400">
              No results for “{debounced.trim()}”.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {rows.map((row) => (
                <li key={row.key}>
                  <button
                    onClick={() => go(row.href)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
                      <row.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-900">
                        {row.primary}
                      </span>
                      {row.secondary && (
                        <span className="block truncate text-xs capitalize text-zinc-400">
                          {row.secondary}
                        </span>
                      )}
                    </span>
                    {row.trailing && (
                      <span className="text-sm font-medium text-zinc-600">{row.trailing}</span>
                    )}
                    <CornerDownLeft className="size-4 shrink-0 text-zinc-300 opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
