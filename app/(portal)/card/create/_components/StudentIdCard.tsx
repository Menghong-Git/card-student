"use client";

import { forwardRef } from "react";

export type StudentIdCardData = {
  name: string;
  id: string;
  grade: string;
  dob: string;
  photo: string;
};

const NAVY = "#0d2050";
const NAVY_DARK = "#0a1840";
const GOLD = "#c9a24a";
const GOLD_LIGHT = "#e2c075";
const PAGE_BG = "#ffffff";

/**
 * Brain Bridge School student ID card.
 * Pure SVG (no foreignObject / HTML) so it can be serialized → canvas → PNG.
 */
const StudentIdCard = forwardRef<SVGSVGElement, StudentIdCardData>(
  function StudentIdCard({ name, id, grade, dob, photo }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 540 858"
        width="100%"
        height="auto"
        style={{
          display: "block",
          filter: "drop-shadow(0 18px 38px rgba(13,32,80,0.22))",
          borderRadius: 28,
        }}
      >
        <defs>
          <clipPath id="bbCardClip">
            <rect x="0" y="0" width="540" height="858" rx="28" ry="28" />
          </clipPath>
          <clipPath id="bbPhotoClip">
            <rect x="180" y="328" width="180" height="180" rx="16" ry="16" />
          </clipPath>
          <linearGradient id="bbBottomGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={NAVY} />
            <stop offset="100%" stopColor={NAVY_DARK} />
          </linearGradient>
        </defs>

        {/* Card background */}
        <rect
          x="0"
          y="0"
          width="540"
          height="858"
          rx="28"
          ry="28"
          fill={PAGE_BG}
        />

        {/* ===== CREST ===== */}
        <g transform="translate(270 130)">
          {/* Laurel — left */}
          <g fill={GOLD}>
            <path
              d="M -55 28 Q -98 18 -110 -22 Q -88 -10 -72 4 Q -84 -22 -64 -42 Q -56 -16 -55 28 Z"
              opacity="0.95"
            />
            <ellipse
              cx="-92"
              cy="-2"
              rx="9"
              ry="4"
              transform="rotate(-35 -92 -2)"
            />
            <ellipse
              cx="-82"
              cy="18"
              rx="9"
              ry="4"
              transform="rotate(-22 -82 18)"
            />
            <ellipse
              cx="-68"
              cy="34"
              rx="9"
              ry="4"
              transform="rotate(-12 -68 34)"
            />
          </g>
          {/* Laurel — right (mirrored) */}
          <g fill={GOLD}>
            <path
              d="M 55 28 Q 98 18 110 -22 Q 88 -10 72 4 Q 84 -22 64 -42 Q 56 -16 55 28 Z"
              opacity="0.95"
            />
            <ellipse
              cx="92"
              cy="-2"
              rx="9"
              ry="4"
              transform="rotate(35 92 -2)"
            />
            <ellipse
              cx="82"
              cy="18"
              rx="9"
              ry="4"
              transform="rotate(22 82 18)"
            />
            <ellipse
              cx="68"
              cy="34"
              rx="9"
              ry="4"
              transform="rotate(12 68 34)"
            />
          </g>

          {/* Shield */}
          <path
            d="M -52 -62 L 52 -62 L 52 18 Q 52 62 0 90 Q -52 62 -52 18 Z"
            fill={NAVY}
            stroke={GOLD}
            strokeWidth="3"
          />
          <path
            d="M -46 -56 L 46 -56 L 46 16 Q 46 56 0 81 Q -46 56 -46 16 Z"
            fill="none"
            stroke={GOLD_LIGHT}
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Brain */}
          <g transform="translate(0 -30)">
            <path
              d="M -16 0 Q -22 -10 -12 -16 Q -14 -24 -2 -22 Q 0 -28 2 -22 Q 14 -24 12 -16 Q 22 -10 16 0 Q 20 8 10 12 Q 0 16 -10 12 Q -20 8 -16 0 Z"
              fill={GOLD_LIGHT}
              stroke={GOLD}
              strokeWidth="1"
            />
            <path d="M 0 -22 L 0 14" stroke={NAVY} strokeWidth="1.2" />
            <path
              d="M -12 -10 Q -6 -8 -4 -3"
              stroke={NAVY}
              strokeWidth="0.9"
              fill="none"
            />
            <path
              d="M 12 -10 Q 6 -8 4 -3"
              stroke={NAVY}
              strokeWidth="0.9"
              fill="none"
            />
            <path
              d="M -10 4 Q -4 6 -2 10"
              stroke={NAVY}
              strokeWidth="0.9"
              fill="none"
            />
            <path
              d="M 10 4 Q 4 6 2 10"
              stroke={NAVY}
              strokeWidth="0.9"
              fill="none"
            />
          </g>

          {/* Bridge */}
          <g stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <line x1="-32" y1="14" x2="32" y2="14" />
            <path d="M -30 14 Q -16 2 -2 14" />
            <path d="M -2 14 Q 12 2 30 14" />
            <line x1="-22" y1="14" x2="-22" y2="6" />
            <line x1="0" y1="14" x2="0" y2="4" />
            <line x1="22" y1="14" x2="22" y2="6" />
            <line x1="-15" y1="14" x2="-15" y2="11" />
            <line x1="-8" y1="14" x2="-8" y2="11" />
            <line x1="8" y1="14" x2="8" y2="11" />
            <line x1="15" y1="14" x2="15" y2="11" />
          </g>

          {/* Open book */}
          <g transform="translate(0 32)">
            <path
              d="M -28 -2 Q -14 -7 0 -2 Q 14 -7 28 -2 L 28 9 Q 14 4 0 9 Q -14 4 -28 9 Z"
              fill="white"
            />
            <line x1="0" y1="-3" x2="0" y2="9" stroke={NAVY} strokeWidth="1.2" />
            <path
              d="M -22 -1 Q -12 -3 -4 0"
              stroke={NAVY}
              strokeWidth="0.8"
              fill="none"
            />
            <path
              d="M 4 0 Q 12 -3 22 -1"
              stroke={NAVY}
              strokeWidth="0.8"
              fill="none"
            />
          </g>

          {/* Founding year */}
          <text
            x="0"
            y="64"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={GOLD_LIGHT}
            fontFamily="Georgia, 'Times New Roman', serif"
            letterSpacing="2"
          >
            2020
          </text>
        </g>

        {/* ===== SCHOOL NAME ===== */}
        <text
          x="270"
          y="260"
          textAnchor="middle"
          fontSize="36"
          fontWeight="700"
          fill={NAVY}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2"
        >
          BRAIN BRIDGE
        </text>
        <line x1="172" y1="288" x2="218" y2="288" stroke={GOLD} strokeWidth="1.6" />
        <line x1="322" y1="288" x2="368" y2="288" stroke={GOLD} strokeWidth="1.6" />
        <text
          x="270"
          y="295"
          textAnchor="middle"
          fontSize="18"
          fontWeight="600"
          fill={NAVY}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="8"
        >
          SCHOOL
        </text>

        {/* ===== DIAGONAL ACCENTS ===== */}
        {/* Left — outer navy chevron */}
        <path d="M 0 318 L 0 522 L 150 420 Z" fill={NAVY} />
        {/* Left — inner gold chevron */}
        <path d="M 35 345 L 35 495 L 150 420 Z" fill={GOLD} />
        {/* Right — outer navy chevron */}
        <path d="M 540 318 L 540 522 L 390 420 Z" fill={NAVY} />
        {/* Right — inner gold chevron */}
        <path d="M 505 345 L 505 495 L 390 420 Z" fill={GOLD} />

        {/* ===== PHOTO ===== */}
        <rect
          x="180"
          y="328"
          width="180"
          height="180"
          rx="16"
          ry="16"
          fill="#e9ecf2"
          stroke={GOLD}
          strokeWidth="2.5"
        />
        {photo ? (
          <g clipPath="url(#bbPhotoClip)">
            <image
              href={photo}
              x="180"
              y="328"
              width="180"
              height="180"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        ) : (
          <g transform="translate(270 418)" fill="#aab1c0">
            <circle cx="0" cy="-22" r="28" />
            <path d="M -54 56 Q -54 6 0 6 Q 54 6 54 56 Z" />
          </g>
        )}

        {/* ===== INFO ROWS ===== */}
        {[
          { label: "NAME", value: name },
          { label: "ID NUMBER", value: id },
          { label: "GRADE", value: grade },
          { label: "DATE OF BIRTH", value: dob },
        ].map((row, i) => {
          const y = 562 + i * 42;
          return (
            <g key={row.label}>
              {/* Icon */}
              <g transform={`translate(70 ${y - 11})`}>
                {i === 0 && (
                  <g fill={NAVY}>
                    <circle cx="0" cy="-3" r="6" />
                    <path d="M -11 14 Q -11 4 0 4 Q 11 4 11 14 Z" />
                  </g>
                )}
                {i === 1 && (
                  <g
                    fill="none"
                    stroke={NAVY}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <rect x="-12" y="-8" width="24" height="18" rx="2.5" />
                    <circle cx="-5" cy="-1" r="3" fill={NAVY} stroke="none" />
                    <line x1="3" y1="-3" x2="9" y2="-3" />
                    <line x1="3" y1="1" x2="9" y2="1" />
                    <line x1="-9" y1="6" x2="9" y2="6" />
                  </g>
                )}
                {i === 2 && (
                  <g fill={NAVY}>
                    <path d="M -13 0 L 0 -7 L 13 0 L 0 7 Z" />
                    <path
                      d="M -7 4 L -7 10 Q 0 14 7 10 L 7 4"
                      fill="none"
                      stroke={NAVY}
                      strokeWidth="1.6"
                    />
                    <line
                      x1="11.5"
                      y1="-1"
                      x2="11.5"
                      y2="9"
                      stroke={NAVY}
                      strokeWidth="1.4"
                    />
                    <circle cx="11.5" cy="10" r="1.6" />
                  </g>
                )}
                {i === 3 && (
                  <g
                    fill="none"
                    stroke={NAVY}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <rect x="-12" y="-7" width="24" height="20" rx="2.5" />
                    <line x1="-12" y1="-2" x2="12" y2="-2" />
                    <line x1="-6" y1="-10" x2="-6" y2="-4" />
                    <line x1="6" y1="-10" x2="6" y2="-4" />
                    <circle cx="-4" cy="4" r="1.2" fill={NAVY} stroke="none" />
                    <circle cx="0" cy="4" r="1.2" fill={NAVY} stroke="none" />
                    <circle cx="4" cy="4" r="1.2" fill={NAVY} stroke="none" />
                  </g>
                )}
              </g>
              {/* Vertical divider */}
              <line
                x1="100"
                y1={y - 14}
                x2="100"
                y2={y + 14}
                stroke={GOLD}
                strokeWidth="2"
              />
              {/* Label */}
              <text
                x="118"
                y={y + 2}
                fontSize="14"
                fontWeight="700"
                fill={NAVY}
                fontFamily="Georgia, 'Times New Roman', serif"
                letterSpacing="0.6"
              >
                {row.label}
              </text>
              {/* Value */}
              <text
                x="290"
                y={y + 2}
                fontSize="14"
                fill="#1f2a4a"
                fontFamily="Georgia, 'Times New Roman', serif"
              >
                {row.value}
              </text>
              {/* Bottom border */}
              <line
                x1="60"
                y1={y + 20}
                x2="480"
                y2={y + 20}
                stroke="#dde1ea"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* ===== SHIELD WITH TORCH ===== */}
        <g transform="translate(270 735)">
          <path
            d="M -16 -8 L 16 -8 L 16 6 Q 16 16 0 22 Q -16 16 -16 6 Z"
            fill="none"
            stroke={GOLD}
            strokeWidth="2"
          />
          {/* Torch flame */}
          <path
            d="M 0 -14 Q -4 -8 0 -5 Q 4 -8 0 -14 Z"
            fill={GOLD}
          />
          {/* Torch handle */}
          <rect x="-1.5" y="-5" width="3" height="11" fill={GOLD} />
          <path d="M -4 6 L 4 6 L 3 10 L -3 10 Z" fill={GOLD} />
        </g>

        {/* ===== MOTTO ===== */}
        <text
          x="270"
          y="775"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={NAVY}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="3.5"
        >
          DISCIPLINE  •  MORALITY  •  LEADERSHIP
        </text>

        {/* ===== BOTTOM NAVY BAND WITH BRIDGE ===== */}
        <g clipPath="url(#bbCardClip)">
          {/* Curve-topped navy band */}
          <path
            d="M 0 805 Q 270 750 540 805 L 540 858 L 0 858 Z"
            fill="url(#bbBottomGradient)"
          />
          {/* Gold accent line on the curve */}
          <path
            d="M 0 808 Q 270 753 540 808"
            stroke={GOLD}
            strokeWidth="1.5"
            fill="none"
          />

          {/* Bridge silhouettes — three suspension spans */}
          <g stroke="#1d2f63" strokeWidth="1.4" fill="none" opacity="0.95">
            {[60, 270, 480].map((cx) => (
              <g key={cx} transform={`translate(${cx} 836)`}>
                {/* Deck */}
                <line x1="-55" y1="14" x2="55" y2="14" stroke="#1d2f63" />
                {/* Towers */}
                <line x1="-30" y1="14" x2="-30" y2="-12" />
                <line x1="30" y1="14" x2="30" y2="-12" />
                {/* Main cables */}
                <path d="M -55 14 Q -30 -16 0 4 Q 30 -16 55 14" />
                {/* Suspender cables */}
                <line x1="-22" y1="14" x2="-22" y2="-2" />
                <line x1="-14" y1="14" x2="-14" y2="2" />
                <line x1="-6" y1="14" x2="-6" y2="6" />
                <line x1="6" y1="14" x2="6" y2="6" />
                <line x1="14" y1="14" x2="14" y2="2" />
                <line x1="22" y1="14" x2="22" y2="-2" />
              </g>
            ))}
          </g>
        </g>

        {/* ===== QR CODE ===== */}
        <g transform="translate(270 818)">
          {/* Gold frame */}
          <rect
            x="-40"
            y="-40"
            width="80"
            height="80"
            rx="6"
            fill="white"
            stroke={GOLD}
            strokeWidth="3"
          />
          {/* QR module pattern (placeholder, deterministic from id) */}
          <g transform="translate(-32 -32)" fill={NAVY}>
            {/* Position markers (3 corners) */}
            {[
              [0, 0],
              [50, 0],
              [0, 50],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                <rect width="14" height="14" rx="1" />
                <rect x="2" y="2" width="10" height="10" fill="white" />
                <rect x="4" y="4" width="6" height="6" />
              </g>
            ))}
            {/* Data modules — pseudo-pattern */}
            {Array.from({ length: 12 }).map((_, row) =>
              Array.from({ length: 12 }).map((__, col) => {
                // Skip the 3 finder regions
                const inTL = row < 7 && col < 7;
                const inTR = row < 7 && col > 4;
                const inBL = row > 4 && col < 7;
                if (inTL || inTR || inBL) return null;
                const seed =
                  (row * 31 + col * 17 + (id?.length ?? 7) * 13) % 7;
                if (seed < 3) return null;
                return (
                  <rect
                    key={`d-${row}-${col}`}
                    x={18 + col * 4}
                    y={18 + row * 4}
                    width="3.4"
                    height="3.4"
                  />
                );
              }),
            )}
            {/* Alignment block */}
            <rect x="44" y="44" width="14" height="14" rx="1" />
            <rect x="46" y="46" width="10" height="10" fill="white" />
            <rect x="48" y="48" width="6" height="6" />
          </g>
        </g>
      </svg>
    );
  },
);

export default StudentIdCard;
