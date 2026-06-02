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
  Input,
  PageHeader,
  Select,
} from "../../_components/ui";
import { useStudents } from "../../_lib/store";

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
                        <button className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium">
                          View
                        </button>
                        <button className="px-2 py-1 text-xs rounded-md hover:bg-slate-100">
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
    </>
  );
}
