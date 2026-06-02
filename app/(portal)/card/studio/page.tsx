"use client";

import { useRef, useState } from "react";
import {
  deleteIdRecord,
  saveIdRecord,
  useIdRecords,
  type GradeTier,
  type IdRecord,
} from "../../_lib/store";
import { Button, Card, CardBody, CardHeader, CardTitle } from "../../_components/ui";
import IdCardFront from "./_components/IdCardFront";
import IdCardBack from "./_components/IdCardBack";
import Crest from "./_components/Crest";
import { downloadCardPng, downloadCardSvg, slug } from "./_lib/export";
import type { CardData } from "./_lib/types";

const BRAND_BLUE = "#0a2540";
const BRAND_GOLD = "#c5a059";

const cardFrameStyle: React.CSSProperties = {
  width: 365,
  height: 580,
  borderRadius: "1.75rem",
  boxShadow:
    "0 26px 60px -12px rgba(10,37,64,0.45), 0 0 0 1px rgba(10,37,64,0.04)",
  overflow: "hidden",
  background: "#fff",
};

type FormState = {
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
};

const GRADES: { tier: GradeTier; label: string; grades: string[] }[] = [
  { tier: "Primary", label: "Primary School", grades: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] },
  { tier: "Middle", label: "Middle School", grades: ["Grade 6", "Grade 7", "Grade 8"] },
  { tier: "High", label: "High School", grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"] },
];

function tierForGrade(grade: string): GradeTier {
  for (const g of GRADES) if (g.grades.includes(grade)) return g.tier;
  return "Middle";
}

const PRESETS: { label: string; tag: string; data: Partial<FormState> }[] = [
  {
    label: "Alexander Rivera",
    tag: "Grade 8",
    data: {
      name: "Alexander Rivera",
      studentId: "BB25-0814",
      grade: "Grade 8",
      tier: "Middle",
      dob: "2012-04-18",
      expiration: "2027-06-30",
      qrPayload: "BB|BB25-0814|Alexander Rivera",
    },
  },
  {
    label: "Chloe McKenna",
    tag: "Grade 10",
    data: {
      name: "Chloe McKenna",
      studentId: "BB25-1042",
      grade: "Grade 10",
      tier: "High",
      dob: "2010-11-03",
      expiration: "2027-06-30",
      qrPayload: "BB|BB25-1042|Chloe McKenna",
    },
  },
];

const INITIAL: FormState = {
  name: "Alexander Rivera",
  studentId: "BB25-0814",
  grade: "Grade 8",
  tier: "Middle",
  dob: "2012-04-18",
  expiration: "2027-06-30",
  qrPayload: "BB|BB25-0814|Alexander Rivera",
  photo: "",
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  schoolName: "Brain Bridge",
  motto: "Discipline • Morality • Leadership",
  primaryColor: BRAND_BLUE,
  accentColor: BRAND_GOLD,
};

