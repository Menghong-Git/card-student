/**
 * Brain Bridge school shield — golden laurel wreath, navy shield, a brain over
 * a suspension bridge above an open book, and the founding year. Pure SVG so it
 * serializes cleanly for PNG export. Rendered inside a parent <svg>.
 */
export default function Crest({
  navy,
  gold,
  goldLight = "#e2c075",
  year = "2020",
  showLaurel = true,
}: {
  navy: string;
  gold: string;
  goldLight?: string;
  year?: string;
  showLaurel?: boolean;
}) {
  return (
    <g>
      {showLaurel && (
        <>
          {/* Laurel — left */}
          <g fill={gold}>
            <path
              d="M -55 28 Q -98 18 -110 -22 Q -88 -10 -72 4 Q -84 -22 -64 -42 Q -56 -16 -55 28 Z"
              opacity="0.95"
            />
            <ellipse cx="-92" cy="-2" rx="9" ry="4" transform="rotate(-35 -92 -2)" />
            <ellipse cx="-82" cy="18" rx="9" ry="4" transform="rotate(-22 -82 18)" />
            <ellipse cx="-68" cy="34" rx="9" ry="4" transform="rotate(-12 -68 34)" />
          </g>
          {/* Laurel — right */}
          <g fill={gold}>
            <path
              d="M 55 28 Q 98 18 110 -22 Q 88 -10 72 4 Q 84 -22 64 -42 Q 56 -16 55 28 Z"
              opacity="0.95"
            />
            <ellipse cx="92" cy="-2" rx="9" ry="4" transform="rotate(35 92 -2)" />
            <ellipse cx="82" cy="18" rx="9" ry="4" transform="rotate(22 82 18)" />
            <ellipse cx="68" cy="34" rx="9" ry="4" transform="rotate(12 68 34)" />
          </g>
        </>
      )}

      {/* Shield */}
      <path
        d="M -52 -62 L 52 -62 L 52 18 Q 52 62 0 90 Q -52 62 -52 18 Z"
        fill={navy}
        stroke={gold}
        strokeWidth="3"
      />
      <path
        d="M -46 -56 L 46 -56 L 46 16 Q 46 56 0 81 Q -46 56 -46 16 Z"
        fill="none"
        stroke={goldLight}
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Brain */}
      <g transform="translate(0 -30)">
        <path
          d="M -16 0 Q -22 -10 -12 -16 Q -14 -24 -2 -22 Q 0 -28 2 -22 Q 14 -24 12 -16 Q 22 -10 16 0 Q 20 8 10 12 Q 0 16 -10 12 Q -20 8 -16 0 Z"
          fill={goldLight}
          stroke={gold}
          strokeWidth="1"
        />
        <path d="M 0 -22 L 0 14" stroke={navy} strokeWidth="1.2" />
        <path d="M -12 -10 Q -6 -8 -4 -3" stroke={navy} strokeWidth="0.9" fill="none" />
        <path d="M 12 -10 Q 6 -8 4 -3" stroke={navy} strokeWidth="0.9" fill="none" />
        <path d="M -10 4 Q -4 6 -2 10" stroke={navy} strokeWidth="0.9" fill="none" />
        <path d="M 10 4 Q 4 6 2 10" stroke={navy} strokeWidth="0.9" fill="none" />
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
        <line x1="0" y1="-3" x2="0" y2="9" stroke={navy} strokeWidth="1.2" />
        <path d="M -22 -1 Q -12 -3 -4 0" stroke={navy} strokeWidth="0.8" fill="none" />
        <path d="M 4 0 Q 12 -3 22 -1" stroke={navy} strokeWidth="0.8" fill="none" />
      </g>

      {/* Founding year */}
      <text
        x="0"
        y="64"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={goldLight}
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="2"
      >
        {year}
      </text>
    </g>
  );
}
