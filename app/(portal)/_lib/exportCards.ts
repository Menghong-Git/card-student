"use client";

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import JSZip from "jszip";
import StudentIdCard, {
  type StudentIdCardData,
} from "../card/create/_components/StudentIdCard";
import StudentIdCardBack, {
  type StudentIdCardBackData,
} from "../card/create/_components/StudentIdCardBack";
import TeacherIdCard, {
  type TeacherIdCardData,
} from "../card/create/_components/TeacherIdCard";
import TeacherIdCardBack, {
  type TeacherIdCardBackData,
} from "../card/create/_components/TeacherIdCardBack";
import {
  loadFrontTemplate,
  loadBackTemplate,
  loadTeacherFrontTemplate,
  loadTeacherBackTemplate,
  FRONT_SIZE,
  BACK_SIZE,
} from "./templates";
import { loadLogoDataUrl, loadImageDataUrl } from "./logo";
import { makeQrDataUrl } from "./qr";
import type { CardType } from "./store";

const CARD_GAP = 40;
const EXPORT_SCALE = 2;

type Size = { w: number; h: number };

export type CardExportRecord = {
  id: string;
  name: string;
  email?: string;
  type?: CardType;
  section?: string;
  grade?: string;
  dob?: string;
  joined?: string;
  expires?: string;
  photo?: string;
  image?: string;
};

/** Final raster sizes for export. Front sets the height; the back (a different
 *  aspect ratio) is scaled to the same height so they line up side by side. */
function exportSizes(): { front: Size; back: Size; gap: number } {
  const h = FRONT_SIZE.h * EXPORT_SCALE;
  return {
    front: { w: FRONT_SIZE.w * EXPORT_SCALE, h },
    back: { w: Math.round((h * BACK_SIZE.w) / BACK_SIZE.h), h },
    gap: CARD_GAP * EXPORT_SCALE,
  };
}

/** Render a DOB for the card: ISO (yyyy-mm-dd) → "MM / DD / YYYY", else as-is. */
function formatDob(value: string | undefined): string {
  const d = (value ?? "").trim();
  if (!d) return "—";
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[2]} / ${m[3]} / ${m[1]}` : d;
}

function formatLongDate(
  value: string | undefined,
  fallback = "Date of Joining",
): string {
  const d = (value ?? "").trim();
  if (!d) return fallback;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return d;
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
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
}

/** Resolve a photo (data URI or URL) to an embeddable data URI; the export
 *  rasterizer can't load external URLs, so URLs are fetched + inlined. */
async function resolvePhoto(raw: string | undefined): Promise<string> {
  const p = (raw ?? "").trim();
  if (!p) return "";
  if (p.startsWith("data:")) return p;
  try {
    return await loadImageDataUrl(p);
  } catch {
    return ""; // fall back to the card's photo placeholder
  }
}

function studentToCardData(
  s: CardExportRecord,
  template: string,
  logo: string,
  qr: string,
  photo: string,
): StudentIdCardData {
  return {
    name: s.name,
    id: s.id,
    grade: s.grade ?? "",
    dob: formatDob(s.dob),
    photo,
    template,
    logo,
    qr,
  };
}

function teacherToCardData(
  t: CardExportRecord,
  template: string,
  logo: string,
  qr: string,
  photo: string,
): TeacherIdCardData {
  return {
    name: t.name,
    id: t.id,
    email: t.email ?? "",
    title: t.grade || "Teacher",
    department: t.section || "Department",
    joined: formatLongDate(t.joined ?? t.dob, "Date of Joining"),
    photo,
    template,
    logo,
    qr,
  };
}

function studentToBackData(template: string): StudentIdCardBackData {
  return { template };
}

function teacherToBackData(
  template: string,
  record: CardExportRecord,
): TeacherIdCardBackData {
  return { template, expires: formatLongDate(record.expires, "31 March 2026") };
}

function safeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function renderCardSvg(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  data: object,
  size: { w: number; h: number },
): Promise<string> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${size.w}px`;
  container.style.height = `${size.h}px`;
  container.style.pointerEvents = "none";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    // flushSync forces React 19's concurrent renderer to commit synchronously,
    // so the <svg> is guaranteed to be in the DOM on the next line.
    flushSync(() => {
      root.render(createElement(component, data));
    });
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("Card SVG did not mount");
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    // Explicit pixel size so the SVG rasterizes at a known resolution when
    // loaded as an <img> (width="100%" has no containing block there).
    svg.setAttribute("width", String(size.w));
    svg.setAttribute("height", String(size.h));
    return new XMLSerializer().serializeToString(svg);
  } finally {
    root.unmount();
    if (container.parentNode) container.parentNode.removeChild(container);
  }
}

function loadSvgImage(svgMarkup: string): Promise<HTMLImageElement> {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = "sync";
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize card SVG"));
    };
    img.src = url;
  });
}

/** Compose front + back card SVGs side by side into a single PNG blob. */
async function composeCardsPngBlob(
  frontMarkup: string,
  backMarkup: string,
  front: Size,
  back: Size,
  gap: number,
): Promise<Blob> {
  const [frontImg, backImg] = await Promise.all([
    loadSvgImage(frontMarkup),
    loadSvgImage(backMarkup),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = front.w + gap + back.w;
  canvas.height = Math.max(front.h, back.h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frontImg, 0, 0, front.w, front.h);
  ctx.drawImage(backImg, front.w + gap, 0, back.w, back.h);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))),
      "image/png",
    );
  });
}

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

export async function renderCardPng(record: CardExportRecord): Promise<Blob> {
  const isTeacher = record.type === "Teacher";
  const [frontTemplate, backTemplate, logo, qr, photo] = await Promise.all([
    isTeacher ? loadTeacherFrontTemplate() : loadFrontTemplate(),
    isTeacher ? loadTeacherBackTemplate() : loadBackTemplate(),
    loadLogoDataUrl(),
    makeQrDataUrl(record.id),
    resolvePhoto(record.photo ?? record.image),
  ]);
  const sizes = exportSizes();
  const frontData = isTeacher
    ? teacherToCardData(record, frontTemplate, logo, qr, photo)
    : studentToCardData(record, frontTemplate, logo, qr, photo);
  const backSize = isTeacher ? sizes.front : sizes.back;
  const [front, back] = await Promise.all([
    renderCardSvg(isTeacher ? TeacherIdCard : StudentIdCard, frontData, sizes.front),
    renderCardSvg(
      isTeacher ? TeacherIdCardBack : StudentIdCardBack,
      isTeacher
        ? teacherToBackData(backTemplate, record)
        : studentToBackData(backTemplate),
      backSize,
    ),
  ]);
  return composeCardsPngBlob(front, back, sizes.front, backSize, sizes.gap);
}

export async function exportSingleCard(record: CardExportRecord): Promise<void> {
  const blob = await renderCardPng(record);
  const filename = `${safeFilename(record.name || "card")}-${safeFilename(record.id || "id")}.png`;
  triggerDownload(blob, filename);
}

export async function exportCardsAsZip(
  records: CardExportRecord[],
  zipName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (records.length === 0) return;
  const zip = new JSZip();
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const blob = await renderCardPng(record);
    const filename = `${String(i + 1).padStart(3, "0")}-${safeFilename(record.name || "card")}-${safeFilename(record.id || "id")}.png`;
    zip.file(filename, blob);
    onProgress?.(i + 1, records.length);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, zipName);
}
