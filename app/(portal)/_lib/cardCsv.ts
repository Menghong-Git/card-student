"use client";

import * as XLSX from "xlsx";
import type { CardRow, CardType, CardStatus } from "./store";

/**
 * Card import/export format. Students and teachers have different fields
 * (a teacher card shows title/department/date-joined, not section/grade/dob),
 * so each gets its own template and its own column order. On import, headers
 * are matched case-insensitively and a few aliases are accepted, so column
 * order does not matter.
 */
export const STUDENT_CARD_HEADERS = [
  "id",
  "name",
  "email",
  "type",
  "section",
  "grade",
  "dob",
  "image",
  "intake",
  "expires",
  "status",
] as const;

export const TEACHER_CARD_HEADERS = [
  "id",
  "name",
  "email",
  "type",
  "department",
  "title",
  "joined",
  "image",
  "intake",
  "expires",
  "status",
] as const;

/** Two filled-in example rows so the template shows the expected shape.
 *  `image` accepts a URL or a data URI (leave blank for none). */
const STUDENT_EXAMPLE_ROWS: string[][] = [
  [
    "BB25-0101",
    "Emma Johnson",
    "emma.j@brainbridge.edu",
    "Student",
    "High School",
    "Grade 10",
    "2009-05-14",
    "https://example.com/photos/emma.jpg",
    "2025-09-01",
    "2026-09-01",
    "Active",
  ],
  [
    "BB25-0102",
    "Liam Smith",
    "liam.s@brainbridge.edu",
    "Student",
    "Middle School",
    "Grade 7",
    "2012-03-22",
    "",
    "2025-09-01",
    "2026-09-01",
    "Active",
  ],
];

const TEACHER_EXAMPLE_ROWS: string[][] = [
  [
    "BB25-T101",
    "Priya Raman",
    "p.raman@brainbridge.edu",
    "Teacher",
    "Sciences",
    "Subject Lead",
    "2022-07-12",
    "https://example.com/photos/priya.jpg",
    "2025-09-01",
    "2026-09-01",
    "Active",
  ],
  [
    "BB25-T102",
    "Kenji Watanabe",
    "k.watanabe@brainbridge.edu",
    "Teacher",
    "Mathematics",
    "Senior Teacher",
    "2021-08-04",
    "",
    "2025-09-01",
    "2026-09-01",
    "Active",
  ],
];

const VALID_TYPES: CardType[] = ["Student", "Teacher", "Staff"];
const VALID_STATUS: CardStatus[] = ["Active", "Expired", "Revoked", "Pending"];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(
  headers: readonly string[],
  exampleRows: string[][],
  filename: string,
) {
  const rows = [Array.from(headers), ...exampleRows];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

function downloadXlsx(
  headers: readonly string[],
  exampleRows: string[][],
  filename: string,
) {
  const ws = XLSX.utils.aoa_to_sheet([Array.from(headers), ...exampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cards");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  triggerDownload(
    new Blob([out], { type: "application/octet-stream" }),
    filename,
  );
}

/** Download the student import template as a CSV file (UTF-8 BOM for Excel). */
export function downloadStudentCsvTemplate() {
  downloadCsv(
    STUDENT_CARD_HEADERS,
    STUDENT_EXAMPLE_ROWS,
    "student-card-import-template.csv",
  );
}

/** Download the student import template as an .xlsx file. */
export function downloadStudentXlsxTemplate() {
  downloadXlsx(
    STUDENT_CARD_HEADERS,
    STUDENT_EXAMPLE_ROWS,
    "student-card-import-template.xlsx",
  );
}

/** Download the teacher import template as a CSV file (UTF-8 BOM for Excel). */
export function downloadTeacherCsvTemplate() {
  downloadCsv(
    TEACHER_CARD_HEADERS,
    TEACHER_EXAMPLE_ROWS,
    "teacher-card-import-template.csv",
  );
}

/** Download the teacher import template as an .xlsx file. */
export function downloadTeacherXlsxTemplate() {
  downloadXlsx(
    TEACHER_CARD_HEADERS,
    TEACHER_EXAMPLE_ROWS,
    "teacher-card-import-template.xlsx",
  );
}

export type ParseResult = {
  rows: CardRow[];
  errors: string[];
};

function normalizeType(raw: string, fallback: CardType): CardType {
  const v = raw.trim().toLowerCase();
  return VALID_TYPES.find((t) => t.toLowerCase() === v) ?? fallback;
}

function normalizeStatus(raw: string): CardStatus {
  const v = raw.trim().toLowerCase();
  return VALID_STATUS.find((s) => s.toLowerCase() === v) ?? "Active";
}

/** Minimal RFC-4180 CSV parser → array of header-keyed records, keeping the
 *  user's exact text (so ISO dates like 2025-09-01 are preserved verbatim). */
function parseCsvText(text: string): Record<string, string>[] {
  const grid: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      grid.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    grid.push(row);
  }
  const header = (grid.shift() ?? []).map((h) => h.replace(/^﻿/, "").trim());
  return grid
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = (r[i] ?? "").trim();
      });
      return obj;
    });
}

