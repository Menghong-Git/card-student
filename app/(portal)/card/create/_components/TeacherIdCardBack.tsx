"use client";

import { forwardRef } from "react";
import {
  FRONT_SIZE,
  TEACHER_BACK_CROP,
  TEACHER_TEMPLATE_NATURAL_SIZE,
  cropToFill,
} from "../../../_lib/templates";

export type TeacherIdCardBackData = {
  /** Base64 data URI of the teacher back layout image. */
  template: string;
  expires?: string;
  address?: string;
  phone?: string;
  website?: string;
};

const { w: W, h: H } = FRONT_SIZE;
const NAVY = "#082544";
const GOLD = "#c69a3c";
const FOOTER = {
  iconX: 178,
  textX: 238,
  rows: [1328, 1395, 1457],
};
const BACK_IMAGE = cropToFill(TEACHER_BACK_CROP, TEACHER_TEMPLATE_NATURAL_SIZE, FRONT_SIZE);

function FooterIcon({ kind, y }: { kind: number; y: number }) {
  if (kind === 0) {
    return (
      <g transform={`translate(${FOOTER.iconX} ${y - 8})`} fill={GOLD}>
        <path d="M0-22c-14 0-25 11-25 25 0 20 25 45 25 45S25 23 25 3C25-11 14-22 0-22Zm0 35A10 10 0 1 1 0-7a10 10 0 0 1 0 20Z" />
      </g>
    );
  }
  if (kind === 1) {
    return (
      <g
        transform={`translate(${FOOTER.iconX} ${y - 8})`}
        fill="none"
        stroke={GOLD}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M-18-18c7 28 22 43 50 50" />
        <path d="M-20-18l14-10 14 22-13 9" />
        <path d="M28 34l10-14-22-14-9 13" />
      </g>
    );
  }
  return (
    <g
      transform={`translate(${FOOTER.iconX} ${y - 8})`}
      fill="none"
      stroke={GOLD}
      strokeWidth="5"
      strokeLinecap="round"
    >
      <circle cx="0" cy="0" r="24" />
      <path d="M-24 0h48M0-24c10 12 10 36 0 48M0-24c-10 12-10 36 0 48" />
    </g>
  );
}

const TeacherIdCardBack = forwardRef<SVGSVGElement, TeacherIdCardBackData>(
  function TeacherIdCardBack(
    {
      template,
      expires = "31 March 2026",
      address = "123 Knowledge Park, Education City,",
      phone = "0887574732",
      website = "www.brainbridgeschool.edu.in",
    },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: "block" }}
      >
        {template ? (
          <image
            href={template}
            x={BACK_IMAGE.x}
            y={BACK_IMAGE.y}
            width={BACK_IMAGE.width}
            height={BACK_IMAGE.height}
            preserveAspectRatio="none"
          />
        ) : (
          <rect width={W} height={H} rx="36" fill="#ffffff" />
        )}

        <text
          x="520"
          y="1206"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="26"
          fontWeight="700"
          fill={NAVY}
        >
          {expires}
        </text>

        <FooterIcon kind={0} y={FOOTER.rows[0]} />
        <text
          x={FOOTER.textX}
          y={FOOTER.rows[0] - 16}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="25"
          fill="#ffffff"
        >
          {address}
        </text>
        <text
          x={FOOTER.textX}
          y={FOOTER.rows[0] + 18}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="25"
          fill="#ffffff"
        >
          New Delhi - 110092
        </text>

        <FooterIcon kind={1} y={FOOTER.rows[1]} />
        <text
          x={FOOTER.textX}
          y={FOOTER.rows[1]}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="26"
          fill="#ffffff"
        >
          {phone}
        </text>

        <FooterIcon kind={2} y={FOOTER.rows[2]} />
        <text
          x={FOOTER.textX}
          y={FOOTER.rows[2]}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="26"
          fill="#ffffff"
        >
          {website}
        </text>
      </svg>
    );
  },
);

export default TeacherIdCardBack;
