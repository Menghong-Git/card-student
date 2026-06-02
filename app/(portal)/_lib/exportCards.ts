"use client";

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import JSZip from "jszip";
import StudentIdCard, {
  type StudentIdCardData,
} from "../card/create/_components/StudentIdCard";
import type { Student } from "./store";

const CARD_WIDTH = 540;
const CARD_HEIGHT = 858;
const EXPORT_SCALE = 2;

function studentToCardData(s: Student): StudentIdCardData {
  return {
    name: s.name,
    id: s.id,
    grade: s.grade,
    dob: s.dob && s.dob.trim() ? s.dob : "—",
    photo: "",
  };
}

function safeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function renderCardSvg(data: StudentIdCardData): Promise<string> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${CARD_WIDTH}px`;
  container.style.height = `${CARD_HEIGHT}px`;
  container.style.pointerEvents = "none";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    await new Promise<void>((resolve) => {
      root.render(createElement(StudentIdCard, data));
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("Card SVG did not mount");
    if (!svg.getAttribute("xmlns")) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    return new XMLSerializer().serializeToString(svg);
  } finally {
    root.unmount();
    if (container.parentNode) container.parentNode.removeChild(container);
  }
}

async function svgToPngBlob(svgMarkup: string): Promise<Blob> {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "sync";
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to rasterize card SVG"));
    });
    const width = CARD_WIDTH * EXPORT_SCALE;
    const height = CARD_HEIGHT * EXPORT_SCALE;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
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

export async function renderCardPng(student: Student): Promise<Blob> {
  const svg = await renderCardSvg(studentToCardData(student));
  return svgToPngBlob(svg);
}

export async function exportSingleCard(student: Student): Promise<void> {
  const blob = await renderCardPng(student);
  const filename = `${safeFilename(student.name || "card")}-${safeFilename(student.id || "id")}.png`;
  triggerDownload(blob, filename);
}

export async function exportCardsAsZip(
  students: Student[],
  zipName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (students.length === 0) return;
  const zip = new JSZip();
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const blob = await renderCardPng(s);
    const filename = `${String(i + 1).padStart(3, "0")}-${safeFilename(s.name || "card")}-${safeFilename(s.id || "id")}.png`;
    zip.file(filename, blob);
    onProgress?.(i + 1, students.length);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, zipName);
}
