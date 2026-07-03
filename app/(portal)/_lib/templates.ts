"use client";

import { loadImageDataUrl } from "./logo";

/**
 * Blank card artwork (designed, not code-drawn) used as the fixed background
 * for the exported ID card. The app overlays only the per-student data on top,
 * so the export is a 1:1 match of this design.
 */
export const FRONT_TEMPLATE_URL = "/template/front.png";
export const BACK_TEMPLATE_URL = "/template/back.png";
export const TEACHER_FRONT_TEMPLATE_URL =
  "/template-teacher/front-teacher-card.jpg";
export const TEACHER_BACK_TEMPLATE_URL =
  "/template-teacher/back-teacher-card.jpg";

/** Native pixel size of each template — drives the SVG viewBox so the
 *  artwork is never distorted and overlay coordinates map 1:1 to the image. */
export const FRONT_SIZE = { w: 1024, h: 1536 } as const;
export const BACK_SIZE = { w: 427, h: 607 } as const;

/**
 * The teacher front/back JPGs are card mockups on a padded canvas, and each
 * has a different amount of padding around the card art. Cropping to the
 * card's own bounding box (measured in the raw 853x1536 source pixels)
 * before stretching to FRONT_SIZE makes both sides fill the same frame.
 */
export const TEACHER_TEMPLATE_NATURAL_SIZE = { w: 853, h: 1280 } as const;
export const TEACHER_FRONT_CROP = { x: 112, y: 84, w: 631, h: 1114 } as const;
export const TEACHER_BACK_CROP = { x: 80, y: 20, w: 694, h: 1242 } as const;

/** Maps a crop rect (in source-image pixels) to the <image> x/y/width/height
 *  needed so that crop fills the full targetW x targetH viewBox. */
export function cropToFill(
  crop: { x: number; y: number; w: number; h: number },
  natural: { w: number; h: number },
  target: { w: number; h: number },
) {
  const scaleX = target.w / crop.w;
  const scaleY = target.h / crop.h;
  return {
    x: -crop.x * scaleX,
    y: -crop.y * scaleY,
    width: natural.w * scaleX,
    height: natural.h * scaleY,
  };
}

export function loadFrontTemplate(): Promise<string> {
  return loadImageDataUrl(FRONT_TEMPLATE_URL);
}

export function loadBackTemplate(): Promise<string> {
  return loadImageDataUrl(BACK_TEMPLATE_URL);
}

export function loadTeacherFrontTemplate(): Promise<string> {
  return loadImageDataUrl(TEACHER_FRONT_TEMPLATE_URL);
}

export function loadTeacherBackTemplate(): Promise<string> {
  return loadImageDataUrl(TEACHER_BACK_TEMPLATE_URL);
}
