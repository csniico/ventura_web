"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { StatusPill } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { initials, tint, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  usePlatformUser,
  useSoftDeleteUser,
  useRestoreUser,
  useHardDeleteUser,
} from "@/features/admin/hooks";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = usePlatformUser(id);
  const suspend = useSoftDeleteUser();
  const restore = useRestoreUser();
  const hardDelete = useHardDeleteUser();
  const [suspending, setSuspending] = useState(false);
  const [purging, setPurging] = useState(false);

  if (user.isLoading) return <FullPageSpinner />;
  if (user.isError || !user.data) {
    return (
      <Card className="p-10 text-center text-sm text-zinc-500">
        User not found.{" "}
        <Link href="/admin/users" className="font-medium text-primary-600 hover:underline">
          Back to users
        </Link>
      </Card>
    );
  }

  const u = user.data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/users")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" /> Platform users
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "grid size-16 place-items-center rounded-2xl text-lg font-semibold",
              tint(u.name),
            )}
          >
            {initials(u.name)}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{u.name}</h1>
            <p className="text-sm text-zinc-500">{u.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
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
          </div>
        </div>

        <div className="flex gap-2">
          {u.deleted ? (
            <Button
              variant="secondary"
              size="sm"
              loading={restore.isPending}
              onClick={() => restore.mutate(u.id)}
            >
              <RotateCcw className="size-4" /> Restore
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={u.isSystem}
              onClick={() => setSuspending(true)}
            >
              <Ban className="size-4" /> Suspend
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={u.isSystem}
            onClick={() => setPurging(true)}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Account</h2>
        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <Line label="User id" value={<span className="font-mono text-xs">{u.id}</span>} />
          <Line label="Short id" value={u.shortId ?? "—"} />
          <Line
            label="Business"
            value={
              u.businessId ? <span className="font-mono text-xs">{u.businessId}</span> : "None"
            }
          />
          <Line label="Email verified" value={u.isEmailVerified ? "Yes" : "No"} />
          <Line label="Active" value={u.isActive ? "Yes" : "No"} />
          <Line label="Joined" value={formatDateTime(u.createdAt)} />
          {u.deleted && <Line label="Suspended at" value={formatDateTime(u.deletedAt)} />}
        </dl>
      </Card>

      <ConfirmDialog
        open={suspending}
        onClose={() => setSuspending(false)}
        onConfirm={() => suspend.mutate(u.id, { onSuccess: () => setSuspending(false) })}
        title="Suspend account"
        message={`Suspend ${u.email}? They lose access immediately, and you can restore the account afterwards.`}
        confirmLabel="Suspend"
        loading={suspend.isPending}
      />
      <ConfirmDialog
        open={purging}
        onClose={() => setPurging(false)}
        onConfirm={() =>
          hardDelete.mutate(u.id, { onSuccess: () => router.push("/admin/users") })
        }
        title="Delete permanently"
        message={`Permanently delete ${u.email}? The account is erased and this cannot be undone or restored.`}
        confirmLabel="Delete forever"
        loading={hardDelete.isPending}
      />
    </div>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-50 py-1 last:border-0">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-900">{value}</dd>
    </div>
  );
}
