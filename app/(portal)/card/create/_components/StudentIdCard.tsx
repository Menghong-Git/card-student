"use client";

import { forwardRef } from "react";
import { FRONT_SIZE } from "../../../_lib/templates";

export type StudentIdCardData = {
  name: string;
  id: string;
  grade: string;
  dob: string;
  /** Base64 data URI of the cardholder photo (optional). */
  photo: string;
  /** Base64 data URI of the blank front frame artwork. */
  template: string;
  /** Base64 data URI of the school logo (drawn at the top). */
  logo: string;
  /** Base64 data URI of the generated QR code (optional). */
  qr?: string;
};

const { w: W, h: H } = FRONT_SIZE; // 1024 × 1536
const NAVY = "#0d2050";
const GOLD = "#c9a24a";
const VALUE = "#16264f";
const PHOTO_BG = "#e9ecf2";

/* ---- Layout (in 1024×1536 frame pixel space) -------------------------------
   The frame supplies the logo, badges, side chevrons and bottom navy/bridge
   band. Everything below is drawn into the empty white middle. Tweak here. */
const LOGO = { x: 282, y: 54, w: 460, h: 420 };
const PHOTO = { x: 387, y: 548, w: 250, h: 262, r: 20 };
const ROW_Y = [898, 968, 1038, 1108];
const ICON_X = 244;
const DIV_X = 306;
const LABEL_X = 332;
const VALUE_X = 648;
const ROW_FONT = 30;
const SEP_X1 = 226;
const SEP_X2 = 798;
const TORCH_Y = 1184;
const MOTTO_Y = 1258;
const QR = { cx: 512, cy: 1415, box: 150, pad: 14 };

/** Row icon, drawn around its own origin then placed + scaled per row. */
function RowIcon({ kind }: { kind: number }) {
  if (kind === 0) {
    // person
    return (
      <g fill={NAVY}>
        <circle cx="0" cy="-5" r="11" />
        <path d="M -20 26 Q -20 7 0 7 Q 20 7 20 26 Z" />
      </g>
    );
  }
  if (kind === 1) {
    // id card
    return (
      <g fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round">
        <rect x="-22" y="-15" width="44" height="33" rx="4.5" />
        <circle cx="-9" cy="-2" r="5.5" fill={NAVY} stroke="none" />
        <line x1="5" y1="-6" x2="16" y2="-6" />
        <line x1="5" y1="2" x2="16" y2="2" />
        <line x1="-16" y1="11" x2="16" y2="11" />
      </g>
    );
  }
  if (kind === 2) {
    // graduation cap
    return (
      <g fill={NAVY}>
        <path d="M -24 0 L 0 -13 L 24 0 L 0 13 Z" />
        <path
          d="M -13 7 L -13 18 Q 0 26 13 18 L 13 7"
          fill="none"
          stroke={NAVY}
          strokeWidth="3"
        />
        <line x1="21" y1="-2" x2="21" y2="16" stroke={NAVY} strokeWidth="2.6" />
        <circle cx="21" cy="18" r="3" />
      </g>
    );
  }
  // calendar
  return (
    <g fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round">
      <rect x="-22" y="-13" width="44" height="37" rx="4.5" />
      <line x1="-22" y1="-3" x2="22" y2="-3" />
      <line x1="-11" y1="-19" x2="-11" y2="-7" />
      <line x1="11" y1="-19" x2="11" y2="-7" />
      <circle cx="-8" cy="7" r="2.2" fill={NAVY} stroke="none" />
      <circle cx="0" cy="7" r="2.2" fill={NAVY} stroke="none" />
      <circle cx="8" cy="7" r="2.2" fill={NAVY} stroke="none" />
      <circle cx="-8" cy="16" r="2.2" fill={NAVY} stroke="none" />
      <circle cx="0" cy="16" r="2.2" fill={NAVY} stroke="none" />
    </g>
  );
}

/**
 * Brain Bridge School student ID card — FRONT.
 * The designed frame (public/template/front.png) is the background; the photo,
 * student fields, motto and QR are drawn into its empty middle. Pure SVG so it
 * serializes cleanly to canvas → PNG for export.
 */
