---
name: CollZap
description: Campus peer-matching for verified Indian college students
colors:
  paper: "#F4F7FB"
  surface: "#FFFFFF"
  surface-2: "#EEF3F9"
  ink: "#0A1F44"
  mute: "#4A5568"
  line: "#DDE6F1"
  good: "#089082"
  wait: "#B0770F"
  bad: "#C0392B"
  brand-navy: "#072B5F"
  accent-50: "#EFF6FF"
  accent-100: "#DCEAFD"
  accent-200: "#B6D4FA"
  accent-300: "#7FB3F3"
  accent-400: "#2E8AE0"
  accent-500: "#0B63C9"
  accent-600: "#0A52A8"
  accent-700: "#0A4287"
  accent-800: "#0B356B"
  accent-900: "#082A54"
  accent-950: "#061A36"
  teal-50: "#E6FBF7"
  teal-100: "#C4F5EC"
  teal-200: "#8DEBDC"
  teal-300: "#4EDCC8"
  teal-400: "#16C9B0"
  teal-500: "#06C8AD"
  teal-600: "#089082"
  teal-700: "#0A7168"
  teal-800: "#0C5A53"
  teal-900: "#0C4A45"
  teal-950: "#032B28"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw + 1rem, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  none: "0px"
  sm: "6px"
  DEFAULT: "8px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-500}"
    textColor: "#FFFFFF"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-600}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.accent-50}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.bad}"
    textColor: "#FFFFFF"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    height: "44px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-primary:
    backgroundColor: "{colors.accent-50}"
    textColor: "{colors.accent-700}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.accent-600}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
---

# Design System: CollZap

## Overview

**Creative North Star: "The Verified Signal"**

CollZap's screen language is built around one recurring idea: two anonymous, verified signals finding each other and resolving into a match. That mechanism — not a mascot, a photo, or an invented identity — is the thing the interface keeps drawing. A cobalt-to-teal gradient carries the sense of a live connection forming; hairline borders and tabular monospace figures carry the sense of something verified and precise, closer to a ledger than a social feed; a spring-loaded ink stamp closes the loop by literally marking something as confirmed. Nothing here performs playfulness for its own sake — the confidence comes from precision, not decoration.

The system sits on a light, cool-blue ground by default with a genuine (not merely inverted) dark theme: dark mode re-points the accent ramp rather than just darkening it, so the same semantic classes (`bg-accent-50`, `text-accent-700`) stay legible and correctly weighted in both themes. Depth is earned, not decorative — surfaces are flat and hairline-bordered at rest, and shadow only appears as feedback to hover, focus, or genuine elevation. Components are tactile and precise: buttons have a subtle pointer-following "magnetic" pull, inputs float their labels on focus, and the signature Stamp component overshoots slightly on entry like real ink hitting paper — controlled physicality that reads as considered engineering, never as gamification.

**Key Characteristics:**
- A single accent gradient (cobalt → teal) is the one recurring "brand energy" signal; it appears sparingly, on top bars, CTAs, and connective lines, never as a full-bleed background.
- Hairline-first elevation: 1px borders are the default separator; shadow is reserved for interaction and true overlays.
- Monospace, uppercase, wide-tracked labels (`font-mono`, `tracking-widest`) mark every eyebrow, stat label, and status pill — the system's one deliberate "typewritten/verified" texture.
- Dark mode re-points color roles rather than inverting lightness, so brand color always reads correctly in either theme.
- Motion is physics-based (springs, magnetism, overshoot) and universally gated behind `prefers-reduced-motion`.

## Colors

A cool, restrained palette: one blue accent ramp for interaction, one teal ramp as the gradient's warm counterpart and for positive/highlight states, and a navy-tinted (never neutral-gray) neutral scale for ground and ink.

### Primary
- **Cobalt** (`#0B63C9`, `accent-500`): the primary interactive color — default button fill, focus rings, links, active states. Used at full strength only on buttons/rings; elsewhere it appears as a tint (`accent-50`/`accent-100`) behind badges and hover backgrounds.
- **Cobalt Hover** (`#0A52A8`, `accent-600`): hover/pressed state for primary actions.
- **Cobalt Ink** (`#0A4287`, `accent-700`): text-on-tint role — accent-colored text sitting on an `accent-50` background (badges, links on light chips) stays at proper contrast.

