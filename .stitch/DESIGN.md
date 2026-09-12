---
name: My Design System
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#424751'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#737782'
  outline-variant: '#c3c6d3'
  surface-tint: '#2a5ea7'
  primary: '#275ba5'
  on-primary: '#ffffff'
  primary-container: '#4474bf'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#565f71'
  on-secondary: '#ffffff'
  secondary-container: '#d7e0f5'
  on-secondary-container: '#5a6375'
  tertiary: '#6d5372'
  on-tertiary: '#ffffff'
  tertiary-container: '#866c8b'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#dae2f8'
  secondary-fixed-dim: '#bec7dc'
  on-secondary-fixed: '#131c2b'
  on-secondary-fixed-variant: '#3e4758'
  tertiary-fixed: '#f9d8fd'
  tertiary-fixed-dim: '#dcbce0'
  on-tertiary-fixed: '#28132e'
  on-tertiary-fixed-variant: '#563e5c'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Design System

## Brand & Style
The design system embraces a **rainbow** modern aesthetic, combining clean structure with a vibrant, versatile color palette using Inter as the core typeface. The visual tone is highly functional, professional, and accessible, suitable for modern web applications requiring clear hierarchical distinction and a fresh user experience.

## Colors
The color palette utilizes a vibrant primary blue (`#4777c2`) for key interactive elements, complemented by a slate secondary tone (`#6e778a`) and a distinctive purple-tinted tertiary color (`#896e8e`). Neutral tones (`#777777`) provide high-contrast readability across light surfaces while maintaining clean, balanced layouts.

## Typography
**Inter** serves as the universal typeface for headlines, body text, and labels, ensuring high legibility and a contemporary digital feel. Type scales cleanly from dense data displays to prominent structural headings.

## Layout & Spacing
A consistent 8px-based spacing rhythm organizes the layout. Standard gutters are set to `1rem` with outer canvas margins at `1.5rem`, ensuring proper breathing room across standard viewports.

## Elevation & Depth
Elevation is achieved through a combination of subtle tonal layers and clean, low-contrast outlines. Shadows are kept soft and minimal to reinforce a flat yet tactile interface structure.

## Shapes
A roundedness level of `2` provides friendly, approachable UI elements with standard `0.5rem` corner radiuses on containers, buttons, and input components, scaling appropriately for larger cards and modals.

## Components
Components utilize the Inter typography, standard rounded corners (`0.5rem`), and the primary `#4777c2` color for focus and primary actions. Buttons, input fields, cards, and chips maintain consistent padding based on the established layout rhythm.