---
name: Botanical Wellness Narrative
colors:
  surface: '#faf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#424845'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f2f1ef'
  outline: '#727975'
  outline-variant: '#c2c8c4'
  surface-tint: '#4a645b'
  primary: '#173028'
  on-primary: '#ffffff'
  primary-container: '#2d463e'
  on-primary-container: '#98b3a9'
  inverse-primary: '#b1cdc2'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#2b2b2b'
  on-tertiary: '#ffffff'
  tertiary-container: '#414141'
  on-tertiary-container: '#afadac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce9dd'
  primary-fixed-dim: '#b1cdc2'
  on-primary-fixed: '#062019'
  on-primary-fixed-variant: '#334c44'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  h1:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  h3:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is rooted in the intersection of organic vitality and high-end luxury. It is crafted for a premium wellness social network that values tranquility, expertise, and community. The visual language evokes the feeling of a high-end botanical garden or an exclusive spa—calm, breathing, and intentional.

The style is **Minimalist / Modern Luxury**, characterized by:
*   **Expansive Whitespace:** Prioritizing negative space to reduce cognitive load and evoke a sense of calm.
*   **Organic Sophistication:** Combining deep, earth-toned greens with metallic accents.
*   **High-Fidelity Imagery:** Large, editorial-style photography serves as the primary visual driver, framed by generous padding.
*   **Tactile Softness:** Using large border radii and subtle depth to make digital interactions feel gentle and approachable.

## Colors

The palette is anchored by **Forest Green**, representing growth and botanical stability. The **Cream** background replaces harsh whites to provide a warmer, more "paper-like" tactile quality.

*   **Primary (Forest Green):** Used for key actions, navigation states, and primary brand moments.
*   **Secondary (Gold):** Used sparingly for high-end accents, premium badges, and subtle dividers to signify luxury.
*   **Soft Black:** Reserved for primary typography to ensure high readability without the jarring contrast of pure black.
*   **Pastel Category Accents:** A secondary palette of muted, desaturated tints is used to categorize botanical varieties (Sativa, Indica, CBD) without breaking the minimalist aesthetic.

## Typography

The typographic hierarchy relies on the contrast between an authoritative, literary serif and a highly functional, neutral sans-serif.

*   **Headlines:** Noto Serif provides a classic, high-end editorial feel. Letter spacing is slightly tightened for larger display sizes to maintain a premium look.
*   **Body Text:** Inter is utilized for its exceptional legibility in social feeds and long-form wellness articles. It remains secondary to the serif to allow the brand voice to lead.
*   **Labels & Metadata:** All-caps styling with increased letter spacing is used for categories and tags, creating a distinct visual separation from the body narrative.

## Layout & Spacing

This design system employs a **Fixed Grid** on desktop (12 columns) and a **Fluid Grid** on mobile. The rhythm is built on an 8px base unit, but emphasizes "breathing room" through aggressive padding.

*   **Vertical Rhythm:** Sections are separated by large vertical gaps (`stack-lg`) to prevent the interface from feeling cluttered.
*   **Card Gutters:** Content cards use a 24px gutter to ensure that high-resolution images have enough visual "air."
*   **Alignment:** Text is primarily left-aligned to maintain a clean, structured edge against the soft, rounded containers.

## Elevation & Depth

To maintain a sophisticated and minimalist feel, the design system avoids heavy drop shadows in favor of **Ambient Depth**.

*   **Shadows:** Use extremely diffused, low-opacity shadows (e.g., `box-shadow: 0 10px 30px rgba(45, 70, 62, 0.05)`). The shadow color is tinted with Forest Green rather than gray to keep the depth "warm."
*   **Tonal Layering:** Surfaces use subtle shifts from the Cream background to pure White (#FFFFFF) to indicate interactivity or focus.
*   **Glass Effects:** Optional use of a subtle background blur on navigation bars (10-15px blur) with a high-transparency Cream overlay to maintain context during scroll.

## Shapes

The shape language is defined by **large, soft radii** that mimic the organic curves found in nature.

*   **Containers:** Cards and primary containers use a 1rem (16px) radius to soften the layout.
*   **Large Components:** Featured hero sections or large imagery blocks may use an extra-large (24px) radius for a more "contained" and premium feel.
*   **Buttons:** Action buttons use a pill-shaped radius (full round) to distinguish them from structural content containers.

## Components

### Cards
The centerpiece of the social network. Cards feature a "Photo-First" architecture. 
*   **Image:** Aspect ratio of 4:5 or 1:1, high-resolution, with a 16px corner radius.
*   **Content:** Text is placed below the image with a Serif title and a Sans-serif metadata line.
*   **Elevation:** Level 1 ambient shadow on hover to suggest interactivity.

### Buttons
*   **Primary:** Forest Green background with Cream text. Pill-shaped.
*   **Secondary:** Ghost style with a thin (1px) Forest Green or Gold border.
*   **Tertiary:** Text-only with an underline on hover, used for low-priority actions.

### Badges & Chips
Used for category identification (Sativa, Indica, CBD). 
*   **Style:** Subtle, desaturated pastel backgrounds with dark-toned text for contrast. 
*   **Shape:** Pill-shaped with a small 12px font size in all-caps.

### Input Fields
*   **Style:** Minimalist underline or light-cream filled box with 8px radius. 
*   **Focus State:** Border transitions to Forest Green with a very soft Gold outer glow.

### Social Interactions
*   **Icons:** Use thin-stroke (1px or 1.5px) botanical-inspired icons.
*   **States:** Interactive elements should have a gentle "lift" or opacity shift rather than high-contrast color changes.