function toIsoIfDate(value: unknown): string {
  if (value instanceof Date && !isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value ?? "").trim();
}

/** Which card list ("Student" or "Teacher" tab) a file is being imported into.
 *  Determines the default type for rows that omit a "type" column, and which
 *  columns are read: students use section/grade/dob, teachers use
 *  department/title/date-joined. */
export type CardImportKind = "student" | "teacher";

/**
 * Parse a CSV or Excel (.xlsx/.xls) file into card rows. Matches headers
 * case-insensitively (with a few aliases), validates that id + name are
 * present, and reports per-row problems in `errors`. CSV is parsed as text so
 * dates stay exactly as typed; Excel date cells are normalized to ISO.
 */
export async function parseCardFile(
  file: File,
  kind: CardImportKind = "student",
): Promise<ParseResult> {
  const isCsv =
    file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

  let records: Record<string, string>[];
  if (isCsv) {
    records = parseCsvText(await file.text());
  } else {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return { rows: [], errors: ["The file has no sheets."] };
    const sheet = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: true,
    });
    records = json.map((r) => {
      const obj: Record<string, string> = {};
      for (const k of Object.keys(r)) obj[k] = toIsoIfDate(r[k]);
      return obj;
    });
  }

  const rows: CardRow[] = [];
  const errors: string[] = [];
  const isTeacher = kind === "teacher";
  const defaultType: CardType = isTeacher ? "Teacher" : "Student";
  // Import upserts by id, so two rows sharing an id silently collapse into
  // one saved card (the later row wins) — surface that instead of leaving
  // it to look like rows went missing after import.
  const firstRowById = new Map<string, number>();

  records.forEach((raw, i) => {
    const rowNum = i + 2; // +1 for header, +1 for 1-based
    const get = (...keys: string[]): string => {
      for (const wanted of keys) {
        for (const actual of Object.keys(raw)) {
          if (actual.trim().toLowerCase() === wanted) {
            return String(raw[actual] ?? "").trim();
          }
        }
      }
      return "";
    };

    const id = get("id", "card id", "cardid", "staff id", "teacher id", "student id", "studentid");
    const name = get("name", "full name", "holder", "student name", "teacher name");
    if (!id && !name) return; // skip fully blank rows
    if (!id) {
      errors.push(`Row ${rowNum}: missing "id" — skipped.`);
      return;
    }
    if (!name) {
      errors.push(`Row ${rowNum}: missing "name" — skipped.`);
      return;
    }

    const idKey = id.trim().toLowerCase();
    const firstRow = firstRowById.get(idKey);
    if (firstRow !== undefined) {
      errors.push(
        `Row ${rowNum}: id "${id}" is also used by row ${firstRow} in this file — duplicate ids overwrite each other, only one will be kept.`,
      );
    } else {
      firstRowById.set(idKey, rowNum);
    }

    rows.push({
      id,
      name,
      email: get("email", "e-mail", "mail"),
      type: normalizeType(get("type"), defaultType),
      section: isTeacher
        ? get("department", "dept", "section")
        : get("section"),
      grade: isTeacher ? get("title", "position", "grade") : get("grade"),
      dob: isTeacher ? "" : get("dob", "date of birth", "birthdate"),
      joined: isTeacher
        ? get("joined", "date joined", "joining date", "date of joining")
        : undefined,
      image: get("image", "photo", "image url", "photo url", "picture"),
      issued: get("intake", "issued", "intake date", "issue date", "issued on"),
      expires: get("expires", "expiry", "expiration", "expiry date"),
      status: normalizeStatus(get("status")),
    });
  });

  if (rows.length === 0 && errors.length === 0) {
    errors.push("No data rows found in the file.");
  }

  return { rows, errors };
}
