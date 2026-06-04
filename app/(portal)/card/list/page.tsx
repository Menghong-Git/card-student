"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
  Select,
} from "../../_components/ui";
import { exportCardsAsZip, exportSingleCard } from "../../_lib/exportCards";
import {
  useCards,
  addCards,
  deleteCard,
  type CardRow,
  type CardStatus,
  type Student,
} from "../../_lib/store";
import {
  parseCardFile,
  downloadCsvTemplate,
  downloadXlsxTemplate,
} from "../../_lib/cardCsv";

const toneFor: Record<CardStatus, "success" | "warning" | "danger" | "info"> = {
  Active: "success",
  Pending: "info",
  Expired: "warning",
  Revoked: "danger",
};

function cardToStudent(c: CardRow): Student {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    section: c.section,
    homeroom: "",
    grade: c.grade || c.type,
    status: c.status === "Active" ? "Active" : "Inactive",
    dob: c.dob,
    photo: c.image,
  };
}

type ImportResult = {
  added: number;
  updated: number;
  errors: string[];
} | null;

export default function CardListPage() {
  const cards = useCards();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportProgress, setExportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (cards ?? []).filter((c) => {
      if (type && c.type !== type) return false;
      if (status && c.status !== status) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [cards, query, type, status]);

  const totalCount = cards?.length ?? 0;

  const selectedInView = filtered.filter((c) => selected.has(c.id));
  const allSelected =
    filtered.length > 0 && selectedInView.length === filtered.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach((c) => next.delete(c.id));
      } else {
        filtered.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImporting(true);
      setImportResult(null);
      try {
        const { rows, errors } = await parseCardFile(file);
        if (rows.length > 0) {
          const { added, updated } = addCards(rows);
          setImportResult({ added, updated, errors });
        } else {
          setImportResult({ added: 0, updated: 0, errors });
        }
      } catch (err) {
        setImportResult({
          added: 0,
          updated: 0,
          errors: [
            `Could not read the file: ${err instanceof Error ? err.message : String(err)}`,
          ],
        });
      } finally {
        setImporting(false);
      }
    }
    // Reset so re-selecting the same file fires change again.
    if (fileRef.current) fileRef.current.value = "";
  }

  const exportList = selected.size > 0 ? selectedInView : filtered;

  async function handleExport() {
    if (exportList.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    setExportProgress({ done: 0, total: exportList.length });
    try {
      await exportCardsAsZip(
        exportList.map(cardToStudent),
        `cards-${stamp}.zip`,
        (done, total) => setExportProgress({ done, total }),
      );
    } finally {
      setExportProgress(null);
    }
  }

  function handleDelete(c: CardRow) {
    if (!window.confirm(`Delete card ${c.id} (${c.name})? This cannot be undone.`))
      return;
    deleteCard(c.id);
    setSelected((prev) => {
      if (!prev.has(c.id)) return prev;
      const next = new Set(prev);
      next.delete(c.id);
      return next;
    });
  }

  async function handleDownloadOne(c: CardRow) {
    setDownloadingId(c.id);
    try {
      await exportSingleCard(cardToStudent(c));
    } finally {
      setDownloadingId(null);
    }
  }

  const exportLabel = exportProgress
    ? `Generating ${exportProgress.done}/${exportProgress.total}…`
    : selected.size > 0
      ? `Export Selected (${selectedInView.length})`
      : "Export All (ZIP)";

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv"
        className="hidden"
        onChange={handleImportFile}
      />
      <PageHeader
        title="Card List"
        description="All ID cards issued to students, teachers and staff. Import from CSV/Excel — one row per card."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importing…" : "Import CSV / Excel"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={exportList.length === 0 || exportProgress !== null}
              title={
                selected.size > 0
                  ? `Export ${selectedInView.length} selected card(s)`
                  : `Export all ${filtered.length} card(s) in view`
              }
            >
              {exportLabel}
            </Button>
            <Link href="/card/create">
              <Button>+ Issue Card</Button>
            </Link>
          </>
        }
      />

      {/* Import help / template downloads */}
      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">
              Bulk import:
            </span>{" "}
            download a template, fill one row per student card, then use{" "}
            <span className="font-medium">Import CSV / Excel</span>.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadCsvTemplate}>
              ↓ CSV template
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadXlsxTemplate}>
              ↓ Excel template
            </Button>
          </div>
        </CardBody>
      </Card>

      {importResult && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            importResult.added + importResult.updated > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>
              {importResult.added + importResult.updated > 0
                ? `Imported ${importResult.added} new card(s)` +
                  (importResult.updated
                    ? ` and updated ${importResult.updated}.`
                    : ".")
                : "No cards were imported."}
              {importResult.errors.length > 0 &&
                ` ${importResult.errors.length} row(s) skipped.`}
            </span>
            <button
              type="button"
              onClick={() => setImportResult(null)}
              className="text-xs underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {importResult.errors.slice(0, 6).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {importResult.errors.length > 6 && (
                <li>…and {importResult.errors.length - 6} more.</li>
              )}
            </ul>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>
            All Cards
            {selected.size > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                · {selected.size} selected ·{" "}
                <button
                  type="button"
                  onClick={clearSelection}
                  className="underline hover:text-[var(--foreground)]"
                >
                  clear
                </button>
              </span>
            )}
          </CardTitle>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search by ID or name…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted)]"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m20 20-3.2-3.2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="w-full sm:w-40">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                <option>Student</option>
                <option>Teacher</option>
                <option>Staff</option>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Expired</option>
                <option>Revoked</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={filtered.length === 0}
                    className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                  />
                </th>
                <th className="text-left font-semibold px-6 py-3">Card ID</th>
                <th className="text-left font-semibold px-6 py-3">Name</th>
                <th className="text-left font-semibold px-6 py-3">Type</th>
                <th className="text-left font-semibold px-6 py-3">Section</th>
                <th className="text-left font-semibold px-6 py-3">Intake</th>
                <th className="text-left font-semibold px-6 py-3">Expires</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cards === null ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    Loading cards…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    No cards match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={
                      selected.has(c.id)
                        ? "bg-[var(--primary)]/5"
                        : "hover:bg-slate-50/60"
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.id}`}
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                      />
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-6 py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-[var(--border)] bg-slate-100"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500">
                            {c.name
                              .split(" ")
                              .map((p) => p[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                        )}
                        <div className="leading-tight">
                          <div>{c.name}</div>
                          {c.email && (
                            <div className="text-[11px] font-normal text-[var(--muted)]">
                              {c.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">{c.type}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {[c.section, c.grade].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {c.issued}
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {c.expires}
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={toneFor[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadOne(c)}
                          disabled={downloadingId !== null}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium disabled:opacity-50"
                        >
                          {downloadingId === c.id ? "…" : "PNG"}
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--foreground)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="px-2 py-1 text-xs rounded-md hover:bg-red-50 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <CardBody className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            Showing {filtered.length} of {totalCount} cards
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="secondary" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
