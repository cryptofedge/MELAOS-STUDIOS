# MELAOS design system

A precision instrument, not a template. Near-black inks, hairline rules, one
signal color, mono readouts, and the logo's gradient only where it means
something. The reference implementation is `src/app/page.tsx` (home) and
`src/components/Navbar.tsx`.

## What we avoid (it reads as "AI-generated")
- Purple/pink haze gradients, glowing blobs, `blur-3xl` orbs.
- Gradient text on headlines; sparkle icons and pill "badges".
- `rounded-full` pill buttons, `rounded-2xl` cards, icon-in-a-gradient-square tiles.
- Neon `box-shadow` glows on everything; pulsing buttons; hover `scale-105`.
- Emoji as UI. Centered everything.

## Color (tailwind tokens, same brand colors as before)
| Token | Use |
|---|---|
| `bg-ink-0` #050507 | page background |
| `bg-ink-1` #0A0A0E | panels, inputs |
| `bg-ink-2` / `ink-3` / `ink-4` | raised surfaces, selected rows |
| `border-line` #22222C, `border-line-soft`, `border-line-strong` | 1px rules and borders |
| `text-white` / `text-[#ECECF1]` | primary text |
| `text-fog` #9A9AA6 | secondary text |
| `text-fog-dim` #6B6B78 | labels, metadata |
| `melaos-orange` #F28C28 | THE signal: primary action, active state, key numbers |
| `melaos-pink` #E91E8C, `melaos-magenta` #AE06ED | logo gradient only: `.brand-rule`, small accents |
| `melaos-cyan` #00FFD1 | "live" indicators and meters only |
| `melaos-hot` #FF2D78 | errors, recording |
| `melaos-blue` #007AFF | links in long text |

## Type
- `display` class (Unbounded): headlines. Usually `font-light`; sizes with `clamp()`.
- Default body (IBM Plex Sans): reading text, titles of items (`font-medium`).
- `label` class (IBM Plex Mono, 10.5px, uppercase, wide tracking): section indices
  ("01 — Escucha"), field names, metadata, readouts. Use `tabular-nums` for numbers.

## Shapes and parts
- Buttons: `btn btn-primary` (orange, dark text, chamfered corners — the one main
  action per view), `btn btn-ghost` (1px border), `btn btn-quiet` (text only).
  `.btn` is 44px tall minimum (touch target). Legacy `btn-orange` maps to primary.
- Surfaces: `panel` (ink-1 + 1px line + 4px radius) or `panel-raised`. Radius max
  4px; `rounded-xs` (2px) for inputs and chips.
- `hud` adds four orange corner ticks to any element (use sparingly: one hero item).
- Grids of items: `grid gap-px bg-line-soft border border-line-soft` with cells
  `bg-ink-0` — a ruled spec sheet instead of floating cards.
- Inputs: `field` class.
- Section header: label line `NN — Name`, display title, optional fog subtitle,
  `border-b border-line-soft pb-6`.
- Icons: lucide, `strokeWidth={1.5}`–`1.75`, 16–18px, orange or fog.
- `live-dot` (cyan) for live status. `rule-grid` for a faint measuring grid.

## Devices (Apple and Android phones, tablets, computers, the Android app)
- Layout already pads for the notch and home bar: top bar uses `--nav-h`, main
  content has `padding-top: var(--nav-h)` and `padding-bottom: var(--player-h)`.
  Anything fixed to the bottom must add `var(--safe-bottom)`.
- Use `px-safe` for side padding on phones (respects landscape notches).
- Full-height areas: `min-h-dvh-safe` or `dvh` units, never bare `100vh`.
- Hover effects only through `hoverable:` (e.g. `hoverable:hover:bg-ink-1`), so
  touch screens never get stuck hover states.
- Touch targets ≥ 44px. Inputs are 16px on touch devices (globals.css) so iOS does
  not zoom.
- Horizontal rows on phones: `overflow-x-auto snap-x scrollbar-hide`.
- Motion respects "reduce motion" (globals.css).
