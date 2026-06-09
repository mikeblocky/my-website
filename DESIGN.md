---
name: mikeblocky.com
description: A quiet, slow space for drawings, zines, and wandering thoughts.
colors:
  primary: "#e25566"
  neutral-bg: "#ffffff"
  neutral-fg: "#0a0a0a"
  pride-pink: "#e25566"
  pride-orange: "#f59e0b"
  pride-yellow: "#eab308"
  pride-green: "#22c55e"
  pride-blue: "#3b82f6"
  pride-purple: "#a855f7"
typography:
  display:
    fontFamily: "var(--font-sans), sans-serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "-0.03em"
  body:
    fontFamily: "var(--font-sans), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.6"
  label:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
---

# Design System: mikeblocky.com

## 1. Overview

**Creative North Star: "The Slow Artist Sanctuary"**

This system represents a personal, slow space for archiving illustrations and sharing written reflections. It rejects the loud, boxy, high-pressure visuals of SaaS landing pages and commercial portfolios. Instead, it embraces high-end editorial restraint: generous whitespace (macro-whitespace), clean text-based layouts, and very light, precise details. 

For the month of June, the system welcomes a quiet, soft Pride Month UI. The Pride colors flow dynamically through a 30-day calendar cycle, acting as gentle, ambient enhancements rather than dominating the screen.

**Key Characteristics:**
- **Asymmetrical Editorial Layouts**: Text blocks and links flow organically, avoiding rigid, identical card grids.
- **Microscopic Accents**: High-contrast, dynamic colors are restricted to borders, highlights, and micro-interactions.
- **Deep Spatial Breathing**: Layouts are spaced out with substantial margins, allowing the content to rest.

## 2. Colors

The color palette is derived dynamically based on the day of the month, using system-wide neutral bases.

### Primary
- **Active Pride Accent** (var(--pride-colors)): A dynamic set of pride colors corresponding to the day's flag. Used sparingly for highlights, links, and borders.

### Neutral
- **Background** (#ffffff / dark: #050b14): Clear off-white in light mode; deep, quiet navy-black in dark mode.
- **Foreground** (#0a0a0a / dark: #d1d5db): Saturated ink black in light mode; soft silver-grey in dark mode.
- **Muted** (#6b7280 / dark: #9ca3af): Mid-tone gray for supporting texts.

### Named Rules
**The 10% Pride Rule.** Dynamic pride colors must never cover more than 10% of any viewport's visual surface. They are accents, not floods.
**The Diagonal Blend Rule.** Pride gradients must flow at a `135deg` angle rather than flatly horizontal, creating depth and a premium look.

## 3. Typography

**Display Font:** Geist (var(--font-sans))
**Body Font:** Geist (var(--font-sans))
**Label/Mono Font:** IBM Plex Mono (var(--font-mono))

### Hierarchy
- **Display** (Bold, clamp(2rem, 5vw, 4rem), 1.1): Used for main site/page titles. Letter spacing must be tight (-0.03em) but legible.
- **Headline** (SemiBold, 1.25rem - 1.5rem, 1.3): Used for section headings.
- **Body** (Regular, 0.875rem, 1.6): Used for blog content, diaries, and descriptions. Max line length: 65ch.
- **Label** (Medium, 0.75rem, 1.5): Used for badges, tags, dates, and navigation links. Always tracked out (0.1em) and in monospace.

## 4. Elevation

The system is flat by default, relying on subtle background tints and hairlines to delineate elements. 

### Named Rules
**The Flat-Rest Rule.** Containers and cards are flat at rest. Subtle diagonal gradient borders or glows appear only upon user focus or hover.

## 5. Components

### Navigation
- **Style**: Floating, detached text links styled with the monospace label font. 
- **States**: Hovering translates links slightly up (-1px) and applies a delicate gradient border highlight.

### Portal Links (Former Cards)
- **Style**: A clean, vertical or horizontal list of text items with thin borders. Each item has a light icon, bold title, and a tiny, soft status description.
- **States**: Hovering slides the chevron or arrow diagonally and highlights the text color.

## 6. Do's and Don'ts

### Do:
- **Do** allow sections to breathe with at least `py-16` to `py-24` padding.
- **Do** use custom easing `cubic-bezier(0.32, 0.72, 0, 1)` for transitions.
- **Do** change the background mesh gradient direction to diagonal to match the pride theme redirection.

### Don't:
- **Don't** use identical grid blocks with icons and paragraphs (SaaS style).
- **Don't** use flat horizontal `90deg` gradients; use `135deg` diagonal gradients.
- **Don't** include redundant copy explaining the Pride theme or UI mechanics.
