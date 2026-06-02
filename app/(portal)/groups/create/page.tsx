"use client";

import { useRouter } from "next/navigation";
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
  Textarea,
} from "../../_components/ui";
import { addGroup, useStudents, type Group } from "../../_lib/store";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function CreateGroupPage() {
  const router = useRouter();
  const students = useStudents();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [homeroom, setHomeroom] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const homerooms = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map((s) => s.homeroom)))
      .filter((h) => h && h !== "—")
      .sort();
  }, [students]);

  const classStudents = useMemo(() => {
    if (!students || !homeroom) return [];
    return students.filter((s) => s.homeroom === homeroom);
  }, [students, homeroom]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === classStudents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(classStudents.map((s) => s.id)));
    }
  }

  function handleHomeroomChange(next: string) {
    setHomeroom(next);
    setSelected(new Set());
  }

  function canSubmit() {
    return (
      name.trim().length > 0 && homeroom.length > 0 && selected.size > 0
    );
  }

  function submit() {
    if (!canSubmit()) return;
    setSubmitting(true);
    const group: Group = {
      id: `GRP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name: name.trim(),
      description: description.trim(),
      homeroom,
      studentIds: Array.from(selected),
      createdAt: new Date().toISOString(),
    };
    addGroup(group);
    router.push("/groups");
  }

  return (
    <>
      <PageHeader
        title="Create Group"
        description="Groups can only contain students from a single class."
        actions={
          <Button variant="ghost" onClick={() => router.push("/groups")}>
            ← Back to Groups
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Group details</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Group name" required>
              <Input
                placeholder="e.g. Science Olympiad Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Class (homeroom)" required hint="A group is scoped to a single class.">
              <Select
                value={homeroom}
                onChange={(e) => handleHomeroomChange(e.target.value)}
              >
                <option value="">— Choose a class —</option>
                {homerooms.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description">
              <Textarea
                placeholder="What is this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="pt-2 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                {selected.size} student{selected.size === 1 ? "" : "s"} selected
              </span>
              <Button
                onClick={submit}
                disabled={!canSubmit() || submitting}
              >
                Create Group
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-wrap">
            <div className="flex items-center gap-2">
              <CardTitle>Students in this class</CardTitle>
              {homeroom && (
                <Badge tone="info">Class {homeroom}</Badge>
              )}
            </div>
            {homeroom && classStudents.length > 0 && (
              <Button variant="secondary" size="sm" onClick={toggleAll}>
                {selected.size === classStudents.length
                  ? "Clear all"
                  : "Select all"}
              </Button>
            )}
          </CardHeader>

          {students === null ? (
            <CardBody className="text-sm text-[var(--muted)]">
              Loading students…
            </CardBody>
          ) : !homeroom ? (
            <CardBody className="text-center py-12 text-sm text-[var(--muted)]">
              Choose a class to see its students.
            </CardBody>
          ) : classStudents.length === 0 ? (
            <CardBody className="text-center py-12 text-sm text-[var(--muted)]">
              No students are assigned to class {homeroom}.
            </CardBody>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {classStudents.map((s) => {
                const isSelected = selected.has(s.id);
                return (
                  <li key={s.id}>
                    <label
                      className={[
                        "flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors",
                        isSelected ? "bg-sky-50/60" : "hover:bg-slate-50/60",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                      />
                      <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
                        {initials(s.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {s.email}
                        </div>
                      </div>
                      <div className="text-xs text-[var(--muted)] font-mono">
                        {s.id}
                      </div>
                      <Badge
                        tone={s.status === "Active" ? "success" : "warning"}
                      >
                        {s.status}
                      </Badge>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
