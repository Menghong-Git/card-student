"use client";

import { useEffect, useRef, useState } from "react";
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
  Textarea,
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

type FormState = {
  cardType: string;
  cardholderId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  section: string;
  grade: string;
  homeroom: string;
  academicYear: string;
  enrollDate: string;
  notes: string;
  photo: string;
};

const INITIAL: FormState = {
  cardType: "student",
  cardholderId: "BB25-0001",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  section: "",
  grade: "Grade 8",
  homeroom: "",
  academicYear: "2025-2026",
  enrollDate: "",
  notes: "",
  photo: "",
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

export default function CreateCardPage() {
  const [data, setData] = useState<FormState>(INITIAL);
  const [downloading, setDownloading] = useState(false);
  const [frontTpl, setFrontTpl] = useState("");
  const [backTpl, setBackTpl] = useState("");
  const [logo, setLogo] = useState("");
  const [qr, setQr] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const backRef = useRef<SVGSVGElement>(null);

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
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setData((d) => ({ ...d, [key]: e.target.value }) as FormState);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setData((d) => ({ ...d, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => setData((d) => ({ ...d, photo: "" }));
  const reset = () => setData(INITIAL);

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");

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
        description="Issue a Brain Bridge School identification card. Fill in the form and download the print-ready card."
        actions={
          <>
            <Button variant="secondary" onClick={reset} type="button">
              Reset
            </Button>
            <Button
              onClick={downloadPng}
              disabled={downloading}
              type="button"
            >
              {downloading ? "Preparing…" : "Download Card (PNG)"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ===== FORM ===== */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cardholder Information</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Card Type" required>
                <Select value={data.cardType} onChange={set("cardType")}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="visitor">Visitor</option>
                </Select>
              </Field>
              <Field
                label="ID Number"
                required
                hint="Format: BB25-0001"
              >
                <Input
                  value={data.cardholderId}
                  onChange={set("cardholderId")}
                  placeholder="BB25-0001"
                />
              </Field>
              <Field label="First Name" required>
                <Input
                  value={data.firstName}
                  onChange={set("firstName")}
                  placeholder="John"
                />
              </Field>
              <Field label="Last Name" required>
                <Input
                  value={data.lastName}
                  onChange={set("lastName")}
                  placeholder="Doe"
                />
              </Field>
              <Field label="Date of Birth">
                <Input
                  type="date"
                  value={data.dob}
                  onChange={set("dob")}
                />
              </Field>
              <Field label="Gender">
                <Select value={data.gender} onChange={set("gender")}>
                  <option value="" disabled>
                    Select
                  </option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Prefer not to say</option>
                </Select>
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={data.email}
                  onChange={set("email")}
                  placeholder="name@brainbridge.edu"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={data.phone}
                  onChange={set("phone")}
                  placeholder="+1 555 000 0000"
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Affiliation</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Section" required>
                <Select value={data.section} onChange={set("section")}>
                  <option value="" disabled>
                    Select section
                  </option>
                  <option>Early Years</option>
                  <option>Primary School</option>
                  <option>Middle School</option>
                  <option>High School</option>
                </Select>
              </Field>
              <Field label="Grade" required>
                <Select value={data.grade} onChange={set("grade")}>
                  {[
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
                  ].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Homeroom">
                <Input
                  value={data.homeroom}
                  onChange={set("homeroom")}
                  placeholder="e.g. 8-A"
                />
              </Field>
              <Field label="Academic Year">
                <Select
                  value={data.academicYear}
                  onChange={set("academicYear")}
                >
                  <option>2024-2025</option>
                  <option>2025-2026</option>
                  <option>2026-2027</option>
                </Select>
              </Field>
              <Field label="Enrollment Date">
                <Input
                  type="date"
                  value={data.enrollDate}
                  onChange={set("enrollDate")}
                />
              </Field>
              <div />
              <div className="md:col-span-2">
                <Field label="Notes" hint="Optional internal note">
                  <Textarea
                    value={data.notes}
                    onChange={set("notes")}
                    placeholder="Anything the admissions office should know…"
                  />
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

            <div className="flex gap-2">
              <Button
                onClick={downloadPng}
                disabled={downloading}
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
              Export includes both the front and back side by side, at 3×
              resolution (1284 × 1857 px) — print-ready.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
