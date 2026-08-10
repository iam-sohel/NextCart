/**
 * NEXTCART SHADOWS
 *
 * MUI requires exactly 25 shadow entries (index 0–24). Index 0 is reserved
 * for "none" and is never used as an elevation. We build 9 unique shadows
 * covering our surface needs and define theme/index.ts to pad to 25 if needed.
 *
 * Design intent:
 *   - Subtle, low-opacity, warm-tinted shadows.
 *   - Avoid the oversized "0 14px 40px" marketing-style shadows.
 *   - Cards and panels feel paper-thin and grounded, not floating billboards.
 *
 * Shadow index map (used by MUI elevation props on Paper & Card):
 *   0   none
 *   1   hairline      — AppBar, sticky headers
 *   2   card          — default cards
 *   3   raised        — hover card
 *   4   popover       — dropdowns, menus
 *   5   dialog        — modal dialogs
 *   6   drawer        — side drawer
 *   7   tooltip       — tooltips
 *   8   hero          — hero banner (still restrained, not huge)
 *   9–24 pantomime    — reserved / rarely used
 *
 * Tint values are derived from the page's dark text colour (#1F1B17) so
 * shadows look native to the cream background.
 */

const shadows = [
  "none", // 0 — never raised

  "0px 1px 2px rgba(31, 27, 23, 0.06)", // 1 — hairline
  "0px 1px 3px rgba(31, 27, 23, 0.08), 0px 1px 2px rgba(31, 27, 23, 0.04)", // 2 — card
  "0px 2px 6px rgba(31, 27, 23, 0.08), 0px 1px 2px rgba(31, 27, 23, 0.04)", // 3 — raised
  "0px 4px 12px rgba(31, 27, 23, 0.10), 0px 2px 4px rgba(31, 27, 23, 0.05)", // 4 — popover
  "0px 8px 20px rgba(31, 27, 23, 0.12), 0px 2px 6px rgba(31, 27, 23, 0.06)", // 5 — dialog
  "0px 12px 24px rgba(31, 27, 23, 0.14), 0px 4px 8px rgba(31, 27, 23, 0.06)", // 6 — drawer
  "0px 4px 8px rgba(31, 27, 23, 0.10)", // 7 — tooltip
  "0px 16px 32px rgba(31, 27, 23, 0.10), 0px 4px 8px rgba(31, 27, 23, 0.05)", // 8 — hero
];

export default shadows;