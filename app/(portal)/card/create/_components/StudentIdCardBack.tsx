"use client";

import { forwardRef } from "react";
import { BACK_SIZE } from "../../../_lib/templates";

export type StudentIdCardBackData = {
  /** Base64 data URI of the blank back template artwork. */
  template: string;
};

const { w: W, h: H } = BACK_SIZE;

/**
 * Brain Bridge School student ID card — BACK.
 * The back carries no per-student data, so it is simply the designed artwork
 * (public/template/back.png) — a 1:1 match of the reference design. Kept as an
 * <svg> wrapper so it shares the front's serialize → canvas → PNG export path.
 */
const StudentIdCardBack = forwardRef<SVGSVGElement, StudentIdCardBackData>(
  function StudentIdCardBack({ template }, ref) {
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
            x="0"
            y="0"
            width={W}
            height={H}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}
      </svg>
    );
  },
);

export default StudentIdCardBack;
