import type { GradeTier } from "../../../_lib/store";

/** Everything the front/back card SVGs need to render a badge. */
export type CardData = {
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

export const CARD_W = 540;
export const CARD_H = 858;

/** Display formatting: "2026-09-15" -> "09 / 15 / 2026". */
export function formatDate(d: string): string {
  if (!d) return "— / — / —";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${m} / ${day} / ${y}`;
}
