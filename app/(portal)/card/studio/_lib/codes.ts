"use client";

import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

/**
 * Build the QR module matrix for a payload. Pure (no DOM), so it is safe to
 * call during render on both server and client — it always returns the same
 * matrix for the same input, avoiding hydration mismatches.
 */
export function qrMatrix(payload: string): boolean[][] {
  const text = payload && payload.trim() ? payload.trim() : "BRAIN-BRIDGE";
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const rows: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(Boolean(qr.modules.get(r, c)));
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Render a scan-ready CODE128 barcode for the given value to a PNG data URL.
 * Requires the DOM (canvas), so callers must invoke this only on the client
 * (e.g. inside an effect). Returns "" if encoding fails or DOM is absent.
 */
export function code128DataUrl(value: string): string {
  if (typeof document === "undefined") return "";
  const clean = (value && value.trim() ? value : "0000000")
    // CODE128 (set B) covers printable ASCII 32–126.
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, 32);
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, clean || "0000000", {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 3,
      height: 160,
      background: "#ffffff",
      lineColor: "#0a2540",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}
