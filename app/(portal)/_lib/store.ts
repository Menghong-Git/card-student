"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type Student = {
  id: string;
  name: string;
  email: string;
  section: string;
  homeroom: string;
  grade: string;
  status: "Active" | "On Leave" | "Inactive";
  dob?: string;
  /** Profile photo — data URI or URL (used as the card photo on export). */
  photo?: string;
};

export type CardType = "Student" | "Teacher" | "Staff";
export type CardStatus = "Active" | "Expired" | "Revoked" | "Pending";

/** One issued ID card = one row in the Card List (and one CSV/Excel row). */
export type CardRow = {
  id: string;
  name: string;
  email: string;
  type: CardType;
  section: string;
  grade: string;
  dob: string;
  /** Profile image — data URI or URL. Used as the card photo on export. */
  image: string;
  issued: string;
  expires: string;
  status: CardStatus;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  homeroom: string;
  studentIds: string[];
  createdAt: string;
};

export type GradeTier = "Primary" | "Middle" | "High";

/**
 * A fully self-contained K-12 identity badge record produced by the
 * Identity Workspace. Everything needed to re-hydrate the builder lives here,
 * including the uploaded photo (base64), its framing offsets and the codes.
 */
export type IdRecord = {
  recordId: string;
  name: string;
  studentId: string;
  grade: string;
  tier: GradeTier;
  dob: string;
  expiration: string;
  qrPayload: string;
  photo: string;
  photoScale: number;
  photoX: number;
  photoY: number;
  schoolName: string;
  motto: string;
  primaryColor: string;
  accentColor: string;
  savedAt: string;
};

const STUDENTS_KEY = "bb.students.v1";
const GROUPS_KEY = "bb.groups.v1";
const ID_RECORDS_KEY = "bb.idcards.v1";
const CARDS_KEY = "bb.cards.v1";

const SEED_STUDENTS: Student[] = [
  {
    id: "STU-2026-01",
    name: "Amelia Hartwell",
    email: "amelia.h@brainbridge.edu",
    section: "High School",
    homeroom: "10-A",
    grade: "Grade 10",
    status: "Active",
  },
  {
    id: "STU-2026-02",
    name: "Noah Bennett",
    email: "noah.b@brainbridge.edu",
    section: "Middle School",
    homeroom: "7-B",
    grade: "Grade 7",
    status: "Active",
  },
  {
    id: "STU-2026-03",
    name: "Sofia Martínez",
    email: "sofia.m@brainbridge.edu",
    section: "High School",
    homeroom: "11-C",
    grade: "Grade 11",
    status: "Active",
  },
  {
    id: "STU-2025-44",
    name: "Liam Okafor",
    email: "liam.o@brainbridge.edu",
    section: "Primary School",
    homeroom: "5-A",
    grade: "Grade 5",
    status: "On Leave",
  },
  {
    id: "STU-2026-05",
    name: "Hannah Lindqvist",
    email: "hannah.l@brainbridge.edu",
    section: "Middle School",
    homeroom: "8-A",
    grade: "Grade 8",
    status: "Active",
  },
  {
    id: "STU-2025-19",
    name: "Yuki Tanaka",
    email: "yuki.t@brainbridge.edu",
    section: "High School",
    homeroom: "9-B",
    grade: "Grade 9",
    status: "Active",
  },
];

const SEED_CARDS: CardRow[] = [
  {
    id: "BB25-0001",
    name: "Amelia Hartwell",
    email: "amelia.h@brainbridge.edu",
    type: "Student",
    section: "High School",
    grade: "Grade 10",
    dob: "2009-04-12",
    image: "",
    issued: "2025-09-12",
    expires: "2026-09-12",
    status: "Active",
  },
  {
    id: "BB25-0002",
    name: "Noah Bennett",
    email: "noah.b@brainbridge.edu",
    type: "Student",
    section: "Middle School",
    grade: "Grade 7",
    dob: "2012-06-03",
    image: "",
    issued: "2025-09-14",
    expires: "2026-09-14",
    status: "Active",
  },
  {
    id: "BB25-T021",
    name: "Ms. Priya Raman",
    email: "priya.r@brainbridge.edu",
    type: "Teacher",
    section: "Sciences",
    grade: "",
    dob: "",
    image: "",
    issued: "2025-08-02",
    expires: "2026-08-02",
    status: "Active",
  },
  {
    id: "BB24-0881",
    name: "Liam Okafor",
    email: "liam.o@brainbridge.edu",
    type: "Student",
    section: "Primary School",
    grade: "Grade 5",
    dob: "2014-01-20",
    image: "",
    issued: "2024-09-15",
    expires: "2025-09-15",
    status: "Revoked",
  },
  {
    id: "BB25-0003",
    name: "Sofia Martínez",
    email: "sofia.m@brainbridge.edu",
    type: "Student",
    section: "High School",
    grade: "Grade 11",
    dob: "2008-11-09",
    image: "",
    issued: "2025-09-01",
    expires: "2026-09-01",
    status: "Pending",
  },
  {
    id: "BB24-T088",
    name: "Mr. Kenji Watanabe",
    email: "kenji.w@brainbridge.edu",
    type: "Teacher",
    section: "Mathematics",
    grade: "",
    dob: "",
    image: "",
    issued: "2024-08-20",
    expires: "2025-08-20",
    status: "Expired",
  },
  {
    id: "BB25-0004",
    name: "Hannah Lindqvist",
    email: "hannah.l@brainbridge.edu",
    type: "Student",
    section: "Middle School",
    grade: "Grade 8",
    dob: "2011-07-22",
    image: "",
    issued: "2025-09-18",
    expires: "2026-09-18",
    status: "Active",
  },
];

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STUDENTS_KEY) === null) {
    writeJSON(STUDENTS_KEY, SEED_STUDENTS);
  }
  if (window.localStorage.getItem(GROUPS_KEY) === null) {
    writeJSON(GROUPS_KEY, [] as Group[]);
  }
  if (window.localStorage.getItem(ID_RECORDS_KEY) === null) {
    writeJSON(ID_RECORDS_KEY, [] as IdRecord[]);
  }
  if (window.localStorage.getItem(CARDS_KEY) === null) {
    writeJSON(CARDS_KEY, SEED_CARDS);
  }
}

