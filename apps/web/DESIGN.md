# MELAOS design system

Built for 13–27 year-olds. MELAOS should feel like a music **app** (think the
apps they already live in: Spotify, TikTok, Instagram, SoundCloud), not a
corporate website. Dark neutral surfaces, rounded cards, pill buttons, big
friendly bold type, cover art carrying most of the color, and the logo's
gradient (orange → pink → magenta) on the main action and as a soft glow.

The approved mockup is `scratchpad/concepts/genz.html` (desktop + phone). The
reference implementation is `src/app/page.tsx` (home) and the app frame in
`src/components/Navbar.tsx`.

## App frame (already handled by the layout — pages don't redo it)
- **Phones/tablets (< lg):** top bar with the logo, bottom tab bar
  (Inicio · Explorar · **Crear** · Biblioteca · Melao). Mini player floats above
  the tab bar.
- **Computers (lg+):** side menu (icon rail at lg, full at xl), the page sits on
  a rounded `bg-ink-1` panel, full-width player along the bottom.
- Pages just render their content. Use `mx-auto max-w-[1280px] px-safe md:px-8`
  (narrower for reading pages). Bottom/top padding for bars is already applied.

## Color (same brand colors)
| Token | Use |
|---|---|
| `bg-ink-0` #08080A | app background (behind the panel) |
| `bg-ink-1` #111114 | the main panel (pages sit on this) |
| `bg-ink-2` #18181C | cards |
| `bg-ink-3` / `ink-4` | hover, selected, chips |
| `border-line` / `line-soft` / `line-strong` | translucent white borders |
| `text-white`, `text-fog` #A1A1AD, `text-fog-dim` | text levels |
| brand gradient (`bg-brand`, `.btn-primary`, `.text-brand`) | main action, ONE highlighted phrase per headline, active states, progress |
| `melaos-orange/pink/magenta` | tags and small accents |
| `melaos-cyan` | live dots, verified checks |
| `melaos-hot` | errors, recording |

## Type: Sora only
- Headlines: `display` class (Sora 700, tight tracking). Big and friendly:
  page titles `text-3xl sm:text-4xl lg:text-5xl`. Sentence case, not uppercase.
  One phrase may use `text-brand` (gradient). Never `font-light` on headlines.
- Section titles: `display text-xl sm:text-2xl` + a "Ver todo"/"See all" pill
  (`btn btn-ghost !min-h-[34px] !px-3.5 text-xs`) on the right.
- Body: Sora 400/500, `text-fog` for secondary.
- `label`: small uppercase kicker for field names and metadata only.
- Numbers: `tabular-nums`. Play counts like "▶ 204K" use a lucide Play icon.

## Parts
- Buttons (all pills): `btn btn-primary` (gradient, the one main action per
  view), `btn btn-ghost` (glass), `btn btn-white`, `btn btn-quiet`.
  Legacy `btn-orange` = primary.
- Cards: `panel` (ink-2, 18px radius) or `rounded-card bg-ink-2`. Lists of songs:
  rows with 44–48px rounded covers (`rounded-[10px]`), title 600, artist fog,
  stats small. Grids of covers: square, `rounded-2xl`, title under.
- Chips: `chip` (pill, glass) and `chip chip-on` (selected = white).
- Tags: `tag tag-orange|tag-pink|tag-cyan|tag-white` ("🔥 HOT", "NUEVO", "#1").
- Inputs: `field` (14px radius). Selects get a ChevronDown icon.
- Tabs: pill segmented control (`rounded-full bg-ink-2 p-1` with the active
  item `bg-white text-[#08080A]`), or chips.
- Glow: `<div className="brand-glow ..." />` behind a hero, used sparingly.
- Icons: lucide, strokeWidth 2, 16–20px.
- Emoji are fine in small doses where Gen Z expects them (🔥 tags, 🎲 random),
  never as layout.

## Avoid
- The previous design's console look: hairline-ruled spec sheets, `01 —`
  numbered section labels, mono uppercase everywhere, chamfered corners,
  corner ticks, measuring grids.
- Corporate filler, walls of text, tiny low-contrast type.

## Devices (Apple and Android phones, tablets, computers, the Android app)
- `px-safe` for side padding on phones; never bare `100vh` (use dvh).
- Hover effects only through `hoverable:` so touch screens never stick.
- Touch targets ≥ 44px; inputs are 16px on touch devices (globals.css).
- Horizontal rows on phones: `flex overflow-x-auto snap-x scrollbar-hide` with
  `scroll-px-4 -mx-4 px-4` so the first card isn't flush to the edge.
- Motion respects "reduce motion" (globals.css).
