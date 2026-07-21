type AvatarProps = {
  url: string | null;
  initials: string;
  accentHue?: number;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  className?: string;
};

const SIZE_CLS = {
  xs: "h-7 w-7 text-[0.55rem]",
  sm: "h-12 w-12 text-sm",
  md: "h-20 w-20 text-xl",
  lg: "h-28 w-28 text-3xl",
};

/**
 * Renders a people.json profile photo, or a coloured initials fallback.
 */
export default function Avatar({
  url,
  initials,
  accentHue = 260,
  size = "md",
  locked = false,
  className = "",
}: AvatarProps) {
  const lockCls = locked ? "grayscale opacity-30 blur-[1.5px]" : "";

  if (url) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${SIZE_CLS[size]} rounded-full object-cover ring-2 ring-white/15 ${lockCls} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_CLS[size]} rounded-full flex items-center justify-center font-bold tracking-wide ring-2 ring-white/15 ${lockCls} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${accentHue} 55% 38%), hsl(${(accentHue + 40) % 360} 60% 22%))`,
        color: "rgba(255,255,255,0.92)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
