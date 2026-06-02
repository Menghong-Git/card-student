"use client";

import { CARD_H, CARD_W } from "./types";

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function serialize(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(CARD_W));
  clone.setAttribute("height", String(CARD_H));
  return new XMLSerializer().serializeToString(clone);
}

/**
 * Rasterize a card SVG to a high-DPI PNG. The SVG is self-contained (all
 * imagery is inline or data-URL), so serialize → <img> → canvas yields a crisp,
 * print-ready badge — sharper than html2canvas and with no extra runtime dep.
 */
export async function downloadCardPng(
  svg: SVGSVGElement,
  filename: string,
  scale = 3,
): Promise<void> {
  const source = serialize(svg);
  const svgUrl = URL.createObjectURL(
    new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed to rasterize card"));
      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = CARD_W * scale;
    canvas.height = CARD_H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("PNG encode failed"))),
        "image/png",
      ),
    );
    triggerDownload(URL.createObjectURL(blob), filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function downloadCardSvg(svg: SVGSVGElement, filename: string): void {
  const source = serialize(svg);
  const url = URL.createObjectURL(
    new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
  );
  triggerDownload(url, filename);
}

export function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "card"
  );
}