### Secondary
- **Signal Teal** (`#06C8AD`, `teal-500`): the gradient's warm end. Used for positive/"matched" states and as the second stop in the brand gradient; rarely used as a solid fill on its own.

### Neutral
- **Paper** (`#F4F7FB`, `paper`): the page background in light mode.
- **Surface** (`#FFFFFF`, `surface`): card and panel background.
- **Surface Deep** (`#EEF3F9`, `surface-2`): a second, slightly recessed surface tone (input wells, footers-of-cards).
- **Deep Ink** (`#0A1F44`, `ink`): primary text. Navy-tinted, never true black.
- **Mute Slate** (`#4A5568`, `mute`): secondary/supporting text.
- **Hairline** (`#DDE6F1`, `line`): the default 1px border/divider color used everywhere at rest.
- **Wordmark Navy** (`#072B5F`, `brand-navy`): fixed logo/wordmark color in both themes — a brand constant, not a themed surface token.

### Status
- **Good** (`#089082`): success/confirmation states.
- **Wait** (`#B0770F`): pending/in-progress states.
- **Bad** (`#C0392B`): error/destructive states.

### Named Rules
**The Re-Pointed Ramp Rule.** Dark mode never just darkens the accent/teal ramps — it re-points them, so the tint end (50–200) becomes deep navy and the ink end (700–900) becomes light blue. The same class names (`bg-accent-50` + `text-accent-700`) must stay legible in both themes without a single `dark:` utility at the call site.

**The Gradient-Restraint Rule.** The full four-stop brand gradient (`#0B5CC7 → #0093D2 → #00B8BC → #06C8AD`) is reserved for large decorative surfaces (top bars, hero backgrounds). Anywhere legible white text sits on the gradient — buttons, CTAs — use the trimmed CTA ramp (`#0A3F8C → #0B63C9 → #0A7FA8`) instead: the full gradient's teal end only holds 2.6:1 contrast for white text, the CTA ramp holds 4.55:1 at its lightest point.

## Typography

**Display Font:** Plus Jakarta Sans (with Inter, system-ui fallback)
**Body Font:** Inter (with system-ui, -apple-system fallback)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace fallback)

**Character:** Plus Jakarta Sans carries the wordmark's geometric, slightly rounded warmth for anything that needs to feel like a brand statement; Inter handles all body and UI text at the sizes it was actually built for; IBM Plex Mono is reserved entirely for the system's "verified/precise" texture — labels, eyebrows, tabular figures — never for prose.

### Hierarchy
- **Display** (800, `clamp(2.25rem, 4vw + 1rem, 3.75rem)`, 1.05 line-height, `-0.04em` tracking): hero headlines only — the one place type is allowed to be the visual centerpiece.
- **Headline** (700, 1.5rem/24px, 1.3 line-height, `-0.025em` tracking): section titles ("The problem we set out to solve", "How CollZap works").
- **Title** (700, 1rem/16px, 1.4 line-height, `-0.015em` tracking): card and component titles.
- **Body** (400, 0.9375rem–1rem, 1.625 line-height): paragraph copy; `text-mute` for supporting body text, `text-ink` for primary. No enforced measure limit observed, but sits within ~65ch containers in practice (`max-w-xl`/`max-w-3xl`).
- **Label** (600, 0.625–0.6875rem/10–11px, `0.18–0.22em` tracking, uppercase): eyebrows, stat labels, badges, nav micro-copy. Always `font-mono` and always uppercase — this pairing never appears in any other role.

### Named Rules
**The Mono-Label Rule.** Any uppercase, wide-tracked micro-label uses `font-mono`, never the display or body face. It's the system's one consistent "this is metadata, not prose" signal.

**The Tabular-Figures Rule.** Any number that changes or ticks (streaks, points, timers, counts) uses `font-variant-numeric: tabular-nums` (`.tnum`) so digits don't shift width as they update.

## Layout

Content sits in a centered, generous max-width container (commonly `max-w-3xl` for reading-focused pages like About/Privacy, `max-w-6xl` for the landing hero and marketing grids). Spacing uses Tailwind's default scale directly — no custom spacing tokens were introduced — with a preference for large vertical rhythm between sections (`mt-12`–`mt-16`, `space-y-14`) and tighter internal component padding (`p-4`–`p-6`).

