"use client";

import { forwardRef } from "react";
import {
  FRONT_SIZE,
  TEACHER_FRONT_CROP,
  TEACHER_TEMPLATE_NATURAL_SIZE,
  cropToFill,
} from "../../../_lib/templates";

export type TeacherIdCardData = {
  name: string;
  id: string;
  email: string;
  title: string;
  department: string;
  joined: string;
  /** Base64 data URI of the teacher front layout image. */
  template: string;
  /** Kept for API compatibility; teacher front uses text branding instead. */
  logo?: string;
  /** Base64 data URI of the cardholder photo (optional). */
  photo: string;
  /** Base64 data URI of the generated QR code (optional). */
  qr?: string;
};

const { w: W, h: H } = FRONT_SIZE;
const NAVY = "#082544";
const GOLD = "#c69a3c";
const TEXT = "#102341";
const VALUE = "#374151";
const LINE = "#d9dce2";

const CARD = { x: 142, y: 108, w: 740, h: 1320 };
const CENTER_X = CARD.x + CARD.w / 2;
const PHOTO = { x: 312, y: 412, w: 400, h: 330, r: 20 };
const ROW_Y = [948, 1006, 1064, 1122];
const ICON_X = CARD.x + 64;
const LABEL_X = CARD.x + 124;
const VALUE_X = CARD.x + 420;
const ROW_RIGHT = CARD.x + CARD.w - 56;
const QR = { x: 430, y: 1214, size: 164, pad: 12 };
const FRONT_IMAGE = cropToFill(TEACHER_FRONT_CROP, TEACHER_TEMPLATE_NATURAL_SIZE, FRONT_SIZE);

function valueSize(value: string) {
  if (value.length > 34) return 20;
  if (value.length > 27) return 22;
  return 25;
}

function fittedLength(value: string, fontSize: number, maxWidth: number) {
  const estimated = value.length * fontSize * 0.55;
  return estimated > maxWidth ? maxWidth : undefined;
}

function Icon({ kind, x, y }: { kind: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="24" fill={NAVY} />
      {kind === 0 && (
        <g fill="#ffffff">
          <circle cx="0" cy="-8" r="7" />
          <path d="M -13 14 Q -13 0 0 0 Q 13 0 13 14 Z" />
        </g>
      )}
      {kind === 1 && (
        <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
          <rect x="-13" y="-9" width="26" height="20" rx="3" />
          <path d="M -7 -9 V -15 H 7 V -9" />
          <path d="M -13 -1 H 13" />
        </g>
      )}
      {kind === 2 && (
        <g fill="none" stroke="#ffffff" strokeWidth="3.3" strokeLinecap="round">
          <rect x="-13" y="-12" width="26" height="27" rx="3" />
          <path d="M -13 -4 H 13" />
          <path d="M -7 -17 V -9 M 7 -17 V -9" />
          <path d="M -7 4 H 7 M -7 11 H 3" />
        </g>
      )}
      {kind === 3 && (
        <g fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round">
          <rect x="-14" y="-10" width="28" height="20" rx="3" />
          <path d="M -14 -8 L 0 2 L 14 -8" />
        </g>
      )}
    </g>
  );
}

