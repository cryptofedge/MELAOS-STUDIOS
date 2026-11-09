// The official MELAOS logo artwork, cropped to its visible area so it can be
// sized by what you actually see. Same files, no redrawn or recolored copy:
//   mark      — the "M" emblem, from melaos-logo-3.png
//   wordmark  — the horizontal M + MELAOS STUDIOS, from melaos-logo-2.png
// Both source images are 2400×1339 with the art floating in empty space.
const CROPS = {
  mark: { src: '/melaos-logo-3.png', sx: 760, sy: 205, sw: 845, sh: 535 },
  wordmark: { src: '/melaos-logo-2.png', sx: 250, sy: 455, sw: 1870, sh: 440 },
} as const;

export default function Emblem({
  variant = 'mark',
  className = '',
  style,
  alt,
}: {
  variant?: keyof typeof CROPS;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const c = CROPS[variant];
  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{ aspectRatio: `${c.sw} / ${c.sh}`, ...style }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={c.src}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          maxWidth: 'none',
          width: `${(2400 / c.sw) * 100}%`,
          left: `${(-c.sx / c.sw) * 100}%`,
          top: `${(-c.sy / c.sh) * 100}%`,
        }}
      />
    </div>
  );
}
