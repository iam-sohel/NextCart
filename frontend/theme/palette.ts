/**
 * NEXTCART PALETTE
 *
 * The palette is the single source of truth for every colour used in the app.
 * Components should NEVER hardcode hex values — they should consume these tokens:
 *
 *   sx={{ color: "primary.main" }}
 *   sx={{ bgcolor: "background.paper" }}
 *   sx={{ borderColor: "divider" }}
 *
 * Why?
 *   1. Theme consistency — change a token here, every component updates.
 *   2. Dark-mode readiness — token-driven design can be inverted later.
 *   3. Accessibility — contrastText values are paired with each colour role.
 *
 * Design intent:
 *   Primary (orange) = commerce emphasis: CTAs, focused fields, active states,
 *                       badges, brand highlight.
 *   Secondary (warm dark) = neutral accent for brand mark, badges, dark surfaces.
 *                          It is deliberately NOT orange — orange is reserved
 *                          for action emphasis so it keeps its signal strength.
 *   Background.default = warm cream page.
 *   Background.paper  = pure white surface for cards / panels.
 *   Text is a warm dark (not pure black) to feel softer on cream backgrounds.
 *
 * Reference: docs/PHASE_1_theme.md
 */

const palette = {
  mode: "light" as const,

  primary: {
    main: "#F15A29",       // NextCart orange — primary CTA / focus / commerce emphasis
    light: "#F47850",      // hover / lighter state
    dark: "#C8421B",       // pressed / active state
    contrastText: "#FFFFFF", // text drawn on top of primary fills
  },

  secondary: {
    // Warm dark neutral — used by brand mark, "Bestseller" badge, dark surfaces.
    // Intentionally NOT orange so the primary stays visually loaded.
    main: "#2D2A26",
    light: "#5A514A",
    dark: "#1A1714",
    contrastText: "#FFFFFF",
  },

  success: {
    main: "#16A34A",                       // Conventional commerce green
    light: "rgba(22, 163, 74, 0.12)",      // 12% tint for chip backgrounds
    contrastText: "#FFFFFF",
  },

  error: {
    main: "#DC2626",                       // Conventional error red
    light: "rgba(220, 38, 38, 0.12)",
    contrastText: "#FFFFFF",
  },

  warning: {
    main: "#F59E0B",                       // Commerce amber
    light: "rgba(245, 158, 11, 0.12)",
    contrastText: "#1F1B17",
  },

  info: {
    main: "#0EA5E9",
    light: "rgba(14, 165, 233, 0.12)",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#F4EFE6", // Warm cream — page canvas
    paper: "#FFFFFF",   // White — surfaces (cards, panels, app bar)
  },

  text: {
    primary: "#1F1B17",   // Warm dark — softer than pure black on cream
    secondary: "#6B6259", // Muted warm brown
    disabled: "rgba(31, 27, 23, 0.38)",
  },

  divider: "#E2D9CC", // Subtle warm neutral — sits gently on cream

  action: {
    active: "#1F1B17",
    hover: "rgba(241, 90, 41, 0.06)",   // Faint orange wash for interactive hovers
    selected: "rgba(241, 90, 41, 0.10)", // Faint orange wash for selected rows
    disabled: "rgba(31, 27, 23, 0.26)",
    disabledBackground: "rgba(31, 27, 23, 0.06)",
    focus: "rgba(241, 90, 41, 0.18)",
  },

  // Grey ramp — used by MUI internals (Ripple, Slider, Switch, Skeleton, etc.)
  // Kept warm so it harmonises with the cream canvas.
  grey: {
    50: "#FAF8F4",
    100: "#F4EFE6",
    200: "#E8E0D2",
    300: "#D6CCB9",
    400: "#A89F90",
    500: "#6B6259",
    600: "#524940",
    700: "#3D3631",
    800: "#2A2522",
    900: "#1A1714",
  },
};

export default palette;