export function getStudents(): Student[] {
  ensureSeeded();
  return readJSON<Student[]>(STUDENTS_KEY, SEED_STUDENTS);
}

export function setStudents(next: Student[]) {
  writeJSON(STUDENTS_KEY, next);
  emit();
}

export function addStudents(rows: Student[]) {
  const current = getStudents();
  const byId = new Map(current.map((s) => [s.id, s]));
  for (const r of rows) byId.set(r.id, r);
  setStudents(Array.from(byId.values()));
}

export function getCards(): CardRow[] {
  ensureSeeded();
  return readJSON<CardRow[]>(CARDS_KEY, SEED_CARDS);
}

export function setCards(next: CardRow[]) {
  writeJSON(CARDS_KEY, next);
  emit();
}

/** Upsert imported rows by card id (case-insensitive); new ids go to the top. */
export function addCards(rows: CardRow[]): { added: number; updated: number } {
  const current = getCards();
  const indexById = new Map(
    current.map((c, i) => [c.id.trim().toLowerCase(), i]),
  );
  const next = current.slice();
  let added = 0;
  let updated = 0;
  const prepend: CardRow[] = [];
  for (const row of rows) {
    const key = row.id.trim().toLowerCase();
    const idx = indexById.get(key);
    if (idx === undefined) {
      prepend.push(row);
      indexById.set(key, -1);
      added++;
    } else if (idx >= 0) {
      next[idx] = row;
      updated++;
    }
  }
  setCards([...prepend, ...next]);
  return { added, updated };
}

export function deleteCard(id: string) {
  setCards(getCards().filter((c) => c.id !== id));
}

export function useCards(): CardRow[] | null {
  // useSyncExternalStore already returns the server snapshot (null) during SSR
  // and the first client paint, then re-renders with the live value — so no
  // separate "hydrated" effect is needed to avoid a hydration mismatch.
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(CARDS_KEY),
    () => null,
  );
  return useMemo(() => (snapshot === null ? null : getCards()), [snapshot]);
}

export function getGroups(): Group[] {
  ensureSeeded();
  return readJSON<Group[]>(GROUPS_KEY, []);
}

export function setGroups(next: Group[]) {
  writeJSON(GROUPS_KEY, next);
  emit();
}

export function addGroup(g: Group) {
  setGroups([g, ...getGroups()]);
}

export function deleteGroup(id: string) {
  setGroups(getGroups().filter((g) => g.id !== id));
}

export function getIdRecords(): IdRecord[] {
  ensureSeeded();
  return readJSON<IdRecord[]>(ID_RECORDS_KEY, []);
}

export function setIdRecords(next: IdRecord[]) {
  writeJSON(ID_RECORDS_KEY, next);
  emit();
}

/** Upsert by studentId — re-saving the same ID overwrites the prior badge. */
export function saveIdRecord(record: IdRecord) {
  const current = getIdRecords();
  const key = record.studentId.trim().toLowerCase();
  const idx = current.findIndex(
    (r) => r.studentId.trim().toLowerCase() === key,
  );
  if (idx >= 0) {
    const next = current.slice();
    next[idx] = record;
    setIdRecords(next);
  } else {
    setIdRecords([record, ...current]);
  }
}

export function deleteIdRecord(recordId: string) {
  setIdRecords(getIdRecords().filter((r) => r.recordId !== recordId));
}

export function useIdRecords(): IdRecord[] | null {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(ID_RECORDS_KEY),
    () => null,
  );
  return useMemo(
    () => (hydrated ? getIdRecords() : null),
    [hydrated, snapshot],
  );
}

export function useStudents(): Student[] | null {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (typeof window === "undefined" ? null : window.localStorage.getItem(STUDENTS_KEY)),
    () => null,
  );
  return useMemo(() => (hydrated ? getStudents() : null), [hydrated, snapshot]);
}

export function useGroups(): Group[] | null {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (typeof window === "undefined" ? null : window.localStorage.getItem(GROUPS_KEY)),
    () => null,
  );
  return useMemo(() => (hydrated ? getGroups() : null), [hydrated, snapshot]);
}
