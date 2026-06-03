"use client";

import * as XLSX from "xlsx";
import type { CardRow, CardType, CardStatus } from "./store";

/**
 * Card import/export format. Each row in the CSV / Excel file is ONE student
 * card. Column order below is what the downloadable template produces; on
 * import, headers are matched case-insensitively and a few aliases are
 * accepted, so column order does not matter.
 */
export const CARD_HEADERS = [
  "id",
  "name",
  "type",
  "section",
  "grade",
  "dob",
  "image",
  "intake",
  "expires",
  "status",
] as const;

/** Two filled-in example rows so the template shows the expected shape.
 *  `image` accepts a URL or a data URI (leave blank for none). */
const EXAMPLE_ROWS: string[][] = [
  [
    "BB25-0101",
    "Emma Johnson",
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

/** Download the import template as a CSV file (with a UTF-8 BOM for Excel). */
export function downloadCsvTemplate() {
  const rows = [Array.from(CARD_HEADERS), ...EXAMPLE_ROWS];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, "card-import-template.csv");
}

/** Download the import template as an .xlsx file. */
export function downloadXlsxTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([Array.from(CARD_HEADERS), ...EXAMPLE_ROWS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cards");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  triggerDownload(
    new Blob([out], { type: "application/octet-stream" }),
    "card-import-template.xlsx",
  );
}

export type ParseResult = {
  rows: CardRow[];
  errors: string[];
};

function normalizeType(raw: string): CardType {
  const v = raw.trim().toLowerCase();
  return VALID_TYPES.find((t) => t.toLowerCase() === v) ?? "Student";
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

/**
 * Parse a CSV or Excel (.xlsx/.xls) file into card rows. Matches headers
 * case-insensitively (with a few aliases), validates that id + name are
 * present, and reports per-row problems in `errors`. CSV is parsed as text so
 * dates stay exactly as typed; Excel date cells are normalized to ISO.
 */
export async function parseCardFile(file: File): Promise<ParseResult> {
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

    const id = get("id", "card id", "cardid", "student id", "studentid");
    const name = get("name", "full name", "holder", "student name");
    if (!id && !name) return; // skip fully blank rows
    if (!id) {
      errors.push(`Row ${rowNum}: missing "id" — skipped.`);
      return;
    }
    if (!name) {
      errors.push(`Row ${rowNum}: missing "name" — skipped.`);
      return;
    }

    rows.push({
      id,
      name,
      type: normalizeType(get("type")),
      section: get("section"),
      grade: get("grade"),
      dob: get("dob", "date of birth", "birthdate"),
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
