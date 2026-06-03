"use client";

import { loadImageDataUrl } from "./logo";

/**
 * Blank card artwork (designed, not code-drawn) used as the fixed background
 * for the exported ID card. The app overlays only the per-student data on top,
 * so the export is a 1:1 match of this design.
 */
export const FRONT_TEMPLATE_URL = "/template/front.png";
export const BACK_TEMPLATE_URL = "/template/back.png";

/** Native pixel size of each template — drives the SVG viewBox so the
 *  artwork is never distorted and overlay coordinates map 1:1 to the image. */
export const FRONT_SIZE = { w: 1024, h: 1536 } as const;
export const BACK_SIZE = { w: 427, h: 607 } as const;

export function loadFrontTemplate(): Promise<string> {
  return loadImageDataUrl(FRONT_TEMPLATE_URL);
}

export function loadBackTemplate(): Promise<string> {
  return loadImageDataUrl(BACK_TEMPLATE_URL);
}
