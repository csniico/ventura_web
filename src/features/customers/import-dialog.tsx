"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/csv";
import { useImportCustomers } from "./hooks";
import type { ImportRow } from "./api";

function toRows(text: string): ImportRow[] {
  return parseCsv(text)
    .map((r) => ({
      name: r.name ?? "",
      email: r.email || undefined,
      phone: r.phone || undefined,
      notes: r.notes || undefined,
    }))
    .filter((r) => r.name.trim() !== "");
}

export function ImportCustomersDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importer = useImportCustomers();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  const rows = useMemo(() => toRows(text), [text]);
  const hasNameColumn = useMemo(() => {
    const first = parseCsv(text)[0];
    return first ? "name" in first : false;
  }, [text]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then(setText);
  };

  const submit = () => {
    if (rows.length === 0) return;
    importer.mutate(rows, {
      onSuccess: () => {
        setText("");
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import customers"
      description="Upload or paste a CSV with a header row."
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Columns: <code className="rounded bg-zinc-100 px-1">name</code> (required),{" "}
            <code className="rounded bg-zinc-100 px-1">email</code>,{" "}
            <code className="rounded bg-zinc-100 px-1">phone</code>,{" "}
            <code className="rounded bg-zinc-100 px-1">notes</code>
          </p>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Upload CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onFile} />
        </div>

        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"name,email,phone,notes\nAma Mensah,ama@example.com,+233...,VIP"}
          className="font-mono text-xs"
        />

        <div className="flex items-center justify-between text-sm">
          {text.trim() === "" ? (
            <span className="text-zinc-400">Paste CSV or upload a file.</span>
          ) : !hasNameColumn ? (
            <span className="text-red-600">No “name” column found in the header row.</span>
          ) : (
            <span className="text-zinc-600">
              <span className="font-semibold text-zinc-900">{rows.length}</span> valid customer
              {rows.length === 1 ? "" : "s"} ready to import
            </span>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} loading={importer.isPending} disabled={rows.length === 0}>
          Import {rows.length > 0 ? rows.length : ""}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
