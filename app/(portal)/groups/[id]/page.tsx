"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageHeader,
} from "../../_components/ui";
import {
  deleteGroup,
  useGroups,
  useStudents,
  type Student,
} from "../../_lib/store";
import {
  exportCardsAsZip,
  exportSingleCard,
} from "../../_lib/exportCards";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groups = useGroups();
  const students = useStudents();
  const [exportProgress, setExportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const group = useMemo(() => {
    if (!groups) return null;
    return groups.find((g) => g.id === params.id) ?? null;
  }, [groups, params.id]);

  const members = useMemo(() => {
    if (!group || !students) return [];
    const byId = new Map(students.map((s) => [s.id, s]));
    return group.studentIds
      .map((id) => byId.get(id))
      .filter((s): s is Student => Boolean(s));
  }, [group, students]);

  const missingCount =
    group && students ? group.studentIds.length - members.length : 0;

  async function handleExportAll() {
    if (!group || members.length === 0) return;
    const safe = group.name.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
    const stamp = new Date().toISOString().slice(0, 10);
    setExportProgress({ done: 0, total: members.length });
    try {
      await exportCardsAsZip(
        members,
        `cards-${safe || "group"}-${group.homeroom}-${stamp}.zip`,
        "auto",
        (done, total) => setExportProgress({ done, total }),
      );
    } finally {
      setExportProgress(null);
    }
  }

  async function handleDownloadOne(s: Student) {
    setDownloadingId(s.id);
    try {
      await exportSingleCard(s);
    } finally {
      setDownloadingId(null);
    }
  }

  if (groups === null || students === null) {
    return (
      <>
        <PageHeader title="Group" />
        <Card>
          <CardBody className="text-sm text-[var(--muted)]">Loading…</CardBody>
        </Card>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <PageHeader
          title="Group not found"
          actions={
            <Link href="/groups">
              <Button variant="ghost">← Back to Groups</Button>
            </Link>
          }
        />
        <Card>
          <CardBody className="text-sm text-[var(--muted)]">
            This group no longer exists. It may have been deleted.
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={group.name}
        description={
          group.description ||
          `Members of class ${group.homeroom} in this group.`
        }
        actions={
          <>
            <Link href="/groups">
              <Button variant="ghost">← Back to Groups</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={handleExportAll}
              disabled={members.length === 0 || exportProgress !== null}
            >
              {exportProgress
                ? `Generating ${exportProgress.done}/${exportProgress.total}…`
                : "Export Cards (ZIP)"}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(`Delete group "${group.name}"?`)) {
                  deleteGroup(group.id);
                  router.push("/groups");
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Class
            </div>
            <div className="mt-1 text-lg font-semibold">{group.homeroom}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Members
            </div>
            <div className="mt-1 text-lg font-semibold">{members.length}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Created
            </div>
            <div className="mt-1 text-lg font-semibold">
              {new Date(group.createdAt).toLocaleDateString()}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Group ID
            </div>
            <div className="mt-1 text-xs font-mono break-all">{group.id}</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-wrap">
          <div className="flex items-center gap-2">
            <CardTitle>Students in this group</CardTitle>
            <Badge tone="info">Class {group.homeroom}</Badge>
            {missingCount > 0 && (
              <Badge tone="warning">
                {missingCount} no longer enrolled
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportAll}
            disabled={members.length === 0 || exportProgress !== null}
          >
            {exportProgress
              ? `Generating ${exportProgress.done}/${exportProgress.total}…`
              : "Export Cards (ZIP)"}
          </Button>
        </CardHeader>

        {members.length === 0 ? (
          <CardBody className="text-center py-12 text-sm text-[var(--muted)]">
            This group has no current members.
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Student</th>
                  <th className="text-left font-semibold px-6 py-3">Card ID</th>
                  <th className="text-left font-semibold px-6 py-3">Section</th>
                  <th className="text-left font-semibold px-6 py-3">Grade</th>
                  <th className="text-left font-semibold px-6 py-3">Homeroom</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-right font-semibold px-6 py-3">Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {members.map((s) => (
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
                      <button
                        type="button"
                        onClick={() => handleDownloadOne(s)}
                        disabled={downloadingId !== null}
                        className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium disabled:opacity-50"
                      >
                        {downloadingId === s.id ? "…" : "Download PNG"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