const TeacherIdCard = forwardRef<SVGSVGElement, TeacherIdCardData>(
  function TeacherIdCard(
    { name, id, email, title, department, joined, template, photo, qr },
    ref,
  ) {
    const displayName = (name || "Ms. Teacher Name").toUpperCase();
    const displayTitle = (title || "Senior Teacher").toUpperCase();
    const rows = [
      ["STAFF ID", id || "BBS-TCH-0000", 0],
      ["DEPARTMENT", department || "Department", 1],
      ["DATE OF JOINING", joined || "Date of Joining", 2],
      ["EMAIL", email || "teacher@brainbridge.edu", 3],
    ] as const;

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
          <clipPath id="teacherPhotoClip">
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

        {template ? (
          <image
            href={template}
            x={FRONT_IMAGE.x}
            y={FRONT_IMAGE.y}
            width={FRONT_IMAGE.width}
            height={FRONT_IMAGE.height}
            preserveAspectRatio="none"
          />
        ) : (
          <rect width={W} height={H} rx="36" fill="#ffffff" />
        )}

        <text
          x={CENTER_X}
          y="282"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="57"
          fontWeight="700"
          fill={TEXT}
          letterSpacing="1"
        >
          BRAIN BRIDGE
        </text>
        <line x1="260" y1="317" x2="390" y2="317" stroke={GOLD} strokeWidth="3" />
        <line x1="634" y1="317" x2="764" y2="317" stroke={GOLD} strokeWidth="3" />
        <text
          x={CENTER_X}
          y="329"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="34"
          fontWeight="700"
          fill={TEXT}
          letterSpacing="17"
        >
          SCHOOL
        </text>

        <rect
          x={PHOTO.x}
          y={PHOTO.y}
          width={PHOTO.w}
          height={PHOTO.h}
          rx={PHOTO.r}
          ry={PHOTO.r}
          fill="#eef1f5"
          stroke={GOLD}
          strokeWidth="4"
        />
        {photo ? (
          <g clipPath="url(#teacherPhotoClip)">
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
            transform={`translate(${PHOTO.x + PHOTO.w / 2} ${PHOTO.y + PHOTO.h / 2})`}
            fill="#aab1c0"
          >
            <circle cx="0" cy="-54" r="58" />
            <path d="M -112 122 Q -112 18 0 18 Q 112 18 112 122 Z" />
          </g>
        )}

        <text
          x={W / 2}
          y="814"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={displayName.length > 24 ? 39 : 45}
          fontWeight="800"
          fill={TEXT}
          letterSpacing="1.4"
          textLength={fittedLength(displayName, displayName.length > 24 ? 39 : 45, CARD.w - 116)}
          lengthAdjust="spacingAndGlyphs"
        >
          {displayName}
        </text>
        <text
          x={W / 2}
          y="856"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={displayTitle.length > 22 ? 26 : 30}
          fontWeight="700"
          fill={GOLD}
          letterSpacing="3"
          textLength={fittedLength(displayTitle, displayTitle.length > 22 ? 26 : 30, CARD.w - 170)}
          lengthAdjust="spacingAndGlyphs"
        >
          {displayTitle}
        </text>

        <line x1={CARD.x + 52} y1="884" x2="466" y2="884" stroke={GOLD} strokeWidth="3" />
        <circle cx={W / 2} cy="884" r="7" fill={GOLD} />
        <line x1="558" y1="884" x2={CARD.x + CARD.w - 52} y2="884" stroke={GOLD} strokeWidth="3" />

        {rows.map(([label, value, icon], index) => {
          const y = ROW_Y[index];
          return (
            <g key={label}>
              <Icon kind={icon} x={ICON_X} y={y - 13} />
              <text
                x={LABEL_X}
                y={y}
                fontFamily="Montserrat, Arial, Helvetica, sans-serif"
                fontSize="23"
                fontWeight="800"
                fill={TEXT}
              >
                {label}
              </text>
              <text
                x={VALUE_X}
                y={y}
                fontFamily="Montserrat, Arial, Helvetica, sans-serif"
                fontSize={valueSize(value)}
                fill={VALUE}
                textLength={fittedLength(
                  value,
                  valueSize(value),
                  ROW_RIGHT - VALUE_X,
                )}
                lengthAdjust="spacingAndGlyphs"
              >
                {value}
              </text>
              <line x1={LABEL_X} y1={y + 21} x2={ROW_RIGHT} y2={y + 21} stroke={LINE} strokeWidth="2" />
            </g>
          );
        })}

        <rect
          x={QR.x}
          y={QR.y}
          width={QR.size}
          height={QR.size}
          rx="16"
          fill="#ffffff"
          stroke={GOLD}
          strokeWidth="7"
        />
        {qr ? (
          <image
            href={qr}
            x={QR.x + QR.pad}
            y={QR.y + QR.pad}
            width={QR.size - QR.pad * 2}
            height={QR.size - QR.pad * 2}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}

        <text
          x={W / 2}
          y="1412"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="24"
          fontWeight="700"
          fill="#ffffff"
          letterSpacing="2.9"
        >
          <tspan>DISCIPLINE</tspan>
          <tspan fill={GOLD}>{"   \u2022   "}</tspan>
          <tspan>MORALITY</tspan>
          <tspan fill={GOLD}>{"   \u2022   "}</tspan>
          <tspan>LEADERSHIP</tspan>
        </text>
      </svg>
    );
  },
);

export default TeacherIdCard;