function capitalizeWords(v: string): string {
  return v.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `rec-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

type Tab = "profile" | "photo" | "branding";
type Side = "front" | "back";

export default function IdentityWorkspacePage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [tab, setTab] = useState<Tab>("profile");
  const [side, setSide] = useState<Side>("front");
  const [busy, setBusy] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const frontRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGSVGElement>(null);
  const records = useIdRecords();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const cardData: CardData = form;

  // ---------- photo ----------
  function readPhoto(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  }

  // ---------- presets / registry ----------
  function applyPreset(p: (typeof PRESETS)[number]) {
    setForm((f) => ({ ...f, ...p.data, photo: "", photoScale: 1, photoX: 0, photoY: 0 }));
  }

  function loadRecord(r: IdRecord) {
    setForm({
      name: r.name,
      studentId: r.studentId,
      grade: r.grade,
      tier: r.tier,
      dob: r.dob,
      expiration: r.expiration,
      qrPayload: r.qrPayload,
      photo: r.photo,
      photoScale: r.photoScale,
      photoX: r.photoX,
      photoY: r.photoY,
      schoolName: r.schoolName,
      motto: r.motto,
      primaryColor: r.primaryColor,
      accentColor: r.accentColor,
    });
    setTab("profile");
    setSide("front");
  }

  function saveRegistry() {
    if (!form.studentId.trim()) {
      alert("A Student ID is required to save to the registry.");
      return;
    }
    const record: IdRecord = {
      recordId: newId(),
      ...form,
      savedAt: new Date().toISOString(),
    };
    saveIdRecord(record);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  // ---------- export ----------
  const baseName = `${slug(form.name)}-${slug(form.studentId)}`;
  const refFor = (s: Side) => (s === "front" ? frontRef : backRef);

  async function exportSide(s: Side) {
    const svg = refFor(s).current;
    if (svg) await downloadCardPng(svg, `${baseName}-${s}.png`, 3);
  }

  async function exportCurrent() {
    setBusy(true);
    try {
      await exportSide(side);
    } finally {
      setBusy(false);
    }
  }

  // Both sides stay mounted (the inactive one off-screen), so we can export each.
  async function exportBoth() {
    setBusy(true);
    try {
      await exportSide("front");
      await exportSide("back");
    } finally {
      setBusy(false);
    }
  }

  function exportSvg() {
    const svg = refFor(side).current;
    if (svg) downloadCardSvg(svg, `${baseName}-${side}.svg`);
  }

  const filtered = (records ?? []).filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="studio">
      {/* ===================== HEADER BAR ===================== */}
      <div className="mb-6 rounded-2xl border border-[var(--studio-offwhite)] bg-white shadow-sm overflow-hidden">
        <div
          className="flex flex-wrap items-center gap-4 px-6 py-5"
          style={{ background: "linear-gradient(110deg,#0a2540 0%,#0d2d4d 60%,#103354 100%)" }}
        >
          <div className="h-14 w-14 rounded-xl bg-white/10 ring-1 ring-[var(--studio-gold)]/40 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 200 200" className="h-12 w-12">
              <g transform="translate(100 96)">
                <Crest navy="#0a2540" gold={BRAND_GOLD} />
              </g>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-white text-2xl leading-tight font-bold tracking-tight">
              Student K-12 Identity Workspace
            </h1>
            <p className="text-[13px] text-white/65 font-label">
              Design, preview &amp; issue high-fidelity vertical ID badges.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] uppercase tracking-[0.18em] text-[var(--studio-gold)] font-label mr-1">
              Quick presets
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/15 px-3 py-2 text-left transition-colors"
              >
                <span className="block text-[13px] font-semibold text-white leading-none font-label">
                  {p.label}
                </span>
                <span className="block text-[10px] text-[var(--studio-gold)] mt-0.5 font-label">
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== THREE-COLUMN WORKSPACE ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---------- LEFT: customization form ---------- */}
        <div className="lg:col-span-7">
          <Card className="overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-[var(--border)] bg-slate-50">
              {(
                [
                  ["profile", "Profile Details"],
                  ["photo", "Photo Adjuster"],
                  ["branding", "School Branding"],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={[
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors font-label",
                    tab === key
                      ? "bg-white text-[#0a2540] border-b-2 border-[#c5a059]"
                      : "text-slate-500 hover:text-[#0a2540]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <CardBody className="space-y-5">
              {tab === "profile" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StudioField label="Student Name" hint="Auto-capitalized">
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => set("name", capitalizeWords(e.target.value))}
                      placeholder="Jane Doe"
                    />
                  </StudioField>
                  <StudioField label="Student ID Number">
                    <input
                      className={`${inputCls} font-stamp`}
                      value={form.studentId}
                      onChange={(e) => set("studentId", e.target.value.toUpperCase())}
                      placeholder="BB25-0001"
                    />
                  </StudioField>
                  <StudioField label="Grade Level">
                    <select
                      className={inputCls}
                      value={form.grade}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          grade: e.target.value,
                          tier: tierForGrade(e.target.value),
                        }))
                      }
                    >
                      {GRADES.map((g) => (
                        <optgroup key={g.tier} label={g.label}>
                          {g.grades.map((gr) => (
                            <option key={gr}>{gr}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </StudioField>
                  <StudioField label="Tier">
                    <input className={`${inputCls} bg-slate-50`} value={`${form.tier} School`} readOnly />
                  </StudioField>
                  <StudioField label="Date of Birth">
                    <input
                      type="date"
                      className={inputCls}
                      value={form.dob}
                      onChange={(e) => set("dob", e.target.value)}
                    />
                  </StudioField>
                  <StudioField label="Expiration Date">
                    <input
                      type="date"
                      className={inputCls}
                      value={form.expiration}
                      onChange={(e) => set("expiration", e.target.value)}
                    />
                  </StudioField>
                  <div className="sm:col-span-2">
                    <StudioField label="Custom QR String" hint="Encoded into the front QR code">
                      <input
                        className={`${inputCls} font-stamp text-xs`}
                        value={form.qrPayload}
                        onChange={(e) => set("qrPayload", e.target.value)}
                        placeholder="https://brainbridge.edu/verify/BB25-0001"
                      />
                    </StudioField>
                  </div>

                  {/* Photo uploader */}
                  <div className="sm:col-span-2">
                    <StudioLabel>Student Photo</StudioLabel>
                    <div className="flex items-start gap-4 flex-wrap">
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          readPhoto(e.dataTransfer.files?.[0]);
                        }}
                        className={[
                          "flex-1 min-w-[220px] cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                          dragOver
                            ? "border-[#c5a059] bg-[#c5a059]/5"
                            : "border-[var(--border)] hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 mx-auto text-slate-400">
                          <path d="M12 16V6m0 0-4 4m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-[#0a2540]">
                          Drag &amp; drop or click to upload
                        </p>
                        <p className="text-[11px] text-slate-400">JPG or PNG · portrait preferred</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => readPhoto(e.target.files?.[0])}
                        />
                      </label>
                      {form.photo && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-[#c5a059] bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={form.photo} alt="Student" className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => set("photo", "")}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === "photo" && (
                <div className="space-y-6">
                  {!form.photo && (
                    <p className="rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-800 text-xs px-3 py-2">
                      Upload a photo under <strong>Profile Details</strong> to fine-tune its framing here.
                    </p>
                  )}
                  <Slider
                    label="Scale"
                    value={form.photoScale}
                    min={0.5}
                    max={3}
                    step={0.01}
                    suffix="×"
                    onChange={(v) => set("photoScale", v)}
                  />
                  <Slider
                    label="Horizontal Position"
                    value={form.photoX}
                    min={-120}
                    max={120}
                    step={1}
                    onChange={(v) => set("photoX", v)}
                  />
                  <Slider
                    label="Vertical Position"
                    value={form.photoY}
                    min={-120}
                    max={120}
                    step={1}
                    onChange={(v) => set("photoY", v)}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photoScale: 1, photoX: 0, photoY: 0 }))}
                  >
                    Reset framing
                  </Button>
                </div>
              )}

              {tab === "branding" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <StudioField label="School Name">
                      <input className={inputCls} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
                    </StudioField>
                  </div>
                  <div className="sm:col-span-2">
                    <StudioField label="Creed / Motto">
                      <input className={inputCls} value={form.motto} onChange={(e) => set("motto", e.target.value)} placeholder="Discipline • Morality • Leadership" />
                    </StudioField>
                  </div>
                  <StudioField label="Primary Color">
                    <ColorInput value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
                  </StudioField>
                  <StudioField label="Accent Color">
                    <ColorInput value={form.accentColor} onChange={(v) => set("accentColor", v)} />
                  </StudioField>
                  <div className="sm:col-span-2">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, primaryColor: BRAND_BLUE, accentColor: BRAND_GOLD }))}
                    >
                      Restore brand colors
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ---------- RIGHT: live card frame ---------- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Front / back toggle */}
            <div className="flex items-center justify-center gap-1 rounded-full bg-slate-100 p-1 w-fit mx-auto">
              {(["front", "back"] as Side[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={[
                    "px-5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors font-label",
                    side === s ? "bg-white text-[#0a2540] shadow-sm" : "text-slate-500",
                  ].join(" ")}
                >
                  {s} side
                </button>
              ))}
            </div>

            {/* Stage */}
            <div className="studio-stage rounded-2xl p-6 flex justify-center">
              <div id="print-area">
                <div style={cardFrameStyle}>
                  {side === "front" ? (
                    <IdCardFront ref={frontRef} {...cardData} />
                  ) : (
                    <IdCardBack ref={backRef} {...cardData} />
                  )}
                </div>
              </div>
            </div>

            {/* Inactive side stays mounted off-screen so "Download Both" can
                capture it without the user having to flip the card first. */}
            <div
              aria-hidden
              style={{ position: "fixed", left: -99999, top: 0, width: 365, height: 580, pointerEvents: "none" }}
            >
              <div style={cardFrameStyle}>
                {side === "front" ? (
                  <IdCardBack ref={backRef} {...cardData} />
                ) : (
                  <IdCardFront ref={frontRef} {...cardData} />
                )}
              </div>
            </div>

            {/* Export toolkit */}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={exportCurrent} disabled={busy} className="col-span-2">
                {busy ? "Rendering…" : `Download ${side} side · PNG 3×`}
              </Button>
              <Button variant="secondary" type="button" onClick={exportBoth} disabled={busy} className="col-span-2">
                Download Both Sides (PNG)
              </Button>
              <Button variant="secondary" type="button" onClick={exportSvg} disabled={busy}>
                Download SVG
              </Button>
              <Button variant="secondary" type="button" onClick={() => window.print()}>
                Print
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 text-center font-label">
              PNG exports at 3× (1620 × 2574 px) for CR80 badge printers. “Both
              Sides” saves the front and back as two files.
            </p>

            <Button type="button" onClick={saveRegistry} className="w-full" variant={savedFlash ? "secondary" : "primary"}>
              {savedFlash ? "✓ Saved to registry" : "Save Student Registry"}
            </Button>
          </div>
        </div>
      </div>

      {/* ===================== REGISTRY DIRECTORY ===================== */}
      <Card className="mt-8">
        <CardHeader className="flex-wrap">
          <CardTitle>Student Registry</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-label">
              {records === null ? "…" : `${records.length} saved`}
            </span>
            <div className="relative">
              <input
                className={`${inputCls} w-60 pl-9`}
                placeholder="Search name, ID or grade…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-label">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Student</th>
                <th className="text-left font-semibold px-6 py-3">ID</th>
                <th className="text-left font-semibold px-6 py-3">Grade</th>
                <th className="text-left font-semibold px-6 py-3">DOB</th>
                <th className="text-left font-semibold px-6 py-3">Expires</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {records === null ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Loading registry…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    {records.length === 0
                      ? "No students saved yet. Build a badge and press “Save Student Registry”."
                      : "No records match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.recordId} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 ring-1 ring-[#c5a059]/40 shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                          {r.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.photo} alt={r.name} className="h-full w-full object-cover" />
                          ) : (
                            r.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="font-medium text-[#0a2540]">{r.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-stamp text-xs text-slate-600">{r.studentId}</td>
                    <td className="px-6 py-3 text-slate-500">{r.grade}</td>
                    <td className="px-6 py-3 text-slate-500 font-stamp text-xs">{r.dob || "—"}</td>
                    <td className="px-6 py-3 text-slate-500 font-stamp text-xs">{r.expiration || "—"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => loadRecord(r)}
                          className="px-2.5 py-1 text-xs rounded-md hover:bg-slate-100 text-[#0a2540] font-medium"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteIdRecord(r.recordId)}
                          className="px-2.5 py-1 text-xs rounded-md hover:bg-red-50 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- small UI bits ----------------------------- */

const inputCls =
  "w-full h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[#0a2540] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a2540]/25 focus:border-[#0a2540] font-label";

function StudioLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium text-[#0a2540] mb-1.5 font-label">
      {children}
    </span>
  );
}

function StudioField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <StudioLabel>{label}</StudioLabel>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-slate-400 font-label">{hint}</span>}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#0a2540] font-label">{label}</span>
        <span className="font-stamp text-xs text-slate-500">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        className="w-full"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 rounded-md border border-[var(--border)] bg-white p-1 cursor-pointer"
      />
      <input
        className={`${inputCls} font-stamp text-xs uppercase`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
