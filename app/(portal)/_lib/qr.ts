"use client";

import QRCode from "qrcode";

const NAVY = "#0d2050";

const cache = new Map<string, Promise<string>>();

/**
 * Render a real, scannable QR code as a PNG data URI (navy modules on white),
 * cached per payload so the preview and bulk export don't re-encode the same
 * value repeatedly. The data URI embeds directly into the card SVG, so it
 * survives the SVG → canvas → PNG export pipeline.
 */
export function makeQrDataUrl(text: string): Promise<string> {
  const payload = text && text.trim() ? text : "BB25-0000";
  const existing = cache.get(payload);
  if (existing) return existing;
  const promise = QRCode.toDataURL(payload, {
    margin: 0,
    width: 256,
    errorCorrectionLevel: "M",
    color: { dark: NAVY, light: "#ffffff" },
  }).catch((err) => {
    cache.delete(payload);
    throw err;
  });
  cache.set(payload, promise);
  return promise;
}
