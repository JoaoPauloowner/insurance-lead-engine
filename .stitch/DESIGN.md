---
name: Prime High-Density InsurTech System
colors:
  surface: '#030712'
  surface-dim: '#030712'
  surface-bright: '#1f2937'
  surface-container-lowest: '#020617'
  surface-container-low: '#0b0f19'
  surface-container: '#111827'
  surface-container-high: '#1f2937'
  surface-container-highest: '#374151'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#f8fafc'
  inverse-on-surface: '#020617'
  outline: '#334155'
  outline-variant: '#1e293b'
  surface-tint: '#3b82f6'
  primary: '#2563eb'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#dbeafe'
  secondary: '#10b981'
  on-secondary: '#022c22'
  secondary-container: '#059669'
  on-secondary-container: '#d1fae5'
  tertiary: '#38bdf8'
  on-tertiary: '#082f49'
  tertiary-container: '#0284c7'
  on-tertiary-container: '#e0f2fe'
  error: '#f43f5e'
  on-error: '#4c0519'
  error-container: '#be123c'
  on-error-container: '#ffe4e6'
  background: '#030712'
  on-background: '#f8fafc'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
  numeric-data:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    fontVariantNumeric: tabular-nums
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  gutter: 16px
  container-max: 1440px
---

## Visual Atmosphere
- **Concept:** High-Density Analytical InsurTech Terminal.
- **Mood:** Authority, surgical precision, instant quotes, zero visual slop.
- **Density Score:** 8/10 (Cockpit Dense) — micro-spacing (4px/8px), maximum information density above the fold, no excessive dead space.
- **Banned Clichés:** No generic purple/blue AI neon glows, no rounded-pill cards, no washed-out drop shadows.

## Colors
- **Canvas Base:** `#030712` (Slate-950 deep).
- **Surface Tiers:** `#0b0f19` (Container Low), `#111827` (Card Surface), `#1f2937` (Hover state).
- **Accents:** Electric Blue (`#2563eb`) for primary interactions; Vivid Emerald (`#10b981`) exclusively for conversion, positive margins, and instant policy approval.
- **Telemetry:** Cyan (`#38bdf8`) for real-time FIPE pricing and risk indicators.
- **Borders:** Crisp, 1px translucent borders (`rgba(51, 65, 85, 0.6)` / Slate-800).

## Typography
- **Headlines & Metric Titles:** `Plus Jakarta Sans` with tight negative tracking (-0.02em).
- **Tabular Data & Body:** `Inter` with `font-variant-numeric: tabular-nums` for aligned BRL (`R$`) values, dates, percentages, and policy numbers.

## Component Behaviors
- **Buttons:** 36px/40px compressed height, 8px radius, solid emerald with dark text for primary conversion; slate outline for secondary.
- **Form Inputs:** 34px height, slate-950 background with subtle focus rings.
- **Cards:** Glassmorphism 1px top highlight, high contrast internal padding (16px), dense row checklists with 12px status icons.
- **Status Badges:** Compact labels (`label-xs`), uppercase, pill with 1px border and glowing dot indicator.
