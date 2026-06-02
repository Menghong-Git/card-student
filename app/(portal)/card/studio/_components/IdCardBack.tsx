"use client";

import { forwardRef, useEffect, useId, useState } from "react";
import { code128DataUrl } from "../_lib/codes";
import { CARD_H, CARD_W, type CardData } from "../_lib/types";
import Crest from "./Crest";

const REGULATIONS = [
  "This card is the property of the school and remains under its authority at all times.",
  "Serves as dual identification for campus entry and library/lab authorization.",
  "If lost or stolen, notify the administration office immediately for deactivation.",
  "Non-transferable. Misuse may result in confiscation and disciplinary review.",
];

const IdCardBack = forwardRef<SVGSVGElement, CardData>(function IdCardBack(
  data,
  ref,
) {
  const uid = useId().replace(/[:]/g, "");
  const cardClip = `backClip-${uid}`;
  const navy = data.primaryColor || "#0a2540";
  const gold = data.accentColor || "#c5a059";

  const [barcode, setBarcode] = useState("");
  useEffect(() => {
    setBarcode(code128DataUrl(data.studentId || data.qrPayload));
  }, [data.studentId, data.qrPayload]);

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
      </defs>

      <g clipPath={`url(#${cardClip})`}>
        <rect x="0" y="0" width={CARD_W} height={CARD_H} fill="#ffffff" />

        {/* ===== HEADER ===== */}
        <rect x="0" y="0" width={CARD_W} height="118" fill={navy} />
        <line x1="0" y1="118" x2="540" y2="118" stroke={gold} strokeWidth="3" />
        <g transform="translate(74 60) scale(0.62)">
          <Crest navy={navy} gold={gold} showLaurel={false} year="" />
        </g>
        <text
          x="150"
          y="50"
          fontSize="22"
          fontWeight="700"
          fill="#ffffff"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1"
        >
          {schoolName}
        </text>
        <text
          x="150"
          y="76"
          fontSize="13"
          fontWeight="600"
          fill={gold}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="4"
        >
          CAMPUS ACCESS CARD
        </text>

        {/* ===== REGULATIONS ===== */}
        <text
          x="50"
          y="162"
          fontSize="13"
          fontWeight="700"
          fill={navy}
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2"
        >
          CARD REGULATIONS
        </text>
        <line x1="50" y1="172" x2="490" y2="172" stroke="#e3e7ef" strokeWidth="1.5" />
        {REGULATIONS.map((text, i) => {
          const y = 200 + i * 62;
          // Wrap each regulation onto two lines at ~52 chars.
          const words = text.split(" ");
          const lines: string[] = ["", ""];
          let li = 0;
          for (const w of words) {
            if ((lines[li] + " " + w).trim().length > 50 && li === 0) li = 1;
            lines[li] = (lines[li] + " " + w).trim();
          }
          return (
            <g key={i}>
              <circle cx="58" cy={y - 4} r="11" fill={navy} />
              <text
                x="58"
                y={y - 0.5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={gold}
                fontFamily="Georgia, serif"
              >
                {i + 1}
              </text>
              {lines.filter(Boolean).map((ln, k) => (
                <text
                  key={k}
                  x="80"
                  y={y - 6 + k * 16}
                  fontSize="12.5"
                  fill="#2b3550"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  {ln}
                </text>
              ))}
            </g>
          );
        })}

        {/* ===== SUPPORT BOX ===== */}
        <rect x="44" y="452" width="452" height="116" rx="12" fill="#f1f5f9" stroke="#dbe2ec" strokeWidth="1" />
        <text x="64" y="480" fontSize="12" fontWeight="700" fill={navy} fontFamily="Arial, sans-serif" letterSpacing="1.5">
          CAMPUS SUPPORT
        </text>
        <g fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fill="#2b3550">
          <text x="64" y="506">
            <tspan fontWeight="700" fill={navy}>Hotline: </tspan>
            <tspan fontFamily="'JetBrains Mono', monospace">+1 (800) 555-0142</tspan>
          </text>
          <text x="64" y="528">
            <tspan fontWeight="700" fill={navy}>Email: </tspan>
            registrar@brainbridge.edu
          </text>
          <text x="64" y="550">
            <tspan fontWeight="700" fill={navy}>Office: </tspan>
            Admin Bldg A, Room 104 · Mon–Fri 8:00–16:00
          </text>
        </g>

        {/* ===== SIGNATURE BLOCK ===== */}
        <g transform="translate(64 620)">
          {/* Cursive principal signature */}
          <path
            d="M 0 26 C 14 -6 22 -6 18 18 C 16 30 26 30 34 12 C 40 0 46 0 44 18 C 43 28 52 26 64 10 C 74 -2 86 6 78 20 C 92 12 108 8 120 16"
            fill="none"
            stroke={navy}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="-4" y1="44" x2="180" y2="44" stroke="#9aa6bd" strokeWidth="1" />
          <text x="-4" y="60" fontSize="11" fontWeight="700" fill={navy} fontFamily="Arial, sans-serif" letterSpacing="0.5">
            PRINCIPAL
          </text>
          <text x="-4" y="74" fontSize="10" fill="#64748b" fontFamily="Arial, sans-serif">
            Authorized Signatory
          </text>
        </g>

        {/* Official seal */}
        <g transform="translate(420 648)">
          <circle r="44" fill="none" stroke={gold} strokeWidth="2" />
          <circle r="36" fill="none" stroke={gold} strokeWidth="1" opacity="0.7" />
          <g transform="scale(0.4)">
            <Crest navy={navy} gold={gold} showLaurel={false} year="" />
          </g>
          <text y="-26" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={gold} fontFamily="Georgia, serif" letterSpacing="1.5">
            OFFICIAL · SEAL
          </text>
          <text y="34" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={gold} fontFamily="Georgia, serif" letterSpacing="1.5">
            EST · 2020
          </text>
        </g>

        {/* ===== BARCODE ===== */}
        <rect x="0" y="744" width={CARD_W} height="114" fill="#f8fafc" />
        <line x1="0" y1="744" x2="540" y2="744" stroke="#e3e7ef" strokeWidth="1" />
        {barcode ? (
          <image href={barcode} x="90" y="762" width="360" height="62" preserveAspectRatio="none" />
        ) : (
          <rect x="90" y="762" width="360" height="62" fill="#eef1f6" />
        )}
        <text
          x="270"
          y="842"
          textAnchor="middle"
          fontSize="14"
          fill={navy}
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          letterSpacing="3"
        >
          {data.studentId || "—"}
        </text>
      </g>
    </svg>
  );
});

export default IdCardBack;
