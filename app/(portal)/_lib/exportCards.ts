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

/** File format for a downloaded card: a raster JPEG, or that same image
 *  embedded in a PDF page sized to match. */
export type ExportFormat = "jpg" | "pdf";

type Size = { w: number; h: number };

/**
 * Physical output size for the card. "auto" keeps the existing single-image
 * layout (front + back side by side, sized to the design's own resolution).
 * The others are standard blank-card sizes used by ID/badge printers — when
 * one is picked, front and back are each fit (with a margin) onto their own
 * page/image at that exact physical size, so the export matches the stock
 * the school prints onto.
 */
export type CardFrameSize = "auto" | "cr79" | "cr80" | "cr100";

export const CARD_FRAME_OPTIONS: { value: CardFrameSize; label: string }[] = [
  { value: "auto", label: "Auto (front + back)" },
  { value: "cr79", label: "CR79 (2.051 × 3.303 in)" },
  { value: "cr80", label: "CR80 – Standard ID (2.125 × 3.375 in)" },
  { value: "cr100", label: "CR100 (2.63 × 3.88 in)" },
];

const CARD_FRAME_DIMENSIONS_IN: Record<Exclude<CardFrameSize, "auto">, Size> = {
  cr79: { w: 2.051, h: 3.303 },
  cr80: { w: 2.125, h: 3.375 },
  cr100: { w: 2.63, h: 3.88 },
};

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

/** Quality for the exported JPEG. The composited canvas is opaque (no
 *  transparency needed), and JPEG keeps file size consistent across card
 *  designs — a lossless PNG of the teacher card's photographic template
 *  balloons to several MB while the student card (flatter, native-res PNG
 *  art) stays small, even though both render at the same pixel dimensions. */
const EXPORT_JPEG_QUALITY = 0.92;

/** Outer white margin around the "auto" front+back composite, as a fraction
 *  of the shorter side — otherwise the artwork touches the image/page edge
 *  with no border at all. */
const AUTO_MARGIN_FRACTION = 0.04;

type RenderedCard = { blob: Blob; width: number; height: number };

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed"))),
      "image/jpeg",
      EXPORT_JPEG_QUALITY,
    );
  });
}

/** Compose front + back card SVGs side by side, padded with a white margin,
 *  into a single JPEG blob. */
async function composeCardsImageBlob(
  frontMarkup: string,
  backMarkup: string,
  front: Size,
  back: Size,
  gap: number,
): Promise<RenderedCard> {
  const [frontImg, backImg] = await Promise.all([
    loadSvgImage(frontMarkup),
    loadSvgImage(backMarkup),
  ]);
  const contentW = front.w + gap + back.w;
  const contentH = Math.max(front.h, back.h);
  const margin = Math.round(Math.min(contentW, contentH) * AUTO_MARGIN_FRACTION);
  const canvas = document.createElement("canvas");
  canvas.width = contentW + margin * 2;
  canvas.height = contentH + margin * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frontImg, margin, margin + (contentH - front.h) / 2, front.w, front.h);
  ctx.drawImage(
    backImg,
    margin + front.w + gap,
    margin + (contentH - back.h) / 2,
    back.w,
    back.h,
  );
  const blob = await canvasToJpegBlob(canvas);
  return { blob, width: canvas.width, height: canvas.height };
}

/** Margin inside a standard-size card frame, as a fraction of the frame's
 *  shorter side — keeps the artwork off the card edge instead of full-bleed. */
const CARD_FRAME_MARGIN_FRACTION = 0.06;

/** Raster resolution used when fitting a card side into a physical frame
 *  size, and when converting export pixels to PDF page inches. */
const CARD_EXPORT_DPI = 300;

function pxToIn(px: number): number {
  return px / CARD_EXPORT_DPI;
}

/** Draw one card side into a cell, filling a shared "card box" exactly and
 *  centered. Both front and back are drawn at the identical box size — a
 *  physical card's two sides must be the same size, but the front/back
 *  template art doesn't share an exact aspect ratio (front is ~2:3, back is
 *  ~427:607), so fitting each side to its own aspect ratio made them render
 *  at visibly different sizes. Filling the same box (~5% stretch on the
 *  back, front unaffected since the box is derived from its own aspect)
 *  keeps both sides the same size. */
