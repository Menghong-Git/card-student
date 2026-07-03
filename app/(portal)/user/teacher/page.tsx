"use client";

import Link from "next/link";
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
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
import { addTeachers, useTeachers, type Teacher } from "../../_lib/store";

const DEPARTMENTS = [
  "Primary School",
  "Mathematics",
  "Sciences",
  "Languages & Humanities",
  "Arts & Music",
  "Physical Education",
];

const STATUSES: Teacher["status"][] = ["Active", "On Leave", "Inactive"];

function initials(name: string) {
  return name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function statusTone(
  status: Teacher["status"],
): "success" | "warning" | "danger" {
  if (status === "Active") return "success";
  if (status === "On Leave") return "warning";
  return "danger";
}

export default function TeachersPage() {
  const teachers = useTeachers();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [viewing, setViewing] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const editField =
    <K extends keyof Teacher>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditing((prev) => {
        if (!prev) return prev;
        const value =
          key === "classes" ? Number(e.target.value) : e.target.value;
        return { ...prev, [key]: value } as Teacher;
      });

  function saveEdit() {
    if (!editing) return;
    addTeachers([editing]);
    setEditing(null);
  }

  const filtered = useMemo(() => {
    if (!teachers) return [];
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (department && t.department !== department) return false;
      if (status && t.status !== status) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q)
      );
    });
  }, [teachers, query, department, status]);

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Teachers and instructional staff across all departments."
        actions={
          <>
            <Button variant="secondary">Import</Button>
            <Button>+ Add Teacher</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Teachers</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search teachers..."
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
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-48"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-36"
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Teacher</th>
                <th className="text-left font-semibold px-6 py-3">ID</th>
                <th className="text-left font-semibold px-6 py-3">Title</th>
                <th className="text-left font-semibold px-6 py-3">
                  Department
                </th>
                <th className="text-left font-semibold px-6 py-3">Joined</th>
                <th className="text-left font-semibold px-6 py-3">Classes</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {teachers === null ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-[var(--muted)]"
                  >
                    No teachers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                          {initials(t.name)}
                        </div>
                        <div>
                          <div className="font-medium leading-tight">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {t.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-[var(--muted)]">
                      {t.id}
                    </td>
                    <td className="px-6 py-3">{t.title}</td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {t.department}
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {t.joined || "-"}
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">
                      {t.classes}
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/card/create?teacher=${encodeURIComponent(t.id)}`}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                        >
                          Create Card
                        </Link>
                        <button
                          type="button"
                          onClick={() => setViewing(t)}
                          className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...t })}
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
            Showing {filtered.length} of {teachers?.length ?? 0}
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

      {viewing && (
        <Modal title="Teacher details" onClose={() => setViewing(null)}>
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
            <Detail label="Teacher ID" value={viewing.id} mono />
            <Detail label="Status">
              <Badge tone={statusTone(viewing.status)}>{viewing.status}</Badge>
            </Detail>
            <Detail label="Title" value={viewing.title} />
            <Detail label="Department" value={viewing.department} />
            <Detail label="Date of Joining" value={viewing.joined || "-"} />
            <Detail label="Classes" value={viewing.classes} />
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

      {editing && (
        <Modal
          title={`Edit ${editing.name || "teacher"}`}
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
              <Field label="Teacher ID" hint="Identifier - cannot be changed">
                <Input value={editing.id} readOnly className="bg-slate-50" />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={editing.email}
                  onChange={editField("email")}
                />
              </Field>
              <Field label="Title">
                <Input value={editing.title} onChange={editField("title")} />
              </Field>
              <Field label="Department">
                <Select
                  value={editing.department}
                  onChange={editField("department")}
                >
                  {!DEPARTMENTS.includes(editing.department) &&
                    editing.department && <option>{editing.department}</option>}
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Classes">
                <Input
                  type="number"
                  min={0}
                  value={editing.classes}
                  onChange={editField("classes")}
                />
              </Field>
              <Field label="Date of Joining">
                <Input
                  type="date"
                  value={editing.joined ?? ""}
                  onChange={editField("joined")}
                />
              </Field>
              <Field label="Status">
                <Select value={editing.status} onChange={editField("status")}>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
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

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
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

function Detail({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
  children?: ReactNode;
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
