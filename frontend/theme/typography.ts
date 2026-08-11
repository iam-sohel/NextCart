/**
 * NEXTCART TYPOGRAPHY
 *
 * Compact commerce type scale — closer to Amazon / Flipkart density than to
 * a SaaS marketing landing. We start smaller than MUI defaults and step up in
 * smaller increments so the page reads information-dense, not spacious.
 *
 * Hierarchy (rem → px at default 16px root):
 *   h1       1.8   28.8    — page hero / large section title
 *   h2       1.4   22.4    — section heading
 *   h3       1.15  18.4    — sub-section / card title
 *   h4       1.0   16      — list heading / row title
 *   h5       0.9375 15     — small heading
 *   h6       0.875 14      — micro heading
 *   body1    0.875 14      — default body text
 *   body2    0.8125 13     — secondary body text
 *   caption  0.75  12      — meta / labels
 *   button   0.8125 13     — button labels
 *
 * Font: Inter (already loaded by app/layout.tsx via next/font).
 *   The CSS variable `--font-inter` carries the optimised font-family string
 *   so Next.js can preload it. We fall back to the system stack if Inter is
 *   not yet resolved during SSR.
 *
 * letterSpacing uses MUI's `em` units so the scale stays proportional.
 */

const typography = {
  fontFamily:
    'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  h1: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "1.8rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },

  h2: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "1.4rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },

  h3: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "1.15rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },

  h4: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.35,
  },

  h5: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },

  h6: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.45,
  },

  subtitle1: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },

  subtitle2: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: 1.5,
  },

  body1: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },

  body2: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.8125rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },

  caption: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.02em",
    lineHeight: 1.4,
  },

  overline: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    lineHeight: 1.5,
    textTransform: "uppercase" as const,
  },

  button: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    lineHeight: 1.4,
    textTransform: "none" as const,
  },
};

export default typography;