"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageHeader,
} from "../../../_components/ui";
import { addStudents, type Student } from "../../../_lib/store";

type RawRow = Record<string, unknown>;

type ParsedRow = {
  ok: boolean;
  reason?: string;
  student: Student;
  rowIndex: number;
};

const COLUMN_ALIASES: Record<Exclude<keyof Student, "photo">, string[]> = {
  id: ["id", "student id", "studentid", "student_id"],
  name: ["name", "full name", "student name", "fullname"],
  email: ["email", "e-mail", "mail"],
  section: ["section", "school", "department"],
  homeroom: ["homeroom", "class", "classroom", "home room"],
  grade: ["grade", "year", "level"],
  status: ["status", "state"],
  dob: ["dob", "date of birth", "birthday", "birth date", "birthdate"],
};

function pickField(row: RawRow, aliases: string[]): string {
  const lowered: Record<string, unknown> = {};
  for (const k of Object.keys(row)) {
    lowered[k.trim().toLowerCase()] = row[k];
  }
  for (const a of aliases) {
    const v = lowered[a];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

function normalizeStatus(raw: string): Student["status"] {
  const v = raw.trim().toLowerCase();
  if (v === "on leave" || v === "leave") return "On Leave";
  if (v === "inactive" || v === "disabled") return "Inactive";
  return "Active";
}

function parseRows(rawRows: RawRow[]): ParsedRow[] {
  return rawRows.map((row, i) => {
    const student: Student = {
      id: pickField(row, COLUMN_ALIASES.id),
      name: pickField(row, COLUMN_ALIASES.name),
      email: pickField(row, COLUMN_ALIASES.email),
      section: pickField(row, COLUMN_ALIASES.section) || "—",
      homeroom: pickField(row, COLUMN_ALIASES.homeroom) || "—",
      grade: pickField(row, COLUMN_ALIASES.grade) || "—",
      status: normalizeStatus(pickField(row, COLUMN_ALIASES.status)),
      dob: pickField(row, COLUMN_ALIASES.dob) || undefined,
    };
    let reason: string | undefined;
    if (!student.id) reason = "Missing ID";
    else if (!student.name) reason = "Missing name";
    return { ok: !reason, reason, student, rowIndex: i + 2 };
  });
}

async function readFileAsRawRows(file: File): Promise<RawRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [imported, setImported] = useState<number | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setImported(null);
    setIsParsing(true);
    try {
      const raw = await readFileAsRawRows(file);
      if (raw.length === 0) {
        setError("The file is empty or its first sheet has no data rows.");
        setRows([]);
        setFileName(file.name);
        return;
      }
      setRows(parseRows(raw));
      setFileName(file.name);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Could not parse file: ${e.message}`
          : "Could not parse file.",
      );
      setRows([]);
      setFileName(file.name);
    } finally {
      setIsParsing(false);
    }
  }

  function reset() {
    setFileName(null);
    setRows([]);
    setError(null);
    setImported(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function commitImport() {
    const valid = rows.filter((r) => r.ok).map((r) => r.student);
    if (valid.length === 0) return;
    addStudents(valid);
    setImported(valid.length);
  }

  function downloadTemplate() {
    const csv =
      "id,name,email,section,homeroom,grade,status\n" +
      "STU-2026-99,Jane Doe,jane.d@brainbridge.edu,High School,10-A,Grade 10,Active\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = rows.filter((r) => r.ok).length;
  const invalidCount = rows.length - validCount;

  return (
    <>
      <PageHeader
        title="Import Students"
        description="Upload a CSV or Excel file (.xlsx) to add students in bulk."
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push("/user/student")}>
              ← Back to Students
            </Button>
            <Button variant="secondary" onClick={downloadTemplate}>
              Download CSV template
            </Button>
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Choose a file</CardTitle>
          {fileName && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <label
            htmlFor="student-file"
            className="block border-2 border-dashed border-[var(--border)] rounded-lg px-6 py-10 text-center cursor-pointer hover:border-[var(--primary)] hover:bg-slate-50 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto h-10 w-10 text-[var(--muted)]"
            >
              <path
                d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-3 text-sm font-medium text-[var(--foreground)]">
              {fileName ? fileName : "Click to select a .csv or .xlsx file"}
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              Required columns: id, name. Optional: email, section, homeroom, grade,
              status.
            </div>
            <input
              ref={inputRef}
              id="student-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {isParsing && (
            <div className="mt-3 text-sm text-[var(--muted)]">Parsing…</div>
          )}
          {error && (
            <div className="mt-3 text-sm rounded-md bg-red-50 ring-1 ring-red-200 text-red-700 px-3 py-2">
              {error}
            </div>
          )}
        </CardBody>
      </Card>

      {rows.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex-wrap">
            <div className="flex items-center gap-3">
              <CardTitle>2. Preview</CardTitle>
              <Badge tone="success">{validCount} valid</Badge>
              {invalidCount > 0 && (
                <Badge tone="warning">{invalidCount} skipped</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {imported !== null ? (
                <>
                  <Badge tone="success">Imported {imported}</Badge>
                  <Button onClick={() => router.push("/user/student")}>
                    View students
                  </Button>
                </>
              ) : (
                <Button onClick={commitImport} disabled={validCount === 0}>
                  Import {validCount} student{validCount === 1 ? "" : "s"}
                </Button>
              )}
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Row</th>
                  <th className="text-left font-semibold px-6 py-3">ID</th>
                  <th className="text-left font-semibold px-6 py-3">Name</th>
                  <th className="text-left font-semibold px-6 py-3">Email</th>
                  <th className="text-left font-semibold px-6 py-3">Section</th>
                  <th className="text-left font-semibold px-6 py-3">Grade</th>
                  <th className="text-left font-semibold px-6 py-3">Homeroom</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((r) => (
                  <tr
                    key={r.rowIndex}
                    className={r.ok ? "hover:bg-slate-50/60" : "bg-red-50/40"}
                  >
                    <td className="px-6 py-2 text-xs text-[var(--muted)]">
                      {r.ok ? (
                        r.rowIndex
                      ) : (
                        <span className="text-red-600" title={r.reason}>
                          {r.rowIndex} · {r.reason}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2 font-mono text-xs">
                      {r.student.id || "—"}
                    </td>
                    <td className="px-6 py-2 font-medium">
                      {r.student.name || "—"}
                    </td>
                    <td className="px-6 py-2 text-[var(--muted)]">
                      {r.student.email || "—"}
                    </td>
                    <td className="px-6 py-2 text-[var(--muted)]">
                      {r.student.section}
                    </td>
                    <td className="px-6 py-2 text-[var(--muted)]">
                      {r.student.grade}
                    </td>
                    <td className="px-6 py-2 text-[var(--muted)]">
                      {r.student.homeroom}
                    </td>
                    <td className="px-6 py-2">
                      <Badge
                        tone={
                          r.student.status === "Active" ? "success" : "warning"
                        }
                      >
                        {r.student.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File format</CardTitle>
        </CardHeader>
        <CardBody className="text-sm text-[var(--muted)] space-y-2">
          <p>
            The first row of your file must be a header row. Column names are
            matched case-insensitively. Accepted aliases:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-[var(--foreground)]">id</strong> — student
              id, studentid, student_id
            </li>
            <li>
              <strong className="text-[var(--foreground)]">name</strong> — full
              name, student name
            </li>
            <li>
              <strong className="text-[var(--foreground)]">email</strong> —
              e-mail, mail
            </li>
            <li>
              <strong className="text-[var(--foreground)]">section</strong> —
              school, department
            </li>
            <li>
              <strong className="text-[var(--foreground)]">homeroom</strong> —
              class, classroom
            </li>
            <li>
              <strong className="text-[var(--foreground)]">grade</strong> —
              year, level
            </li>
            <li>
              <strong className="text-[var(--foreground)]">status</strong> —
              state (defaults to <em>Active</em> if missing)
            </li>
          </ul>
          <p>
            Need a starting point?{" "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                downloadTemplate();
              }}
              className="text-[var(--primary)] font-medium hover:underline"
            >
              Download the CSV template
            </Link>
            .
          </p>
        </CardBody>
      </Card>
    </>
  );
}