const StudentIdCard = forwardRef<SVGSVGElement, StudentIdCardData>(
  function StudentIdCard(
    { name, id, grade, dob, photo, template, logo, qr },
    ref,
  ) {
    const values = [name, id, grade, dob];
    const half = QR.box / 2;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: "block" }}
      >
        <defs>
          <clipPath id="bbFrontPhotoClip">
            <rect
              x={PHOTO.x}
              y={PHOTO.y}
              width={PHOTO.w}
              height={PHOTO.h}
              rx={PHOTO.r}
              ry={PHOTO.r}
            />
          </clipPath>
        </defs>

        {/* ===== FRAME BACKGROUND ===== */}
        {template ? (
          <image
            href={template}
            x="0"
            y="0"
            width={W}
            height={H}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}

        {/* ===== SCHOOL LOGO ===== */}
        {logo ? (
          <image
            href={logo}
            x={LOGO.x}
            y={LOGO.y}
            width={LOGO.w}
            height={LOGO.h}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}

        {/* ===== PHOTO BOX ===== */}
        <rect
          x={PHOTO.x}
          y={PHOTO.y}
          width={PHOTO.w}
          height={PHOTO.h}
          rx={PHOTO.r}
          ry={PHOTO.r}
          fill={PHOTO_BG}
          stroke={GOLD}
          strokeWidth="4"
        />
        {photo ? (
          <g clipPath="url(#bbFrontPhotoClip)">
            <image
              href={photo}
              x={PHOTO.x}
              y={PHOTO.y}
              width={PHOTO.w}
              height={PHOTO.h}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        ) : (
          <g
            transform={`translate(${PHOTO.x + PHOTO.w / 2} ${PHOTO.y + PHOTO.h / 2 - 10})`}
            fill="#aab1c0"
          >
            <circle cx="0" cy="-40" r="48" />
            <path d="M -92 96 Q -92 6 0 6 Q 92 6 92 96 Z" />
          </g>
        )}

        {/* ===== INFO ROWS ===== */}
        {values.map((value, i) => {
          const y = ROW_Y[i];
          const labels = ["NAME", "ID NUMBER", "GRADE", "DATE OF BIRTH"];
          return (
            <g key={i}>
              <g transform={`translate(${ICON_X} ${y - 3}) scale(0.9)`}>
                <RowIcon kind={i} />
              </g>
              <line
                x1={DIV_X}
                y1={y - 22}
                x2={DIV_X}
                y2={y + 22}
                stroke={GOLD}
                strokeWidth="3"
              />
              <text
                x={LABEL_X}
                y={y + ROW_FONT * 0.34}
                fontSize={ROW_FONT}
                fontWeight="700"
                fill={NAVY}
                fontFamily="Georgia, 'Times New Roman', serif"
                letterSpacing="0.5"
              >
                {labels[i]}
              </text>
              <text
                x={VALUE_X}
                y={y + ROW_FONT * 0.34}
                fontSize={ROW_FONT}
                fill={VALUE}
                fontFamily="Georgia, 'Times New Roman', serif"
              >
                {value}
              </text>
              {i < 3 && (
                <line
                  x1={SEP_X1}
                  y1={y + 34}
                  x2={SEP_X2}
                  y2={y + 34}
                  stroke="#dde1ea"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}

        {/* ===== TORCH SHIELD DIVIDER ===== */}
        <g transform={`translate(${W / 2} ${TORCH_Y})`}>
          {/* gold divider lines flanking the shield */}
          <line x1="-320" y1="2" x2="-52" y2="2" stroke={GOLD} strokeWidth="2.5" />
          <line x1="52" y1="2" x2="320" y2="2" stroke={GOLD} strokeWidth="2.5" />
          {/* solid navy shield with gold torch */}
          <g transform="scale(1.55)">
            <path
              d="M -19 -21 L 19 -21 L 19 1 Q 19 15 0 25 Q -19 15 -19 1 Z"
              fill={NAVY}
              stroke={GOLD}
              strokeWidth="1.4"
            />
            <path
              d="M 0 -15 C -6 -9 -5 -3 0 -2 C 5 -3 6 -9 0 -15 Z"
              fill={GOLD}
            />
            <rect x="-2" y="-3" width="4" height="13" rx="1" fill={GOLD} />
            <path d="M -7 9 L 7 9 L 5 14 L -5 14 Z" fill={GOLD} />
          </g>
        </g>

        {/* ===== MOTTO ===== */}
        <text
          x={W / 2}
          y={MOTTO_Y}
          textAnchor="middle"
          fontSize="25"
          fontWeight="700"
          fill={NAVY}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="3"
        >
          <tspan>DISCIPLINE</tspan>
          <tspan fill={GOLD}>{"   •   "}</tspan>
          <tspan fill={NAVY}>MORALITY</tspan>
          <tspan fill={GOLD}>{"   •   "}</tspan>
          <tspan fill={NAVY}>LEADERSHIP</tspan>
        </text>

        {/* ===== QR CODE ===== */}
        <rect
          x={QR.cx - half}
          y={QR.cy - half}
          width={QR.box}
          height={QR.box}
          rx="12"
          fill="#ffffff"
          stroke={GOLD}
          strokeWidth="5"
        />
        {qr ? (
          <image
            href={qr}
            x={QR.cx - half + QR.pad}
            y={QR.cy - half + QR.pad}
            width={QR.box - QR.pad * 2}
            height={QR.box - QR.pad * 2}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}
      </svg>
    );
  },
);

export default StudentIdCard;
