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
import {
  exportCards,
  exportSingleCard,
  CARD_FRAME_OPTIONS,
  type ExportFormat,
  type CardFrameSize,
} from "../../_lib/exportCards";
import {
  useCards,
  addCards,
  deleteCard,
  type CardRow,
  type CardStatus,
} from "../../_lib/store";
import {
  parseCardFile,
  downloadStudentCsvTemplate,
  downloadStudentXlsxTemplate,
  downloadTeacherCsvTemplate,
  downloadTeacherXlsxTemplate,
  type CardImportKind,
} from "../../_lib/cardCsv";

const toneFor: Record<CardStatus, "success" | "warning" | "danger" | "info"> = {
  Active: "success",
  Pending: "info",
  Expired: "warning",
  Revoked: "danger",
};

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 15V4m0 0-4 4m4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 4v11m0 0-4-4m4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ImportResult = {
  added: number;
  updated: number;
  errors: string[];
} | null;

type Tab = "student" | "teacher";

/** A CSV/Excel "image" cell is either already resolvable (a URL or a data
 *  URI) or a bare filename (e.g. "emma.jpg") that needs a matching photo
 *  file attached after import. */
function isPhotoFilenameRef(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return !/^(https?:)?\/\//i.test(v) && !v.startsWith("data:");
}

function readFileAsDataUrl(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read photo file"));
    reader.readAsDataURL(file);
  });
}

type PendingImport = {
  kind: CardImportKind;
  rows: CardRow[];
  errors: string[];
  photoRefCount: number;
};

