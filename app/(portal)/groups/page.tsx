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
} from "../_components/ui";
import { deleteGroup, useGroups, useStudents } from "../_lib/store";

export default function GroupsPage() {
  const groups = useGroups();
  const students = useStudents();
  const [query, setQuery] = useState("");

  const studentNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of students ?? []) m.set(s.id, s.name);
    return m;
  }, [students]);

  const filtered = useMemo(() => {
    if (!groups) return [];
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.homeroom.toLowerCase().includes(q),
    );
  }, [groups, query]);

  return (
    <>
      <PageHeader
        title="Groups"
        description="Organize students from a single class into focused groups."
        actions={
          <Link href="/groups/create">
            <Button>+ Create Group</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Groups</CardTitle>
          <div className="relative">
            <Input
              placeholder="Search groups…"
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
        </CardHeader>

        {groups === null ? (
          <CardBody className="text-sm text-[var(--muted)]">
            Loading groups…
          </CardBody>
        ) : filtered.length === 0 ? (
          <CardBody className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-[var(--muted)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm4 9c-.5-3-3.5-5-8-5s-7.5 2-8 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold">No groups yet</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Create your first group to organize students by class.
            </p>
            <div className="mt-4">
              <Link href="/groups/create">
                <Button>+ Create Group</Button>
              </Link>
            </div>
          </CardBody>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((g) => (
              <li
                key={g.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/60"
              >
                <Link
                  href={`/groups/${g.id}`}
                  className="h-10 w-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold"
                >
                  {g.name.slice(0, 2).toUpperCase()}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/groups/${g.id}`}
                      className="font-medium leading-tight hover:underline"
                    >
                      {g.name}
                    </Link>
                    <Badge tone="info">Class {g.homeroom}</Badge>
                    <Badge tone="neutral">
                      {g.studentIds.length} student
                      {g.studentIds.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  {g.description && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {g.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[var(--muted)] line-clamp-1">
                    {g.studentIds
                      .map((id) => studentNameById.get(id) ?? id)
                      .slice(0, 6)
                      .join(", ")}
                    {g.studentIds.length > 6 && ` +${g.studentIds.length - 6} more`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[var(--muted)] mr-2">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/groups/${g.id}`}
                    className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete group "${g.name}"?`)) deleteGroup(g.id);
                    }}
                    className="px-2 py-1 text-xs rounded-md hover:bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
