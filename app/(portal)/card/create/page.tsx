"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
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
import StudentIdCard from "./_components/StudentIdCard";
import StudentIdCardBack from "./_components/StudentIdCardBack";
import TeacherIdCard from "./_components/TeacherIdCard";
import TeacherIdCardBack from "./_components/TeacherIdCardBack";
import {
  loadFrontTemplate,
  loadBackTemplate,
  loadTeacherFrontTemplate,
  loadTeacherBackTemplate,
  FRONT_SIZE,
  BACK_SIZE,
} from "../../_lib/templates";
import { loadLogoDataUrl } from "../../_lib/logo";
import { makeQrDataUrl } from "../../_lib/qr";
import {
  addCards,
  addStudents,
  addTeachers,
  getStudents,
  getTeachers,
  useStudents,
  useTeachers,
  type CardRow,
  type Student,
  type Teacher,
} from "../../_lib/store";

type CardholderType = "Student" | "Teacher";
type Mode = "auto" | "manual";

type FormState = {
  name: string;
  email: string;
  cardholderId: string;
  grade: string;
  dob: string;
  photo: string;
  section: string;
  title: string;
  department: string;
  joined: string;
};

type LinkedDirectory = {
  type: CardholderType;
  id: string;
};

const GRADES = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const TEACHER_TITLES = [
  "Teacher",
  "Senior Teacher",
  "Subject Lead",
  "Homeroom Teacher",
  "Head of Department",
  "School Principle",
];

const DEPARTMENTS = [
  "Primary School",
  "Mathematics",
  "Sciences",
  "Languages & Humanities",
  "Arts & Music",
  "Physical Education",
];

const STUDENT_INITIAL: FormState = {
  name: "",
  email: "",
  cardholderId: "BB25-0001",
  grade: "Grade 8",
  dob: "",
  photo: "",
  section: "",
  title: "",
  department: "",
  joined: "",
};

const TEACHER_INITIAL: FormState = {
  name: "",
  email: "",
  cardholderId: "FAC-0001",
  grade: "",
  dob: "",
  photo: "",
  section: "",
  title: "Teacher",
  department: "Sciences",
  joined: "2022-07-12",
};

function initialFor(type: CardholderType): FormState {
  return { ...(type === "Teacher" ? TEACHER_INITIAL : STUDENT_INITIAL) };
}

function formatDob(d: string) {
  if (!d) return "MM / DD / YYYY";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return "MM / DD / YYYY";
  return `${m} / ${day} / ${y}`;
}

