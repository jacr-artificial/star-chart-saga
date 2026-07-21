/**
 * The deck's recurring "wire / circuit" motif (Branding Pack §4): several
 * parallel hairlines that fan out from or converge on a small diamond node.
 * Strands read as a soft off-white (parchment) at reduced opacity; the magenta
 * accent runs through the middle strand only — texture, not typography.
 *
 *   variant="fan"     — strands converge to a node on one side (title flourish)
 *   variant="bracket" — symmetric spread from a centre node (frames a statement)
 */
type Variant = "fan" | "bracket";

const STRAND = "rgba(193, 176, 166, 0.28)"; // parchment hairline
const STRAND_MID = "var(--brand-magenta)";

export default function WireMotif({
  variant = "fan",
  strands = 7,
  className = "",
  flip = false,
}: {
  variant?: Variant;
  strands?: number;
  className?: string;
  /** mirror horizontally (e.g. fan converging to the left instead of right) */
  flip?: boolean;
}) {
  const mid = Math.floor(strands / 2);

  if (variant === "bracket") {
    const w = 420;
    const h = 64;
    const cx = w / 2;
    const cy = h / 2;
    const paths = Array.from({ length: strands }, (_, i) => {
      const t = strands === 1 ? 0 : i / (strands - 1) - 0.5; // -0.5 … 0.5
      const yEdge = cy + t * (h - 8);
      return {
        d: `M0 ${yEdge} C ${cx * 0.5} ${yEdge} ${cx * 0.74} ${cy} ${cx} ${cy} C ${
          w - cx * 0.74
        } ${cy} ${w - cx * 0.5} ${yEdge} ${w} ${yEdge}`,
        isMid: i === mid,
      };
    });
    return (
      <svg
        aria-hidden
        viewBox={`0 0 ${w} ${h}`}
        className={className}
        preserveAspectRatio="none"
        fill="none"
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke={p.isMid ? STRAND_MID : STRAND}
            strokeWidth={p.isMid ? 1.1 : 0.7}
            opacity={p.isMid ? 0.9 : 0.55}
          />
        ))}
        <rect
          x={cx - 3.5}
          y={cy - 3.5}
          width={7}
          height={7}
          transform={`rotate(45 ${cx} ${cy})`}
          fill={STRAND_MID}
          opacity={0.9}
        />
      </svg>
    );
  }

  // fan: node at right edge, strands spread out toward the left
  const w = 220;
  const h = 150;
  const nodeX = w - 12;
  const nodeY = h / 2;
  const paths = Array.from({ length: strands }, (_, i) => {
    const t = strands === 1 ? 0 : i / (strands - 1) - 0.5;
    const yStart = nodeY + t * (h - 14);
    return {
      d: `M0 ${yStart} C ${w * 0.46} ${yStart} ${w * 0.72} ${nodeY} ${nodeX} ${nodeY}`,
      isMid: i === mid,
    };
  });
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      fill="none"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.isMid ? STRAND_MID : STRAND}
          strokeWidth={p.isMid ? 1.1 : 0.7}
          opacity={p.isMid ? 0.9 : 0.5}
        />
      ))}
      <rect
        x={nodeX - 4}
        y={nodeY - 4}
        width={8}
        height={8}
        transform={`rotate(45 ${nodeX} ${nodeY})`}
        fill={STRAND_MID}
        opacity={0.95}
      />
    </svg>
  );
}