Responsive behavior is mobile-first with a small set of breakpoints doing the real work: single-column stacks collapse to `sm:`/`lg:` grids (e.g. the landing hero's `lg:grid-cols-[1.1fr_auto]`), and nav/CTA visibility shifts specifically at `md:` rather than `sm:` (deliberately raised from `sm:` after a UX pass found controls disappearing too early on small-but-not-tiny phones). Cards and dashboard rows commonly resolve to a three-column grid on desktop (`lg:grid-cols-3` / bespoke `minmax()` splits) collapsing to one column on mobile.

## Elevation & Depth

Flat at rest, responsive on interaction. Every surface starts with a 1px hairline border (`--sh-hairline`, or the plain `border-line` utility) rather than a shadow — shadow is not ambient decoration here, it's feedback. A card or button gains `shadow-sm`/`shadow-soft` only in a hover or active state, and only the `lg`/`xl` shadow steps are used for genuine overlays (modals, dropdowns). Dark mode deepens shadows into real black rather than navy-tinted, and adds a faint cool-blue rim light instead of a bright one, so elevated dark surfaces still read as "lifted" without turning muddy.

### Shadow Vocabulary
- **Hairline** (`0 0 0 1px rgb(10 31 68 / 0.08)`): the default surface/card border-as-shadow; used far more than any actual box-shadow.
- **Soft** (`0 2px 10px rgb(10 31 68 / 0.06), 0 0 0 1px rgb(10 31 68 / 0.04)`): default hover state for cards and secondary buttons.
- **MD** (`0 4px 14px rgb(10 31 68 / 0.07), 0 0 0 1px rgb(10 31 68 / 0.04)`): default shadow scale step for lightly elevated components.
- **LG / XL**: genuine overlays — modals, popovers, the landing hero's brand object card.
- **Glow-Accent / Glow-Teal** (`0 8px 26px rgb(11 99 201 / 0.26)` / teal equivalent): reserved for primary-button and brand-object hover states — a colored glow rather than a neutral shadow, used sparingly as a "this is the important action" signal.
- **Rim** (`inset 0 1px 0 rgb(255 255 255 / 0.7)`, `.rim` class): an inner top-edge highlight for dark, brand-forward cards (the hero's LiveMatchCard) — simulates a light catching the top bevel of a physical object.

### Named Rules
**The Earned-Depth Rule.** Nothing gets a resting shadow. If an element has a shadow at rest, it should be reclassified as an overlay (modal/dropdown), not a card.

## Shapes

Radius scales from 6px (`sm`, chips/badges) through 8px (`DEFAULT`, buttons/inputs) to 14px (`lg`, cards) up to 18–32px (`xl`–`3xl`) for large decorative panels and brand objects. Nothing in the system uses a fully square (0px) corner except the explicit `rounded-none` escape hatch, and nothing uses a fully circular/pill radius except avatars, status dots, and the Stamp's ink-blot dots — pill shapes are reserved for "this is a person or a live indicator," not for buttons or chips.

## Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Buttons
- **Character:** tactile and precise — a physical pointer-following pull, never a bounce.
- **Shape:** `rounded` (8px, `DEFAULT`).
- **Primary:** solid cobalt fill (`accent-500` → `accent-600` on hover), white text; deliberately a solid fill rather than the full gradient, because white-on-gradient only clears 2.6:1 contrast at the teal end.
- **Gradient (CTA):** the trimmed CTA gradient (`grad-brand-cta`, `#0A3F8C → #0B63C9 → #0A7FA8`) with a `shadow-glow-accent` hover and a slight brightness lift — reserved for the single most important action on a screen (hero CTA, final "find peers" action), never for a secondary button.
- **Secondary:** surface background, hairline border, hovers to an `accent-50` tint background with an `accent-400` border.
- **Ghost:** transparent, muted text, hovers to a near-invisible `ink/5%` wash.
- **Danger:** solid `bad` fill, white text.
- **Hover/Focus:** all variants share one focus treatment — `ring-2 ring-accent-500 ring-offset-2 ring-offset-paper` — plus a subtle magnetic pointer-follow transform (max 4px shift) on fine-pointer devices only; touch and reduced-motion both disable it.
- **Sizes:** `sm` (32px), `md` (40px, default), `lg` (48px), plus a square `icon` size (40px) for lone-glyph actions.

### Badges / Chips
- **Style:** bordered pill-ish rectangle (`rounded-sm`, 6px), tinted background matched to semantic role (`accent-50`/`teal-50`/`wait`/`bad` at low opacity), uppercase mono-adjacent label text.
- **State:** no interactive states — badges are status display only, never clickable.

### Cards / Containers
- **Corner Style:** `rounded-lg` (14px).
- **Background:** `surface` (white / dark-navy-surface).
- **Shadow Strategy:** flat hairline border at rest; `hoverable` cards add `shadow-lg` + `border-accent-300` on hover only (see Elevation & Depth).
- **Border:** 1px `line` hairline, always present.
- **Internal Padding:** 24px (`p-6`) body, with a distinct 16px×24px (`py-4 px-6`) header/footer band separated by a hairline rule.

### Inputs / Fields
- **Style:** hairline border, `surface` background, `rounded` (8px), floating label that rests centered until focus or content pushes it to a small uppercase mono-styled label at the top of the field.
- **Focus:** border shifts to `accent-500` plus a soft `accent-500/25` ring — no glow, no shadow, just the ring.
- **Error:** border and label both shift to `bad`, with a `bad`-colored ring on focus; error copy renders below the field in `bad`.

### Navigation
- Top nav uses the same hairline-bordered, flat-until-scrolled treatment as cards; primary nav links use body weight/size, active/current state uses `accent-700` text rather than a background fill. Login/signup CTA visibility is gated at the `md:` breakpoint, not `sm:`, so it never disappears on borderline-small phones.

### The Stamp (signature component)
A rubber ink-stamp: a bordered, uppercase, mono-labeled tag (e.g. "MATCHED", "VALID") that lands slightly oversized and rotated, then spring-settles into place with a single overshoot — mimicking a real stamp hitting paper. Fires once, on scroll-into-view. It's the system's clearest embodiment of "The Verified Signal": verification made into a physical, momentary gesture rather than a static badge. Used sparingly and consistently (hero badge, comparison cards, closing mantra) so the gesture reads as one recurring idea, not three unrelated effects.

## Do's and Don'ts

### Do:
- **Do** use the full four-stop brand gradient only on large decorative surfaces; use the trimmed CTA gradient (or solid `accent-500`) anywhere legible text sits on top of it.
- **Do** keep every uppercase micro-label in `font-mono` — this is the system's one consistent "metadata" signal and should never leak into body or display type.
- **Do** gate all motion (magnetic buttons, stamp overshoot, gradient drift, scroll reveals) behind `prefers-reduced-motion`; the CSS-level global override in `index.css` is the backstop, but components should still branch explicitly where physics (springs, magnetism) is involved.
- **Do** give every surface a hairline border by default, and reserve shadow strictly for hover/focus/overlay states (The Earned-Depth Rule).
- **Do** re-point color ramps for dark mode rather than mechanically inverting lightness, so semantic pairs (`bg-X-50` + `text-X-700`) stay correctly weighted in both themes.

### Don't:
- **Don't** put a resting shadow on any card, button, or panel that isn't a genuine overlay (modal/dropdown/popover).
- **Don't** use a pill/fully-rounded radius on anything except avatars, live-status dots, and the Stamp's accent dots — buttons and chips stay at 6–8px.
- **Don't** invent a person: no avatars-with-initials, stock photography of "a student," or named/pictured personas standing in for a match. The brand's people-representation is the bare "signal node" (a plain colored dot in a ringed circle) established by `SignalNode`/`IdBadge` — identity is never fabricated for decoration.
- **Don't** add a new `dark:` utility at a call site. Every color is theme-aware through the CSS custom property layer in `index.css`; a literal `dark:` class is a sign the token system is being bypassed.
- **Don't** use the brand gradient as a full-bleed page background — it appears as a thin top-bar accent, a text-fill, a connective line, or a button fill, never as a dominant background wash.
