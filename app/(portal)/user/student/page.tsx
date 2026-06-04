"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Field,
  Input,
  PageHeader,
  Select,
} from "../../_components/ui";
import { addStudents, useStudents, type Student } from "../../_lib/store";

const SECTIONS = [
  "Early Years",
  "Primary School",
  "Middle School",
  "High School",
  "International Programme",
];

const STATUSES: Student["status"][] = ["Active", "On Leave", "Inactive"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function StudentsPage() {
  const students = useStudents();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("");
  const [grade, setGrade] = useState("");
  // Student being viewed (read-only) or edited (form draft).
  const [viewing, setViewing] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);

  const editField =
    <K extends keyof Student>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditing((prev) =>
        prev ? ({ ...prev, [key]: e.target.value } as Student) : prev,
      );

  function saveEdit() {
    if (!editing) return;
    // ID is the record key and is shown read-only, so this upserts in place.
    addStudents([editing]);
    setEditing(null);
  }

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (section && s.section !== section) return false;
      if (grade && s.grade !== grade) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [students, query, section, grade]);

  return (
    <>
      <PageHeader
        title="Students"
        description="Directory of all enrolled students at Brain Bridge School."
        actions={
          <>
            <Link href="/user/student/import">
              <Button variant="secondary">Import</Button>
            </Link>
            <Button>+ Add Student</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Students</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search students…"
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
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-44"
            >
              <option value="">All Sections</option>
              <option>Early Years</option>
              <option>Primary School</option>
              <option>Middle School</option>
              <option>High School</option>
              <option>International Programme</option>
            </Select>
            <Select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-36"
            >
              <option value="">All Grades</option>
              <option>Grade 1</option>
              <option>Grade 5</option>
              <option>Grade 7</option>
              <option>Grade 8</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
              <option>Grade 12</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Student</th>
                <th className="text-left font-semibold px-6 py-3">ID</th>
                <th className="text-left font-semibold px-6 py-3">Section</th>
                <th className="text-left font-semibold px-6 py-3">Grade</th>
                <th className="text-left font-semibold px-6 py-3">Homeroom</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students === null ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    Loading students…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                          {initials(s.name)}
                        </div>
                        <div>
                          <div className="font-medium leading-tight">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-[var(--muted)]">
                      {s.id}
                    </td>
                    <td className="px-6 py-3">{s.section}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">{s.grade}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {s.homeroom}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        tone={s.status === "Active" ? "success" : "warning"}
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/card/create?student=${encodeURIComponent(s.id)}`}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                        >
                          Create Card
                        </Link>
                        <button
                          type="button"
                          onClick={() => setViewing(s)}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...s })}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100"
                        >
                          Edit
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
            Showing {filtered.length} of {students?.length ?? 0}
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

      {/* ===== VIEW MODAL ===== */}
      {viewing && (
        <Modal title="Student details" onClose={() => setViewing(null)}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
              {initials(viewing.name)}
            </div>
            <div>
              <div className="font-semibold leading-tight">{viewing.name}</div>
              <div className="text-xs text-[var(--muted)]">{viewing.email}</div>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Student ID" value={viewing.id} mono />
            <Detail label="Status">
              <Badge tone={viewing.status === "Active" ? "success" : "warning"}>
                {viewing.status}
              </Badge>
            </Detail>
            <Detail label="Section" value={viewing.section} />
            <Detail label="Grade" value={viewing.grade} />
            <Detail label="Homeroom" value={viewing.homeroom} />
            <Detail label="Date of Birth" value={viewing.dob || "—"} />
          </dl>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setViewing(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setEditing({ ...viewing });
                setViewing(null);
              }}
            >
              Edit
            </Button>
          </div>
        </Modal>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editing && (
        <Modal
          title={`Edit ${editing.name || "student"}`}
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" required>
                  <Input
                    value={editing.name}
                    onChange={editField("name")}
                    required
                  />
                </Field>
              </div>
              <Field label="Student ID" hint="Identifier — cannot be changed">
                <Input value={editing.id} readOnly className="bg-slate-50" />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={editing.email}
                  onChange={editField("email")}
                />
              </Field>
              <Field label="Section">
                <Select value={editing.section} onChange={editField("section")}>
                  {!SECTIONS.includes(editing.section) && editing.section && (
                    <option>{editing.section}</option>
                  )}
                  {SECTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Grade">
                <Input value={editing.grade} onChange={editField("grade")} />
              </Field>
              <Field label="Homeroom">
                <Input
                  value={editing.homeroom}
                  onChange={editField("homeroom")}
                />
              </Field>
              <Field label="Status">
                <Select value={editing.status} onChange={editField("status")}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Date of Birth">
                  <Input
                    type="date"
                    value={editing.dob ?? ""}
                    onChange={editField("dob")}
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/** Lightweight centered modal with a backdrop. */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 rounded-md text-[var(--muted)] hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 mx-auto">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** One label/value pair in the View modal. Renders `value` or `children`. */
function Detail({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-0.5 font-mono text-xs text-[var(--foreground)]"
            : "mt-0.5 text-[var(--foreground)]"
        }
      >
        {children ?? value}
      </dd>
    </div>
  );
}
