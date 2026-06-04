"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  loadFrontTemplate,
  loadBackTemplate,
  FRONT_SIZE,
  BACK_SIZE,
} from "../../_lib/templates";
import { loadLogoDataUrl } from "../../_lib/logo";
import { makeQrDataUrl } from "../../_lib/qr";
import {
  addCards,
  addStudents,
  getStudents,
  useStudents,
  type CardRow,
  type Student,
} from "../../_lib/store";

// The printed card front renders exactly these values (plus a QR encoded from
// the ID). `section` is not printed but is carried onto the saved Card List row.
type FormState = {
  name: string;
  email: string;
  cardholderId: string;
  grade: string;
  dob: string;
  photo: string;
  section: string;
};

type Mode = "auto" | "manual";

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

const INITIAL: FormState = {
  name: "",
  email: "",
  cardholderId: "BB25-0001",
  grade: "Grade 8",
  dob: "",
  photo: "",
  section: "",
};

function formatDob(d: string) {
  if (!d) return "MM / DD / YYYY";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return "MM / DD / YYYY";
  return `${m} / ${day} / ${y}`;
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

/** Same calendar day, one year on — used for the default card expiry. */
function plusOneYear(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(y) + 1}-${m}-${d}`;
}

/** Map a directory student record onto the card form. */
function studentToForm(s: Student): Partial<FormState> {
  return {
    name: s.name,
    email: s.email ?? "",
    cardholderId: s.id,
    // Imported rows may carry a "—" placeholder grade; keep the current value then.
    ...(s.grade && s.grade !== "—" ? { grade: s.grade } : {}),
    dob: s.dob ?? "",
    photo: s.photo ?? "",
    section: s.section && s.section !== "—" ? s.section : "",
  };
}

export default function CreateCardPage() {
  const [data, setData] = useState<FormState>(INITIAL);
  const [mode, setMode] = useState<Mode>("auto");
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  // The directory student this card was auto-filled from. Edits are written
  // back to this record (by its original id) when the card is saved.
  const [linkedStudentId, setLinkedStudentId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [frontTpl, setFrontTpl] = useState("");
  const [backTpl, setBackTpl] = useState("");
  const [logo, setLogo] = useState("");
  const [qr, setQr] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGSVGElement>(null);

  const students = useStudents();

  useEffect(() => {
    loadFrontTemplate()
      .then(setFrontTpl)
      .catch((err) => console.error(err));
    loadBackTemplate()
      .then(setBackTpl)
      .catch((err) => console.error(err));
    loadLogoDataUrl()
      .then(setLogo)
      .catch((err) => console.error(err));
  }, []);

  // Prefill from the Student directory when arriving via ?student=<id>.
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("student");
    if (!sid) return;
    const found = getStudents().find((s) => s.id === sid);
    if (found) {
      setData((d) => ({ ...d, ...studentToForm(found) }));
      setPickerQuery(`${found.name} · ${found.id}`);
      setLinkedStudentId(found.id);
      setMode("auto");
    }
  }, []);

  // Regenerate the QR code whenever the ID number changes.
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSavedId(null);
      setData((d) => ({ ...d, [key]: e.target.value }) as FormState);
    };

  // Students matching the picker search (by name or ID).
  const pickerMatches = useMemo(() => {
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

  function selectStudent(s: Student) {
    setSavedId(null);
    setData((d) => ({ ...d, ...studentToForm(s) }));
    setPickerQuery(`${s.name} · ${s.id}`);
    setLinkedStudentId(s.id);
    setPickerOpen(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setSavedId(null);
    if (next === "manual") {
      // Clear any directory-sourced values so the admin starts from a blank slate.
      setData(INITIAL);
      setPickerQuery("");
      setPickerOpen(false);
      setLinkedStudentId(null);
    }
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setData(INITIAL);
    setPickerQuery("");
    setPickerOpen(false);
    setSavedId(null);
    setLinkedStudentId(null);
  };

  const fullName = data.name;

  /** Persist the current card to the Card List (appears on /card/list). */
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
      type: "Student",
      section: data.section,
      grade: data.grade,
      dob: data.dob,
      image: data.photo,
      issued,
      expires: plusOneYear(issued),
      status: "Active",
    };
    addCards([row]);

    // If this card was auto-filled from a directory student, write the edits
    // (name, grade, dob, section, photo) back to that student record so the
    // Student list reflects the new details. Keyed by the original id.
    if (linkedStudentId) {
      const existing = getStudents().find((s) => s.id === linkedStudentId);
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

    setSavedId(id);
  }

  /** Rasterize a single card <svg> to an HTMLImageElement. */
  const svgToImage = async (
    svg: SVGSVGElement,
    size: { w: number; h: number },
  ): Promise<HTMLImageElement> => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Explicit pixel size so the SVG rasterizes at a known resolution.
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
      const scale = 2; // crisp print-ready PNG
      const gap = 40 * scale; // white gutter between front and back
      const fW = FRONT_SIZE.w * scale;
      const fH = FRONT_SIZE.h * scale;
      // Back has a different aspect ratio — scale it to the front's height.
      const bH = fH;
      const bW = Math.round((bH * BACK_SIZE.w) / BACK_SIZE.h);

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
        slug(fullName || "student") +
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
    const backW = Math.round((h * BACK_SIZE.w) / BACK_SIZE.h);
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
      slug(fullName || "student") +
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
        description="Issue a Brain Bridge School identification card. Auto-fill from a student or enter the details manually, then save it to the Card List."
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
            {linkedStudentId
              ? ", and the linked student was updated in the directory."
              : "."}
          </span>
          <Link
            href="/card/list"
            className="font-medium underline hover:opacity-80"
          >
            View in Card List →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ===== FORM ===== */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cardholder Information</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Mode switch: auto-fill from directory vs. manual entry */}
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ["auto", "Auto-fill from directory"],
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
                  label="Find a student"
                  hint="Search by name or ID, or pick from the list — fields fill in automatically."
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
                        students === null
                          ? "Loading students…"
                          : "Search students…"
                      }
                    />
                    {pickerOpen && (
                      <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-[var(--border)] bg-white py-1 shadow-lg">
                        {pickerMatches.length === 0 ? (
                          <li className="px-3 py-2 text-sm text-[var(--muted)]">
                            No students match.
                          </li>
                        ) : (
                          pickerMatches.map((s) => (
                            <li key={s.id}>
                              <button
                                type="button"
                                // mousedown fires before the input blur, so the
                                // pick registers before the dropdown closes.
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
                      placeholder="Jane Doe"
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
                <Field label="ID Number" required hint="Encoded into the QR code">
                  <Input
                    value={data.cardholderId}
                    onChange={set("cardholderId")}
                    placeholder="BB25-0001"
                  />
                </Field>
                <Field label="Grade" required>
                  <Select value={data.grade} onChange={set("grade")}>
                    {GRADES.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={data.dob} onChange={set("dob")} />
                </Field>
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
                    JPG or PNG, square preferred · max 4 MB
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

        {/* ===== PREVIEW ===== */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Card Preview</CardTitle>
                <span className="text-[11px] text-[var(--muted)]">
                  Front &amp; back · portrait · 428 × 619
                </span>
              </CardHeader>
              <CardBody className="bg-slate-50 rounded-b-xl space-y-5">
                <div className="mx-auto" style={{ maxWidth: 340 }}>
                  <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Front
                  </p>
                  <StudentIdCard
                    ref={svgRef}
                    name={fullName || "Full Name"}
                    id={data.cardholderId || "BB25-0000"}
                    grade={data.grade || "—"}
                    dob={formatDob(data.dob)}
                    photo={data.photo}
                    template={frontTpl}
                    logo={logo}
                    qr={qr}
                  />
                </div>
                <div className="mx-auto" style={{ maxWidth: 340 }}>
                  <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Back
                  </p>
                  <StudentIdCardBack ref={backRef} template={backTpl} />
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
                {downloading ? "Preparing…" : "Download PNG"}
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