export default function CardListPage() {
  const cards = useCards();
  const [tab, setTab] = useState<Tab>("student");
  const [query, setQuery] = useState("");
  const [subType, setSubType] = useState(""); // student tab only: "" | "Student" | "Staff"
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState<ExportFormat>("jpg");
  const [frameSize, setFrameSize] = useState<CardFrameSize>("auto");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportProgress, setExportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [matchingPhotos, setMatchingPhotos] = useState(false);
  const studentFileRef = useRef<HTMLInputElement>(null);
  const teacherFileRef = useRef<HTMLInputElement>(null);
  const photoFilesRef = useRef<HTMLInputElement>(null);

  function switchTab(next: Tab) {
    setTab(next);
    setQuery("");
    setSubType("");
    setStatus("");
    setSelected(new Set());
    setImportResult(null);
  }

  const tabCards = useMemo(
    () =>
      (cards ?? []).filter((c) =>
        tab === "teacher" ? c.type === "Teacher" : c.type !== "Teacher",
      ),
    [cards, tab],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tabCards.filter((c) => {
      if (tab === "student" && subType && c.type !== subType) return false;
      if (status && c.status !== status) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [tabCards, query, subType, status, tab]);

  const totalCount = tabCards.length;

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

  async function handleImportFile(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: CardImportKind,
  ) {
    const file = e.target.files?.[0];
    if (file) {
      setImporting(true);
      setImportResult(null);
      setPendingImport(null);
      try {
        const { rows, errors } = await parseCardFile(file, kind);
        const photoRefCount = rows.filter((r) =>
          isPhotoFilenameRef(r.image),
        ).length;
        if (photoRefCount > 0) {
          // Hold the import until photo files are attached (or skipped) so
          // filenames like "emma.jpg" can be matched up and inlined.
          setPendingImport({ kind, rows, errors, photoRefCount });
        } else if (rows.length > 0) {
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
    e.target.value = "";
  }

  function commitPendingImport(rows: CardRow[], errors: string[]) {
    if (rows.length > 0) {
      const { added, updated } = addCards(rows);
      setImportResult({ added, updated, errors });
    } else {
      setImportResult({ added: 0, updated: 0, errors });
    }
    setPendingImport(null);
  }

  /** Skip photo matching — clears any bare filename refs so they don't try
   *  to render as a broken image, then imports the rows as-is. */
  function handleImportWithoutPhotos() {
    if (!pendingImport) return;
    const rows = pendingImport.rows.map((r) =>
      isPhotoFilenameRef(r.image) ? { ...r, image: "" } : r,
    );
    commitPendingImport(rows, pendingImport.errors);
  }

  async function handlePhotoFilesSelected(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!pendingImport || files.length === 0) return;
    setMatchingPhotos(true);
    try {
      // Match by filename only — if the CSV's "image" cell has a full path
      // (e.g. pasted from Explorer/Finder) rather than a bare filename, strip
      // it down to just the filename before comparing.
      const basename = (value: string) =>
        value.trim().split(/[\\/]/).pop()?.toLowerCase() ?? "";
      const byName = new Map(files.map((f) => [basename(f.name), f]));
      const missingNames: string[] = [];
      const rows = await Promise.all(
        pendingImport.rows.map(async (r) => {
          if (!isPhotoFilenameRef(r.image)) return r;
          const file = byName.get(basename(r.image));
          if (!file) {
            missingNames.push(r.image);
            return { ...r, image: "" };
          }
          return { ...r, image: await readFileAsDataUrl(file) };
        }),
      );
      const errors = [...pendingImport.errors];
      if (missingNames.length > 0) {
        const shown = missingNames.slice(0, 5).join(", ");
        const more =
          missingNames.length > 5 ? ` (+${missingNames.length - 5} more)` : "";
        const attachedList = files.map((f) => f.name).join(", ");
        errors.push(
          `${missingNames.length} row(s) had no matching photo file: ${shown}${more}. ` +
            `Attached files were: ${attachedList}.`,
        );
      }
      commitPendingImport(rows, errors);
    } finally {
      setMatchingPhotos(false);
    }
  }

  const exportList = selected.size > 0 ? selectedInView : filtered;

  async function handleExport() {
    if (exportList.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    setExportProgress({ done: 0, total: exportList.length });
    try {
      await exportCards(
        exportList,
        `${tab}-cards-${stamp}`,
        format,
        frameSize,
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
      await exportSingleCard(c, format, frameSize);
    } finally {
      setDownloadingId(null);
    }
  }

  const rowDownloadLabel = format.toUpperCase();
  const exportFormatLabel = format === "pdf" ? "PDF" : "ZIP";
  const exportLabel = exportProgress
    ? `Generating ${exportProgress.done}/${exportProgress.total}…`
    : selected.size > 0
      ? `Export Selected (${selectedInView.length})`
      : `Export All (${exportFormatLabel})`;

  const isTeacherTab = tab === "teacher";

  return (
    <>
      <input
        ref={studentFileRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv"
        className="hidden"
        onChange={(e) => handleImportFile(e, "student")}
      />
      <input
        ref={teacherFileRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv"
        className="hidden"
        onChange={(e) => handleImportFile(e, "teacher")}
      />
      <input
        ref={photoFilesRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoFilesSelected}
      />
      <PageHeader
        title="Card List"
        description="All ID cards issued to students, teachers and staff. Students and teachers each have their own import/export template."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                (isTeacherTab ? teacherFileRef : studentFileRef).current?.click()
              }
              disabled={importing}
            >
              <UploadIcon />
              {importing
                ? "Importing…"
                : `Import ${isTeacherTab ? "Teacher" : "Student"}`}
            </Button>

            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border)] bg-slate-50 p-1.5">
              <span className="hidden pl-1 text-xs font-medium text-[var(--muted)] sm:inline">
                Download as
              </span>
              <div className="w-20 shrink-0">
                <Select
                  aria-label="Download format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                >
                  <option value="jpg">JPG</option>
                  <option value="pdf">PDF</option>
                </Select>
              </div>
              <div className="w-48 shrink-0">
                <Select
                  aria-label="Card size"
                  value={frameSize}
                  onChange={(e) => setFrameSize(e.target.value as CardFrameSize)}
                >
                  {CARD_FRAME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
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
                <DownloadIcon />
                {exportLabel}
              </Button>
            </div>

            <Link href="/card/create">
              <Button>
                <PlusIcon />
                Issue Card
              </Button>
            </Link>
          </>
        }
      />

      {/* Student / Teacher tabs — each list has its own import, export and
          template since the two card types don't share the same fields. */}
      <div className="mb-4 inline-flex rounded-lg border border-[var(--border)] bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchTab("student")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "student"
              ? "bg-white text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Student Cards
        </button>
        <button
          type="button"
          onClick={() => switchTab("teacher")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "teacher"
              ? "bg-white text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Teacher Cards
        </button>
      </div>

      {/* Import help / template downloads */}
      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">
              Bulk import:
            </span>{" "}
            download the {isTeacherTab ? "teacher" : "student"} template, fill
            one row per {isTeacherTab ? "teacher" : "student"} card, then use{" "}
            <span className="font-medium">
              Import {isTeacherTab ? "Teacher" : "Student"}
            </span>{" "}
            (CSV or Excel). For the{" "}
            <span className="font-medium">image</span> column, paste a photo
            URL, or just the photo's filename (e.g.{" "}
            <span className="font-mono text-xs">emma.jpg</span>) and attach
            the matching photo files right after importing.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={
                isTeacherTab ? downloadTeacherCsvTemplate : downloadStudentCsvTemplate
              }
            >
              ↓ CSV template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={
                isTeacherTab
                  ? downloadTeacherXlsxTemplate
                  : downloadStudentXlsxTemplate
              }
            >
              ↓ Excel template
            </Button>
          </div>
        </CardBody>
      </Card>

      {pendingImport && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {pendingImport.rows.length} row(s) parsed —{" "}
              <span className="font-medium">
                {pendingImport.photoRefCount} reference a photo filename
              </span>{" "}
              instead of a URL. Attach those photo files to match them up, or
              import without photos.
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => photoFilesRef.current?.click()}
                disabled={matchingPhotos}
              >
                {matchingPhotos ? "Matching…" : "Attach Photos"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImportWithoutPhotos}
                disabled={matchingPhotos}
              >
                Import without Photos
              </Button>
            </div>
          </div>
        </div>
      )}

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
                ` ${importResult.errors.length} row(s) had warnings — see below.`}
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
            {isTeacherTab ? "Teacher Cards" : "Student Cards"}
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
            {!isTeacherTab && (
              <div className="w-full sm:w-40">
                <Select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option>Student</option>
                  <option>Staff</option>
                </Select>
              </div>
            )}
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
                {!isTeacherTab && (
                  <th className="text-left font-semibold px-6 py-3">Type</th>
                )}
                <th className="text-left font-semibold px-6 py-3">
                  {isTeacherTab ? "Department" : "Section"}
                </th>
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
                    colSpan={isTeacherTab ? 7 : 8}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    Loading cards…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isTeacherTab ? 7 : 8}
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
                    {!isTeacherTab && (
                      <td className="px-6 py-3 text-[var(--muted)]">
                        {c.type}
                      </td>
                    )}
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
                          {downloadingId === c.id ? "…" : rowDownloadLabel}
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