function drawMarkupInBox(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: Size,
  cellX: number,
  cellW: number,
  cellH: number,
) {
  const offsetX = cellX + (cellW - box.w) / 2;
  const offsetY = (cellH - box.h) / 2;
  ctx.drawImage(img, offsetX, offsetY, box.w, box.h);
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

/** Render the front/back SVG markup for a record — shared by both the
 *  "auto" combined layout and the standard-frame-size layout. */
async function renderCardMarkups(record: CardExportRecord): Promise<{
  frontMarkup: string;
  backMarkup: string;
  frontSize: Size;
  backSize: Size;
  gap: number;
}> {
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
  const [frontMarkup, backMarkup] = await Promise.all([
    renderCardSvg(isTeacher ? TeacherIdCard : StudentIdCard, frontData, sizes.front),
    renderCardSvg(
      isTeacher ? TeacherIdCardBack : StudentIdCardBack,
      isTeacher
        ? teacherToBackData(backTemplate, record)
        : studentToBackData(backTemplate),
      backSize,
    ),
  ]);
  return { frontMarkup, backMarkup, frontSize: sizes.front, backSize, gap: sizes.gap };
}

/** "Auto" layout: front + back side by side in one padded image. */
async function renderCardImage(record: CardExportRecord): Promise<RenderedCard> {
  const { frontMarkup, backMarkup, frontSize, backSize, gap } =
    await renderCardMarkups(record);
  return composeCardsImageBlob(frontMarkup, backMarkup, frontSize, backSize, gap);
}

/** Standard-frame layout: front and back fit into two same-size cells side
 *  by side on one image/page, each cell exactly the chosen physical card
 *  size (so each half prints at true CR79/CR80/CR100 dimensions). */
async function renderCardFrameImage(
  record: CardExportRecord,
  frame: Size,
): Promise<RenderedCard> {
  const { frontMarkup, backMarkup, frontSize } = await renderCardMarkups(record);
  const cellW = Math.round(frame.w * CARD_EXPORT_DPI);
  const cellH = Math.round(frame.h * CARD_EXPORT_DPI);
  const gap = Math.round(Math.min(cellW, cellH) * AUTO_MARGIN_FRACTION);
  const margin = Math.round(Math.min(cellW, cellH) * CARD_FRAME_MARGIN_FRACTION);

  // Box derived from the front template's own aspect ratio — front fills it
  // with no distortion, and back is drawn at this same size (see
  // drawMarkupInBox) so both sides come out the same physical size.
  const box: Size = {
    w: cellW - margin * 2,
    h: cellH - margin * 2,
  };
  const boxScale = Math.min(box.w / frontSize.w, box.h / frontSize.h);
  box.w = frontSize.w * boxScale;
  box.h = frontSize.h * boxScale;

  const [frontImg, backImg] = await Promise.all([
    loadSvgImage(frontMarkup),
    loadSvgImage(backMarkup),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = cellW * 2 + gap;
  canvas.height = cellH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMarkupInBox(ctx, frontImg, box, 0, cellW, cellH);
  drawMarkupInBox(ctx, backImg, box, cellW + gap, cellW, cellH);

  const blob = await canvasToJpegBlob(canvas);
  return { blob, width: canvas.width, height: canvas.height };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read rendered card image"));
    reader.readAsDataURL(blob);
  });
}

/** Render one record as a single front+back image, either the "auto" layout
 *  or fit onto the chosen standard card frame size. */
function renderCardForExport(
  record: CardExportRecord,
  frameSize: CardFrameSize,
): Promise<RenderedCard> {
  if (frameSize === "auto") return renderCardImage(record);
  return renderCardFrameImage(record, CARD_FRAME_DIMENSIONS_IN[frameSize]);
}

/** Build a PDF with one page per record, each page sized to that record's
 *  rendered image (the exact physical card size when a frame is chosen). */
async function renderCardsPdfBlob(
  records: CardExportRecord[],
  frameSize: CardFrameSize,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  type Doc = InstanceType<typeof jsPDF>;

  let doc: Doc | null = null;
  for (let i = 0; i < records.length; i++) {
    const { blob, width, height } = await renderCardForExport(records[i], frameSize);
    const dataUrl = await blobToDataUrl(blob);
    const pageW = pxToIn(width);
    const pageH = pxToIn(height);
    const orientation = pageW >= pageH ? "landscape" : "portrait";
    if (!doc) {
      doc = new jsPDF({ orientation, unit: "in", format: [pageW, pageH] });
    } else {
      doc.addPage([pageW, pageH], orientation);
    }
    doc.addImage(dataUrl, "JPEG", 0, 0, pageW, pageH);
    onProgress?.(i + 1, records.length);
  }
  if (!doc) throw new Error("No cards to export");
  return doc.output("blob");
}

export async function exportSingleCard(
  record: CardExportRecord,
  format: ExportFormat = "jpg",
  frameSize: CardFrameSize = "auto",
): Promise<void> {
  const baseName = `${safeFilename(record.name || "card")}-${safeFilename(record.id || "id")}`;
  if (format === "pdf") {
    const blob = await renderCardsPdfBlob([record], frameSize);
    triggerDownload(blob, `${baseName}.pdf`);
    return;
  }
  const { blob } = await renderCardForExport(record, frameSize);
  triggerDownload(blob, `${baseName}.jpg`);
}

export async function exportCardsAsZip(
  records: CardExportRecord[],
  zipName: string,
  frameSize: CardFrameSize = "auto",
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (records.length === 0) return;
  const zip = new JSZip();
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const prefix = `${String(i + 1).padStart(3, "0")}-${safeFilename(record.name || "card")}-${safeFilename(record.id || "id")}`;
    const { blob } = await renderCardForExport(record, frameSize);
    zip.file(`${prefix}.jpg`, blob);
    onProgress?.(i + 1, records.length);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, zipName);
}

/** Export many records as a single multi-page PDF. */
export async function exportCardsAsPdf(
  records: CardExportRecord[],
  pdfName: string,
  frameSize: CardFrameSize = "auto",
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (records.length === 0) return;
  const blob = await renderCardsPdfBlob(records, frameSize, onProgress);
  triggerDownload(blob, pdfName);
}

/** Export many records, choosing ZIP-of-JPGs or a single multi-page PDF, at
 *  the given card frame size. */
export async function exportCards(
  records: CardExportRecord[],
  baseName: string,
  format: ExportFormat,
  frameSize: CardFrameSize = "auto",
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (format === "pdf") {
    await exportCardsAsPdf(records, `${baseName}.pdf`, frameSize, onProgress);
  } else {
    await exportCardsAsZip(records, `${baseName}.zip`, frameSize, onProgress);
  }
}
