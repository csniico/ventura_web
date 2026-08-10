"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/csv";
import { useImportCustomers } from "./hooks";
import type { ImportRow, ImportResult } from "./api";

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

interface Outcome {
  result: ImportResult;
  rows: ImportRow[];
}

export function ImportCustomersDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importer = useImportCustomers();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const rows = useMemo(() => toRows(text), [text]);
  const hasNameColumn = useMemo(() => {
    const first = parseCsv(text)[0];
    return first ? "name" in first : false;
  }, [text]);

  const close = () => {
    setText("");
    setOutcome(null);
    onClose();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then((t) => {
      setOutcome(null);
      setText(t);
    });
  };

  const submit = () => {
    if (rows.length === 0) return;
    const submitted = rows;
    importer.mutate(submitted, {
      onSuccess: (result) => {
        const issues = result.skipped.length + result.failed.length;
        if (issues > 0) {
          setOutcome({ result, rows: submitted }); // keep the CSV so they can fix + retry
        } else {
          close();
        }
      },
    });
  };

  const problems = outcome
    ? [...outcome.result.failed, ...outcome.result.skipped].sort((a, b) => a.index - b.index)
    : [];

  return (
    <Dialog
      open={open}
      onClose={close}
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
          rows={7}
          value={text}
          onChange={(e) => {
            setOutcome(null);
            setText(e.target.value);
          }}
          placeholder={"name,email,phone,notes\nAma Mensah,ama@example.com,+233...,VIP"}
          className="font-mono text-xs"
        />

        {/* Per-row results after an import that had issues */}
        {outcome && problems.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
              <AlertTriangle className="size-4" />
              Imported {outcome.result.created.length} · {problems.length} couldn&apos;t be imported
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
              {problems.map((p, i) => {
                const name = outcome.rows[p.index]?.name;
                return (
                  <li key={i} className="text-xs text-amber-700">
                    <span className="font-medium">Row {p.index + 1}</span>
                    {name ? ` (${name})` : ""}: {p.reason}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-amber-600">Fix these rows above and import again.</p>
          </div>
        )}

        {!outcome && (
          <div className="text-sm">
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
        )}
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={close}>
          {outcome ? "Done" : "Cancel"}
        </Button>
        <Button onClick={submit} loading={importer.isPending} disabled={rows.length === 0}>
          Import {rows.length > 0 ? rows.length : ""}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
