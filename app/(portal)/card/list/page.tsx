"use client";

import { useMemo, useState } from "react";
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
import type { Student } from "../../_lib/store";

type Status = "Active" | "Expired" | "Revoked" | "Pending";

type CardRow = {
  id: string;
  name: string;
  type: "Student" | "Teacher" | "Staff";
  section: string;
  issued: string;
  expires: string;
  status: Status;
};

const CARDS: CardRow[] = [
  {
    id: "BB25-0001",
    name: "Amelia Hartwell",
    type: "Student",
    section: "High School · Grade 10",
    issued: "2025-09-12",
    expires: "2026-09-12",
    status: "Active",
  },
  {
    id: "BB25-0002",
    name: "Noah Bennett",
    type: "Student",
    section: "Middle School · Grade 7",
    issued: "2025-09-14",
    expires: "2026-09-14",
    status: "Active",
  },
  {
    id: "BB25-T021",
    name: "Ms. Priya Raman",
    type: "Teacher",
    section: "Sciences",
    issued: "2025-08-02",
    expires: "2026-08-02",
    status: "Active",
  },
  {
    id: "BB24-0881",
    name: "Liam Okafor",
    type: "Student",
    section: "Primary School · Grade 5",
    issued: "2024-09-15",
    expires: "2025-09-15",
    status: "Revoked",
  },
  {
    id: "BB25-0003",
    name: "Sofia Martínez",
    type: "Student",
    section: "High School · Grade 11",
    issued: "2025-09-01",
    expires: "2026-09-01",
    status: "Pending",
  },
  {
    id: "BB24-T088",
    name: "Mr. Kenji Watanabe",
    type: "Teacher",
    section: "Mathematics",
    issued: "2024-08-20",
    expires: "2025-08-20",
    status: "Expired",
  },
  {
    id: "BB25-0004",
    name: "Hannah Lindqvist",
    type: "Student",
    section: "Middle School · Grade 8",
    issued: "2025-09-18",
    expires: "2026-09-18",
    status: "Active",
  },
];

const toneFor: Record<Status, "success" | "warning" | "danger" | "info"> = {
  Active: "success",
  Pending: "info",
  Expired: "warning",
  Revoked: "danger",
};

function cardToStudent(c: CardRow): Student {
  return {
    id: c.id,
    name: c.name,
    email: "",
    section: c.type === "Student" ? c.section.split("·")[0]?.trim() || c.section : c.section,
    homeroom: "",
    grade:
      c.type === "Student"
        ? c.section.split("·")[1]?.trim() || c.section
        : c.type,
    status: c.status === "Active" ? "Active" : "Inactive",
  };
}

export default function CardListPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [exportProgress, setExportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARDS.filter((c) => {
      if (type && c.type !== type) return false;
      if (status && c.status !== status) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    });
  }, [query, type, status]);

  async function handleExportAll() {
    if (filtered.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    setExportProgress({ done: 0, total: filtered.length });
    try {
      await exportCardsAsZip(
        filtered.map(cardToStudent),
        `cards-${stamp}.zip`,
        (done, total) => setExportProgress({ done, total }),
      );
    } finally {
      setExportProgress(null);
    }
  }

  async function handleDownloadOne(c: CardRow) {
    setDownloadingId(c.id);
    try {
      await exportSingleCard(cardToStudent(c));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Card List"
        description="All ID cards issued to students, teachers and staff."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleExportAll}
              disabled={filtered.length === 0 || exportProgress !== null}
              title={
                filtered.length === CARDS.length
                  ? "Export all cards as PNG (ZIP)"
                  : `Export ${filtered.length} card${filtered.length === 1 ? "" : "s"} as PNG (ZIP)`
              }
            >
              {exportProgress
                ? `Generating ${exportProgress.done}/${exportProgress.total}…`
                : "Export Cards (ZIP)"}
            </Button>
            <Button>+ Issue Card</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Cards</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search by ID or name…"
                className="w-64 pl-9"
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
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-40"
            >
              <option value="">All Types</option>
              <option>Student</option>
              <option>Teacher</option>
              <option>Staff</option>
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-40"
            >
              <option value="">All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Expired</option>
              <option>Revoked</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Card ID</th>
                <th className="text-left font-semibold px-6 py-3">Holder</th>
                <th className="text-left font-semibold px-6 py-3">Type</th>
                <th className="text-left font-semibold px-6 py-3">Section</th>
                <th className="text-left font-semibold px-6 py-3">Issued</th>
                <th className="text-left font-semibold px-6 py-3">Expires</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    No cards match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">{c.type}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {c.section}
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
                          className="px-2 py-1 text-xs rounded-md hover:bg-red-50 text-red-600"
                        >
                          Revoke
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
            Showing {filtered.length} of {CARDS.length} cards
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