function formatLongDate(d: string) {
  if (!d) return "Date of Joining";
  const [y, m, day] = d.split("-");
  const monthIndex = Number(m) - 1;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (!y || !m || !day || !months[monthIndex]) return d;
  return `${Number(day)} ${months[monthIndex]} ${y}`;
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusOneYear(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(y) + 1}-${m}-${d}`;
}

function studentToForm(s: Student): Partial<FormState> {
  return {
    name: s.name,
    email: s.email ?? "",
    cardholderId: s.id,
    ...(s.grade && s.grade !== "-" ? { grade: s.grade } : {}),
    dob: s.dob ?? "",
    photo: s.photo ?? "",
    section: s.section && s.section !== "-" ? s.section : "",
  };
}

function teacherToForm(t: Teacher): Partial<FormState> {
  return {
    name: t.name,
    email: t.email ?? "",
    cardholderId: t.id,
    title: t.title,
    department: t.department,
    joined: t.joined ?? "",
    photo: t.photo ?? "",
  };
}

export default function CreateCardPage() {
  const [cardType, setCardType] = useState<CardholderType>("Student");
  const [data, setData] = useState<FormState>(() => initialFor("Student"));
  const [mode, setMode] = useState<Mode>("auto");
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkedDirectory, setLinkedDirectory] =
    useState<LinkedDirectory | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [frontTpl, setFrontTpl] = useState("");
  const [backTpl, setBackTpl] = useState("");
  const [logo, setLogo] = useState("");
  const [qr, setQr] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGSVGElement>(null);

  const students = useStudents();
  const teachers = useTeachers();

  useEffect(() => {
    const loadFront =
      cardType === "Teacher" ? loadTeacherFrontTemplate : loadFrontTemplate;
    const loadBack =
      cardType === "Teacher" ? loadTeacherBackTemplate : loadBackTemplate;

    loadFront()
      .then(setFrontTpl)
      .catch((err) => console.error(err));
    loadBack()
      .then(setBackTpl)
      .catch((err) => console.error(err));
  }, [cardType]);

  useEffect(() => {
    loadLogoDataUrl()
      .then(setLogo)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const params = new URLSearchParams(window.location.search);
      const teacherId = params.get("teacher");
      if (teacherId) {
        const found = getTeachers().find((t) => t.id === teacherId);
        if (found) {
          setCardType("Teacher");
          setData({ ...initialFor("Teacher"), ...teacherToForm(found) });
          setPickerQuery(`${found.name} - ${found.id}`);
          setLinkedDirectory({ type: "Teacher", id: found.id });
          setMode("auto");
        }
        return;
      }

      const studentId = params.get("student");
      if (!studentId) return;
      const found = getStudents().find((s) => s.id === studentId);
      if (found) {
        setCardType("Student");
        setData({ ...initialFor("Student"), ...studentToForm(found) });
        setPickerQuery(`${found.name} - ${found.id}`);
        setLinkedDirectory({ type: "Student", id: found.id });
        setMode("auto");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    makeQrDataUrl(data.cardholderId)
      .then((url) => {
        if (active) setQr(url);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [data.cardholderId]);

  const set =
    <K extends keyof FormState>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSavedId(null);
      setData((d) => ({ ...d, [key]: e.target.value }) as FormState);
    };

  const studentMatches = useMemo(() => {
    const list = students ?? [];
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [students, pickerQuery]);

  const teacherMatches = useMemo(() => {
    const list = teachers ?? [];
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [teachers, pickerQuery]);

  function selectStudent(s: Student) {
    setSavedId(null);
    setData((d) => ({ ...d, ...studentToForm(s) }));
    setPickerQuery(`${s.name} - ${s.id}`);
    setLinkedDirectory({ type: "Student", id: s.id });
    setPickerOpen(false);
  }

  function selectTeacher(t: Teacher) {
    setSavedId(null);
    setData((d) => ({ ...d, ...teacherToForm(t) }));
    setPickerQuery(`${t.name} - ${t.id}`);
    setLinkedDirectory({ type: "Teacher", id: t.id });
    setPickerOpen(false);
  }

  function switchCardType(next: CardholderType) {
    if (next === cardType) return;
    setCardType(next);
    setData(initialFor(next));
    setPickerQuery("");
    setPickerOpen(false);
    setLinkedDirectory(null);
    setSavedId(null);
    setMode("auto");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setSavedId(null);
    if (next === "manual") {
      setData(initialFor(cardType));
      setPickerQuery("");
      setPickerOpen(false);
      setLinkedDirectory(null);
    }
  }

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavedId(null);
    const reader = new FileReader();
    reader.onload = () =>
      setData((d) => ({ ...d, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setSavedId(null);
    setData((d) => ({ ...d, photo: "" }));
  };

  const reset = () => {
    setData(initialFor(cardType));
    setPickerQuery("");
    setPickerOpen(false);
    setSavedId(null);
    setLinkedDirectory(null);
  };

  const fullName = data.name;
  const directoryLabel = cardType.toLowerCase();
  const directoryLoading =
    cardType === "Student" ? students === null : teachers === null;
  const hasPickerMatches =
    cardType === "Student"
      ? studentMatches.length > 0
      : teacherMatches.length > 0;

  function saveToCardList() {
    const id = data.cardholderId.trim();
    if (!data.name.trim() || !id) {
      window.alert("A name and ID number are required to save the card.");
      return;
    }

    const issued = todayIso();
    const row: CardRow = {
      id,
      name: data.name.trim(),
      email: data.email.trim(),
      type: cardType,
      section: cardType === "Teacher" ? data.department : data.section,
      grade: cardType === "Teacher" ? data.title : data.grade,
      dob: cardType === "Teacher" ? "" : data.dob,
      joined: cardType === "Teacher" ? data.joined : undefined,
      image: data.photo,
      issued,
      expires: plusOneYear(issued),
      status: "Active",
    };
    addCards([row]);

    if (linkedDirectory?.type === "Student") {
      const existing = getStudents().find((s) => s.id === linkedDirectory.id);
      if (existing) {
        addStudents([
          {
            ...existing,
            name: data.name.trim(),
            email: data.email.trim() || existing.email,
            grade: data.grade || existing.grade,
            dob: data.dob || existing.dob,
            section: data.section || existing.section,
            photo: data.photo || existing.photo,
          },
        ]);
      }
    }

    if (linkedDirectory?.type === "Teacher") {
      const existing = getTeachers().find((t) => t.id === linkedDirectory.id);
      if (existing) {
        addTeachers([
          {
            ...existing,
            name: data.name.trim(),
            email: data.email.trim() || existing.email,
            title: data.title || existing.title,
            department: data.department || existing.department,
            joined: data.joined || existing.joined,
            photo: data.photo || existing.photo,
          },
        ]);
      }
    }

    setSavedId(id);
  }

  const svgToImage = async (
    svg: SVGSVGElement,
    size: { w: number; h: number },
  ): Promise<HTMLImageElement> => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", String(size.w));
    clone.setAttribute("height", String(size.h));
    const source = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed to load SVG"));
      img.src = url;
    });
    URL.revokeObjectURL(url);
    return img;
  };

  const downloadPng = async () => {
    const front = svgRef.current;
    const back = backRef.current;
    if (!front || !back) return;
    setDownloading(true);
    try {
      const scale = 2;
      const gap = 40 * scale;
      const fW = FRONT_SIZE.w * scale;
      const fH = FRONT_SIZE.h * scale;
      const bH = fH;
      const bW =
        cardType === "Teacher"
          ? fW
          : Math.round((bH * BACK_SIZE.w) / BACK_SIZE.h);

      const [frontImg, backImg] = await Promise.all([
        svgToImage(front, { w: fW, h: fH }),
        svgToImage(back, { w: bW, h: bH }),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = fW + gap + bW;
      canvas.height = Math.max(fH, bH);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frontImg, 0, 0, fW, fH);
      ctx.drawImage(backImg, fW + gap, 0, bW, bH);

      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
          "image/png",
        ),
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const fname =
        slug(fullName || directoryLabel) +
        "-" +
        slug(data.cardholderId || "card") +
        ".png";
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSvg = () => {
    const front = svgRef.current;
    const back = backRef.current;
    if (!front || !back) return;
    const serialize = (svg: SVGSVGElement, size: { w: number; h: number }) => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("x", "0");
      clone.setAttribute("y", "0");
      clone.setAttribute("width", String(size.w));
      clone.setAttribute("height", String(size.h));
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return new XMLSerializer().serializeToString(clone);
    };
    const gap = 40;
    const h = FRONT_SIZE.h;
    const backW =
      cardType === "Teacher"
        ? FRONT_SIZE.w
        : Math.round((h * BACK_SIZE.w) / BACK_SIZE.h);
    const w = FRONT_SIZE.w + gap + backW;
    const source =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
      `<rect width="${w}" height="${h}" fill="#ffffff"/>` +
      `<g transform="translate(0 0)">${serialize(front, FRONT_SIZE)}</g>` +
      `<g transform="translate(${FRONT_SIZE.w + gap} 0)">${serialize(back, { w: backW, h })}</g>` +
      `</svg>`;
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const fname =
      slug(fullName || directoryLabel) +
      "-" +
      slug(data.cardholderId || "card") +
      ".svg";
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <>
      <PageHeader
        title="Create New Card"
        description="Issue a Brain Bridge School identification card. Auto-fill from a student or teacher directory, then save it to the Card List."
        actions={
          <>
            <Button variant="secondary" onClick={reset} type="button">
              Reset
            </Button>
            <Button onClick={saveToCardList} type="button">
              Save to Card List
            </Button>
          </>
        }
      />

      {savedId && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>
            Card <span className="font-mono font-medium">{savedId}</span> saved
            to the Card List
            {linkedDirectory
              ? `, and the linked ${linkedDirectory.type.toLowerCase()} was updated in the directory.`
              : "."}
          </span>
          <Link
            href="/card/list"
            className="font-medium underline hover:opacity-80"
          >
            View in Card List -&gt;
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cardholder Information</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                {(["Student", "Teacher"] as CardholderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => switchCardType(type)}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      cardType === type
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ["auto", `Auto-fill from ${directoryLabel} directory`],
                    ["manual", "Create manually"],
                  ] as [Mode, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      mode === key
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "auto" && (
                <Field
                  label={`Find a ${directoryLabel}`}
                  hint={`Search by name or ID, or pick from the ${directoryLabel} list.`}
                >
                  <div className="relative">
                    <Input
                      value={pickerQuery}
                      onChange={(e) => {
                        setPickerQuery(e.target.value);
                        setPickerOpen(true);
                      }}
                      onFocus={() => setPickerOpen(true)}
                      onBlur={() => setPickerOpen(false)}
                      placeholder={
                        directoryLoading
                          ? `Loading ${directoryLabel}s...`
                          : `Search ${directoryLabel}s...`
                      }
                    />
                    {pickerOpen && (
                      <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-[var(--border)] bg-white py-1 shadow-lg">
                        {!hasPickerMatches ? (
                          <li className="px-3 py-2 text-sm text-[var(--muted)]">
                            No {directoryLabel}s match.
                          </li>
                        ) : cardType === "Student" ? (
                          studentMatches.map((s) => (
                            <li key={s.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectStudent(s);
                                }}
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <span className="font-medium text-[var(--foreground)]">
                                  {s.name}
                                </span>
                                <span className="font-mono text-xs text-[var(--muted)]">
                                  {s.id}
                                </span>
                              </button>
                            </li>
                          ))
                        ) : (
                          teacherMatches.map((t) => (
                            <li key={t.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectTeacher(t);
                                }}
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <span>
                                  <span className="block font-medium text-[var(--foreground)]">
                                    {t.name}
                                  </span>
                                  <span className="block text-xs text-[var(--muted)]">
                                    {t.title} - {t.department}
                                  </span>
                                </span>
                                <span className="font-mono text-xs text-[var(--muted)]">
                                  {t.id}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Full Name" required>
                    <Input
                      value={data.name}
                      onChange={set("name")}
                      placeholder={
                        cardType === "Teacher" ? "Ms. Jane Doe" : "Jane Doe"
                      }
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Email">
                    <Input
                      type="email"
                      value={data.email}
                      onChange={set("email")}
                      placeholder="name@brainbridge.edu"
                    />
                  </Field>
                </div>
                <Field
                  label="ID Number"
                  required
                  hint="Encoded into the QR code"
                >
                  <Input
                    value={data.cardholderId}
                    onChange={set("cardholderId")}
                    placeholder={
                      cardType === "Teacher" ? "FAC-0001" : "BB25-0001"
                    }
                  />
                </Field>

                {cardType === "Student" ? (
                  <>
                    <Field label="Grade" required>
                      <Select value={data.grade} onChange={set("grade")}>
                        {GRADES.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Date of Birth">
                      <Input
                        type="date"
                        value={data.dob}
                        onChange={set("dob")}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Title" required>
                      <Select value={data.title} onChange={set("title")}>
                        {!TEACHER_TITLES.includes(data.title) &&
                          data.title && <option>{data.title}</option>}
                        {TEACHER_TITLES.map((title) => (
                          <option key={title}>{title}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Department" required>
                      <Select
                        value={data.department}
                        onChange={set("department")}
                      >
                        {!DEPARTMENTS.includes(data.department) &&
                          data.department && <option>{data.department}</option>}
                        {DEPARTMENTS.map((department) => (
                          <option key={department}>{department}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Date of Joining">
                      <Input
                        type="date"
                        value={data.joined}
                        onChange={set("joined")}
                      />
                    </Field>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex items-start gap-5 flex-wrap">
                <label className="flex-1 min-w-[220px] block border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-7 w-7 mx-auto text-[var(--muted)]"
                  >
                    <path
                      d="M12 16V6m0 0-4 4m4-4 4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium">
                    Click to upload a photo
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    JPG or PNG, square preferred - max 4 MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPhoto}
                  />
                </label>

                {data.photo && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-28 w-28 rounded-lg overflow-hidden border-2 border-[var(--accent)] bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.photo}
                        alt="Cardholder"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Card Preview</CardTitle>
                <span className="text-[11px] text-[var(--muted)]">
                  Front &amp; back - portrait - 428 x 619
                </span>
              </CardHeader>
              <CardBody className="bg-slate-50 rounded-b-xl space-y-5">
                <div className="mx-auto" style={{ maxWidth: 340 }}>
                  <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Front
                  </p>
                  {cardType === "Teacher" ? (
                    <TeacherIdCard
                      ref={svgRef}
                      name={fullName || "Full Name"}
                      id={data.cardholderId || "FAC-0000"}
                      email={data.email}
                      title={data.title || "Teacher"}
                      department={data.department || "Department"}
                      joined={formatLongDate(data.joined)}
                      photo={data.photo}
                      template={frontTpl}
                      logo={logo}
                      qr={qr}
                    />
                  ) : (
                    <StudentIdCard
                      ref={svgRef}
                      name={fullName || "Full Name"}
                      id={data.cardholderId || "BB25-0000"}
                      grade={data.grade || "-"}
                      dob={formatDob(data.dob)}
                      photo={data.photo}
                      template={frontTpl}
                      logo={logo}
                      qr={qr}
                    />
                  )}
                </div>
                <div className="mx-auto" style={{ maxWidth: 340 }}>
                  <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Back
                  </p>
                  {cardType === "Teacher" ? (
                    <TeacherIdCardBack
                      ref={backRef}
                      template={backTpl}
                      expires={formatLongDate(plusOneYear(todayIso()))}
                    />
                  ) : (
                    <StudentIdCardBack ref={backRef} template={backTpl} />
                  )}
                </div>
              </CardBody>
            </Card>

            <Button onClick={saveToCardList} type="button" className="w-full">
              Save to Card List
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={downloadPng}
                disabled={downloading}
                variant="secondary"
                className="flex-1"
                type="button"
              >
                {downloading ? "Preparing..." : "Download PNG"}
              </Button>
              <Button
                variant="secondary"
                onClick={downloadSvg}
                className="flex-1"
                type="button"
              >
                Download SVG
              </Button>
            </div>
            <p className="text-[11px] text-[var(--muted)] text-center">
              Saving adds the card to the Card List. Exports include both the
              front and back side by side at print resolution.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
