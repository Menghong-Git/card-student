"use client";

import { forwardRef } from "react";
import {
  FRONT_SIZE,
  TEACHER_BACK_CROP,
  TEACHER_TEMPLATE_NATURAL_SIZE,
  cropToFit,
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
  iconX: 232,
  textX: 282,
  rows: [1328, 1395, 1457],
};
const EXPIRES_X = 519;
/** Uniform (undistorted) fit: the card art is narrower than FRONT_SIZE's
 * aspect ratio, so it's centered with a small margin instead of stretched. */
const BACK_IMAGE = cropToFit(TEACHER_BACK_CROP, TEACHER_TEMPLATE_NATURAL_SIZE, FRONT_SIZE);

const ICON_SCALE = 46 / 24;

/** All three icons share the same 24x24 viewBox convention (Heroicons-style)
 * so their rendered size and stroke weight stay consistent with each other. */
function FooterIcon({ kind, y }: { kind: number; y: number }) {
  const originX = FOOTER.iconX - 12 * ICON_SCALE;
  const originY = y - 8 - 12 * ICON_SCALE;
  return (
    <g
      transform={`translate(${originX} ${originY}) scale(${ICON_SCALE})`}
      fill="none"
      stroke={GOLD}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === 0 && (
        <>
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
      {kind === 1 && (
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      )}
      {kind === 2 && (
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )}
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
          x={EXPIRES_X}
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
