---
name: Serene Sanctuary
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#424846'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#727876'
  outline-variant: '#c2c8c5'
  surface-tint: '#4f625d'
  primary: '#0F223F'
  on-primary: '#ffffff'
  primary-container: '#1E3A8A'
  on-primary-container: '#D1E4FF'
  inverse-primary: '#A0C2FF'
  secondary: '#4A90E2'
  on-secondary: '#ffffff'
  secondary-container: '#D1E4FF'
  on-secondary-container: '#001D36'
  tertiary: '#0F223F'
  on-tertiary: '#ffffff'
  tertiary-container: '#BCE2FF'
  on-tertiary-container: '#001D36'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#D1E4FF'
  primary-fixed-dim: '#A0C2FF'
  on-primary-fixed: '#001D36'
  on-primary-fixed-variant: '#1E3A8A'
  secondary-fixed: '#D1E4FF'
  secondary-fixed-dim: '#A0C2FF'
  on-secondary-fixed: '#001D36'
  on-secondary-fixed-variant: '#1E3A8A'
  tertiary-fixed: '#BCE2FF'
  tertiary-fixed-dim: '#77C2FF'
  on-tertiary-fixed: '#001D36'
  on-tertiary-fixed-variant: '#0F223F'
  background: '#ffffff'
  on-background: '#1a1c1b'
  surface-variant: '#E6EDF2'
  slate-deep: '#0F223F'
  sand-silk: '#E6EDF2'
  sage-haze: '#4A90E2'
  linen-white: '#FFFFFF'
  bone: '#F3F6F8'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '300'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  button:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is centered on the concept of "Quiet Luxury"—a movement away from overt branding toward tactile quality, breathable layouts, and sophisticated restraint. The target audience seeks premium home essentials that transform a living space into a sanctuary of rest. 

The aesthetic is **Minimalist** with a **Tactile** edge. It prioritizes high-quality imagery and extreme whitespace to evoke a sense of calm and openness. Visual elements are intentional and sparse, ensuring that the textures of the bedding products remain the focal point. The interface should feel like a high-end boutique: effortless, welcoming, and impeccably organized.

## Colors
The palette is rooted in tranquil, deep tones that mimic the night sky and evoke a profound sense of restful sleep, taking inspiration from the Ru9 theme.

- **Primary (Slate Deep - #0F223F):** Used for typography, high-contrast UI elements, and primary branding. It represents the depth of a peaceful night.
- **Secondary (Sand Silk - #E6EDF2):** A pale, soft blue-gray used for subtle CTAs, background tints, and delicate material details.
- **Tertiary (Sage Haze - #4A90E2):** A vibrant sky blue reserved for interactive feedback, links, and secondary navigation elements to provide a fresh pop of color.
- **Neutral (Linen White - #FFFFFF):** Pure white used for large-scale backgrounds to create a clean, airy, expansive feel.
- **Bone (#F3F6F8):** A secondary cloud-like background layer used to differentiate sections or group related content without breaking the minimalist flow.

## Typography
The system uses **Manrope** exclusively to maintain a modern, geometric, yet highly readable presence. 

- **Display & Headlines:** Utilize light weights (300) for large display text to emphasize elegance. Letter spacing is slightly tightened on large headings to maintain visual density.
- **Labels:** Small utility text and category labels use uppercase styling with generous letter spacing to provide a "catalog" or "editorial" feel.
- **Body Copy:** Set with a generous line height (1.6) to ensure long-form descriptions of fabrics and materials are easy to digest and feel uncrowded.

## Layout & Spacing
This design system utilizes a **Fixed Grid** for desktop and a **Fluid Grid** for mobile devices. 

- **Desktop:** 12-column layout centered in a 1280px container. Large external margins (64px) ensure content never feels cramped.
- **Sectioning:** Vertical rhythm is defined by large gaps (120px) between major sections to allow the user's eyes to rest.
- **Reflow:** On mobile, margins reduce to 16px and the grid collapses to 2 columns for product listings.
- **Visual Breathability:** Content should never occupy 100% of the vertical viewport height unless it is a hero image, ensuring white space is visible at all times.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Soft Ambient Shadows** rather than sharp borders or heavy extrusions.

- **Surface Levels:** The primary background is `Linen White`. Secondary containers (like Chatbot bubbles or AR panels) use `Bone` or a slight `Sand Silk` tint.
- **Shadows:** Use extremely diffused shadows for floating elements (e.g., `rgba(51, 70, 65, 0.04)` with a 40px blur). This mimics the soft fall of light on fabric.
- **AR Experience:** Elements in the AR preview should use high-quality glassmorphism (backdrop blur) for controls to ensure they remain legible over various room backgrounds without obscuring the product.
- **Interaction:** On hover, cards do not lift; instead, they might subtly shift tone or use a very soft inner glow to indicate focus.

## Shapes
The shape language is **Soft (0.25rem)**. 

While the overall layout is structured and grid-based, buttons and containers feature a subtle radius to prevent the design from feeling too clinical or sharp. This mimics the soft corners of folded linens and pillows. Large images may remain sharp-edged (0px) to maintain a high-fashion photography feel, while interactive UI components utilize the soft radius.

## Components
- **Buttons:** Primary buttons are solid `Slate Deep` with white text, using a "pill-lite" (soft) shape. Secondary buttons use a `1px` stroke of `Slate Deep` with no background.
- **AI Chatbot:** The interface should feel like a personal concierge. Use a "floating" chat window with a `Linen White` background and `Sage Haze` accents for user messages. Typography should be `body-md`.
- **AR Preview:** The "View in Room" button should be prominent on product pages. The AR interface uses translucent `Slate Deep` controls with white icons to ensure visibility against bright room environments.
- **Cards:** Product cards are borderless. The background of the image should ideally be `Bone` to create a seamless transition to the site background.
- **Input Fields:** Minimalist design with only a bottom border (`1px Slate Deep` at 20% opacity). On focus, the border becomes 100% opaque.
- **Chips:** Used for material selection (e.g., "Organic Cotton", "Linen"). These should be `Sand Silk` with `Slate Deep` text.
- **Lists:** Clean, bulletless lists with generous vertical padding and `1px` horizontal dividers in `Bone`.