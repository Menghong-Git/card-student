"use client";

import { forwardRef, useId } from "react";
import { qrMatrix } from "../_lib/codes";
import { CARD_H, CARD_W, formatDate, type CardData } from "../_lib/types";
import Crest from "./Crest";

const GOLD_LIGHT = "#e2c075";
const RED = "#c8102e"; // bold, readable field labels
const VALUE = "#1f2a4a";

/** A single labelled field row with a vector icon. */
function FieldIcon({ index, navy }: { index: number; navy: string }) {
  if (index === 0)
    return (
      <g fill={navy}>
        <circle cx="0" cy="-3" r="6" />
        <path d="M -11 14 Q -11 4 0 4 Q 11 4 11 14 Z" />
      </g>
    );
  if (index === 1)
    return (
      <g fill="none" stroke={navy} strokeWidth="1.6" strokeLinecap="round">
        <rect x="-12" y="-8" width="24" height="18" rx="2.5" />
        <circle cx="-5" cy="-1" r="3" fill={navy} stroke="none" />
        <line x1="3" y1="-3" x2="9" y2="-3" />
        <line x1="3" y1="1" x2="9" y2="1" />
        <line x1="-9" y1="6" x2="9" y2="6" />
      </g>
    );
  if (index === 2)
    return (
      <g fill={navy}>
        <path d="M -13 0 L 0 -7 L 13 0 L 0 7 Z" />
        <path
          d="M -7 4 L -7 10 Q 0 14 7 10 L 7 4"
          fill="none"
          stroke={navy}
          strokeWidth="1.6"
        />
        <line x1="11.5" y1="-1" x2="11.5" y2="9" stroke={navy} strokeWidth="1.4" />
        <circle cx="11.5" cy="10" r="1.6" />
      </g>
    );
  if (index === 3)
    return (
      <g fill="none" stroke={navy} strokeWidth="1.6" strokeLinecap="round">
        <rect x="-12" y="-7" width="24" height="20" rx="2.5" />
        <line x1="-12" y1="-2" x2="12" y2="-2" />
        <line x1="-6" y1="-10" x2="-6" y2="-4" />
        <line x1="6" y1="-10" x2="6" y2="-4" />
        <circle cx="-4" cy="4" r="1.2" fill={navy} stroke="none" />
        <circle cx="0" cy="4" r="1.2" fill={navy} stroke="none" />
        <circle cx="4" cy="4" r="1.2" fill={navy} stroke="none" />
      </g>
    );
  // Expiration — clock
  return (
    <g fill="none" stroke={navy} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="0" cy="1" r="10" />
      <path d="M 0 -4 L 0 1 L 4 4" strokeLinejoin="round" />
    </g>
  );
}

