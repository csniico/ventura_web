"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { StatusPill } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { money } from "@/lib/format";
import { useResource, useDeleteResource } from "@/features/resources/hooks";
import { ResourceFormDialog } from "@/features/resources/resource-form-dialog";
import { StockAdjustDialog } from "@/features/resources/stock-adjust-dialog";
import { StockHistory } from "@/features/resources/stock-history";

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const resource = useResource(id);
  const del = useDeleteResource();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  if (resource.isLoading) return <FullPageSpinner />;
  if (resource.isError || !resource.data) {
    return (
      <Card className="p-10 text-center text-sm text-zinc-500">
        Item not found.{" "}
        <Link href="/products" className="font-medium text-primary-600 hover:underline">
          Back to products
        </Link>
      </Card>
    );
  }

  const r = resource.data;
  const isProduct = r.type === "product";
  const outOfStock = isProduct && r.availableQuantity <= 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/products")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" /> Products &amp; Services
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {r.primaryImage ? (
            <Image
              src={r.primaryImage}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="size-16 rounded-2xl object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-300">
              <Package className="size-7" />
            </span>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{r.name}</h1>
            <StatusPill tone="neutral">{r.type}</StatusPill>
          </div>
        </div>
        <div className="flex gap-2">
          {isProduct && (
            <Button variant="secondary" size="sm" onClick={() => setAdjustOpen(true)}>
              <SlidersHorizontal className="size-4" /> Adjust stock
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Pricing &amp; stock</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Price</dt>
              <dd className="font-semibold text-zinc-900">{money(r.price)}</dd>
            </div>
            {isProduct && (
              <>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">In stock</dt>
                  <dd className="flex items-center gap-2 text-zinc-900">
                    {r.availableQuantity}
                    {outOfStock ? (
                      <StatusPill tone="danger">Out</StatusPill>
                    ) : r.isLowStock ? (
                      <StatusPill tone="warning">Low</StatusPill>
                    ) : null}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Low-stock alert at</dt>
                  <dd className="text-zinc-700">{r.lowStockThreshold}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {r.description && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">Description</h2>
              <p className="text-sm leading-relaxed text-zinc-600">{r.description}</p>
            </Card>
          )}
          {r.notes && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">Notes</h2>
              <p className="text-sm leading-relaxed text-zinc-600">{r.notes}</p>
            </Card>
          )}
          {/* Services have no stock, so no ledger. */}
          {isProduct && <StockHistory resourceId={r.id} />}
        </div>
      </div>

      <ResourceFormDialog open={editOpen} onClose={() => setEditOpen(false)} resource={r} />
      {isProduct && (
        <StockAdjustDialog open={adjustOpen} onClose={() => setAdjustOpen(false)} resource={r} />
      )}
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => del.mutate(r.id, { onSuccess: () => router.push("/products") })}
        title="Delete item"
        message={`Remove ${r.name}? This can't be undone.`}
        loading={del.isPending}
      />
    </div>
  );
}