const IdCardFront = forwardRef<SVGSVGElement, CardData>(function IdCardFront(
  data,
  ref,
) {
  const uid = useId().replace(/[:]/g, "");
  const cardClip = `cardClip-${uid}`;
  const photoClip = `photoClip-${uid}`;
  const bottomGrad = `bottomGrad-${uid}`;

  const navy = data.primaryColor || "#0a2540";
  const gold = data.accentColor || "#c5a059";

  const rows = [
    { label: "NAME", value: data.name || "—" },
    { label: "ID NUMBER", value: data.studentId || "—" },
    { label: "GRADE", value: data.grade || "—" },
    { label: "DATE OF BIRTH", value: formatDate(data.dob) },
    { label: "EXPIRATION", value: formatDate(data.expiration) },
  ];

  // Photo framing: box centred at (270, 418), 180×180.
  const pcx = 270;
  const pcy = 418;
  const photoTransform = `translate(${pcx + data.photoX} ${pcy + data.photoY}) scale(${data.photoScale}) translate(${-pcx} ${-pcy})`;

  // Real QR fitted into the 64×64 inner area of the gold frame.
  const modules = qrMatrix(data.qrPayload || data.studentId);
  const qrSize = modules.length;
  const qrArea = 62;
  const m = qrArea / qrSize;

  const schoolName = (data.schoolName || "Brain Bridge").toUpperCase();

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={cardClip}>
          <rect x="0" y="0" width={CARD_W} height={CARD_H} rx="28" ry="28" />
        </clipPath>
        <clipPath id={photoClip}>
          <rect x="180" y="328" width="180" height="180" rx="16" ry="16" />
        </clipPath>
        <linearGradient id={bottomGrad} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={navy} />
          <stop offset="100%" stopColor="#061a30" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${cardClip})`}>
        {/* Card background */}
        <rect x="0" y="0" width={CARD_W} height={CARD_H} fill="#ffffff" />

        {/* ===== CREST ===== */}
        <g transform="translate(270 128)">
          <Crest navy={navy} gold={gold} goldLight={GOLD_LIGHT} />
        </g>

        {/* ===== SCHOOL NAME ===== */}
        <text
          x="270"
          y="256"
          textAnchor="middle"
          fontSize={schoolName.length > 14 ? 26 : 34}
          fontWeight="700"
          fill={navy}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2"
        >
          {schoolName}
        </text>
        <line x1="150" y1="284" x2="214" y2="284" stroke={gold} strokeWidth="1.6" />
        <line x1="326" y1="284" x2="390" y2="284" stroke={gold} strokeWidth="1.6" />
        <text
          x="270"
          y="290"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={navy}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="7"
        >
          STUDENT IDENTITY
        </text>

        {/* ===== CHEVRON ACCENTS ===== */}
        <path d="M 0 320 L 0 516 L 150 418 Z" fill={navy} />
        <path d="M 34 348 L 34 488 L 150 418 Z" fill={gold} />
        <path d="M 540 320 L 540 516 L 390 418 Z" fill={navy} />
        <path d="M 506 348 L 506 488 L 390 418 Z" fill={gold} />

        {/* ===== PHOTO ===== */}
        <rect
          x="180"
          y="328"
          width="180"
          height="180"
          rx="16"
          ry="16"
          fill="#e9ecf2"
          stroke={gold}
          strokeWidth="3.5"
        />
        {data.photo ? (
          <g clipPath={`url(#${photoClip})`}>
            <g transform={photoTransform}>
              <image
                href={data.photo}
                x="180"
                y="328"
                width="180"
                height="180"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          </g>
        ) : (
          <g transform="translate(270 418)" fill="#aab1c0">
            <circle cx="0" cy="-22" r="28" />
            <path d="M -54 56 Q -54 6 0 6 Q 54 6 54 56 Z" />
          </g>
        )}

        {/* ===== INFO ROWS ===== */}
        {rows.map((row, i) => {
          const y = 548 + i * 34;
          return (
            <g key={row.label}>
              <g transform={`translate(70 ${y - 11})`}>
                <FieldIcon index={i} navy={navy} />
              </g>
              <line x1="100" y1={y - 13} x2="100" y2={y + 13} stroke={gold} strokeWidth="2" />
              <text
                x="118"
                y={y + 2}
                fontSize="12.5"
                fontWeight="700"
                fill={RED}
                fontFamily="Georgia, 'Times New Roman', serif"
                letterSpacing="0.5"
              >
                {row.label}
              </text>
              <text
                x="300"
                y={y + 2}
                fontSize="13.5"
                fontWeight="600"
                fill={VALUE}
                fontFamily="Georgia, 'Times New Roman', serif"
              >
                {row.value}
              </text>
              <line x1="60" y1={y + 17} x2="480" y2={y + 17} stroke="#e3e7ef" strokeWidth="1" />
            </g>
          );
        })}

        {/* ===== TORCH CREST DIVIDER ===== */}
        <line x1="150" y1="730" x2="250" y2="730" stroke={gold} strokeWidth="1.5" />
        <line x1="290" y1="730" x2="390" y2="730" stroke={gold} strokeWidth="1.5" />
        <g transform="translate(270 730)">
          <path d="M -15 -8 L 15 -8 L 15 5 Q 15 15 0 21 Q -15 15 -15 5 Z" fill="none" stroke={gold} strokeWidth="2" />
          <path d="M 0 -13 Q -4 -7 0 -4 Q 4 -7 0 -13 Z" fill={gold} />
          <rect x="-1.5" y="-4" width="3" height="10" fill={gold} />
          <path d="M -4 6 L 4 6 L 3 10 L -3 10 Z" fill={gold} />
        </g>

        {/* ===== MOTTO ===== */}
        <text
          x="270"
          y="762"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={navy}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2.5"
        >
          {(data.motto || "DISCIPLINE • MORALITY • LEADERSHIP").toUpperCase()}
        </text>

        {/* ===== FOOTER WAVE + BRIDGE WATERMARK ===== */}
        <path d="M 0 788 Q 270 740 540 788 L 540 858 L 0 858 Z" fill={`url(#${bottomGrad})`} />
        <path d="M 0 791 Q 270 743 540 791" stroke={gold} strokeWidth="1.5" fill="none" />
        <g stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.14">
          {[90, 450].map((cx) => (
            <g key={cx} transform={`translate(${cx} 836)`}>
              <line x1="-46" y1="12" x2="46" y2="12" />
              <line x1="-26" y1="12" x2="-26" y2="-10" />
              <line x1="26" y1="12" x2="26" y2="-10" />
              <path d="M -46 12 Q -26 -14 0 2 Q 26 -14 46 12" />
              <line x1="-18" y1="12" x2="-18" y2="-2" />
              <line x1="-9" y1="12" x2="-9" y2="5" />
              <line x1="9" y1="12" x2="9" y2="5" />
              <line x1="18" y1="12" x2="18" y2="-2" />
            </g>
          ))}
        </g>

        {/* ===== QR CODE ===== */}
        <g transform="translate(270 820)">
          <rect x="-40" y="-40" width="80" height="80" rx="6" fill="white" stroke={gold} strokeWidth="3" />
          <g transform={`translate(${-qrArea / 2} ${-qrArea / 2})`} fill={navy} shapeRendering="crispEdges">
            {modules.map((rowArr, r) =>
              rowArr.map((on, c) =>
                on ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * m}
                    y={r * m}
                    width={m + 0.3}
                    height={m + 0.3}
                  />
                ) : null,
              ),
            )}
          </g>
        </g>
      </g>
    </svg>
  );
});

export default IdCardFront;
