"use client";

import { createTheme, type ThemeOptions } from "@mui/material/styles";

import palette from "./palette";
import typography from "./typography";
import spacing from "./spacing";
import shadows from "./shadows";

/**
 * NEXTCART MUI THEME
 *
 * This file is the assembler. It pulls in the four geometry primitives
 * (palette, typography, spacing, shadows) and adds:
 *   - shape (border radius)
 *   - component overrides (MuiButton, MuiCard, …)
 *
 * Why a single theme?
 *   - One place to change the entire app's look-and-feel.
 *   - Components consume tokens via sx={{ color: "primary.main" }} etc.
 *   - We never duplicate colours, sizes, or radii in component code.
 *
 * Component overrides are layered on top of MUI's defaults. They are
 * INTENTIONALLY conservative — we only override the things that consistently
 * look wrong with MUI defaults on a cream commerce canvas. Anything we don't
 * override keeps MUI's accessible, well-tested default.
 *
 * MUI shadow contract: 25 entries (index 0–24). We have 9 unique values, so
 * theme/index.ts pads the rest with our card shadow so elevation 3, 4, …, 24
 * still feel native instead of falling back to MUI's dark default.
 */

// ─────────────────────────────────────────────────────────────
// Shadows: pad to 25 with our card shadow so all elevations feel native
// ─────────────────────────────────────────────────────────────
const PAD_SHADOW = "0px 1px 3px rgba(31, 27, 23, 0.08), 0px 1px 2px rgba(31, 27, 23, 0.04)";

const resolvedShadows: string[] = [...shadows];

while (resolvedShadows.length < 25) {
  resolvedShadows.push(PAD_SHADOW);
}

const theme = createTheme({
  palette,
  typography,
  spacing,

  shadows: resolvedShadows as ThemeOptions["shadows"],

  // Compact commerce radius. MUI uses this as the default for every radius
  // utility (borderRadius, theme.shape.borderRadius). Component overrides
  // can still pick a smaller / larger value per slot.
  shape: {
    borderRadius: 6,
  },

  components: {
    // ─────────────────────────────────────────────────────────────
    // MuiButton
    //
    // The workhorse component. Most commerce actions go through here:
    //   - "Add to Cart", "Buy Now", "Login", "Apply Coupon", pagination…
    //
    // We keep:
    //   - radius 6px (matches shape.borderRadius)
    //   - no uppercase (commerce buttons read better as Title Case)
    //   - tight padding (commerce density)
    //   - subtle hover lift on contained buttons
    // ─────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true, // We manage elevation via shadow tokens instead
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: "8px 16px",
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.18s ease",
          minHeight: 36,
        },
        contained: {
          boxShadow: "0px 1px 2px rgba(31, 27, 23, 0.06)",
          "&:hover": {
            boxShadow: "0px 2px 6px rgba(31, 27, 23, 0.10)",
          },
          "&:active": {
            boxShadow: "0px 1px 2px rgba(31, 27, 23, 0.06)",
          },
        },
        outlined: {
          borderColor: palette.divider,
          color: palette.text.primary,
          "&:hover": {
            backgroundColor: "rgba(241, 90, 41, 0.04)",
            borderColor: palette.primary.main,
          },
        },
        text: {
          color: palette.primary.main,
          "&:hover": {
            backgroundColor: "rgba(241, 90, 41, 0.08)",
          },
        },
        sizeSmall: {
          padding: "5px 12px",
          minHeight: 30,
        },
        sizeLarge: {
          padding: "10px 22px",
          minHeight: 42,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiCard
    //
    // Product cards, deal cards, info panels. We want a clean white surface
    // sitting on the cream canvas with a hairline border instead of a heavy
    // shadow. This is the cornerstone of the Amazon/Flipkart feel.
    // ─────────────────────────────────────────────────────────────
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.paper,
          transition: "all 0.18s ease",
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiPaper
    //
    // Generic surface used by MANY MUI internals (Dialog, Drawer, Menu,
    // Popover, Snackbar, Accordion…). We deliberately do NOT add a global
    // border — a forced border on Paper can clip children inside menus
    // and dialogs and break elevation stacking. If a Paper needs a border
    // it can opt in via variant="outlined" or local sx.
    // ─────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: palette.background.paper,
        },
        outlined: {
          border: `1px solid ${palette.divider}`,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiTextField / MuiOutlinedInput
    //
    // Used by the search bar, login form, checkout, filters. Compact
    // height, modest radius, orange focus ring instead of the heavy
    // default MUI blue.
    // ─────────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: palette.background.paper,
          fontSize: "0.875rem",
          "& fieldset": {
            borderColor: palette.divider,
          },
          "&:hover fieldset": {
            borderColor: "rgba(31, 27, 23, 0.32)",
          },
          "&.Mui-focused fieldset": {
            borderColor: palette.primary.main,
            borderWidth: "1px",
          },
        },
        input: {
          padding: "8px 12px",
          "&::placeholder": {
            color: palette.text.secondary,
            opacity: 1,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
        },
        input: {
          "&::placeholder": {
            color: palette.text.secondary,
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiChip
    //
    // Tags, badges, capsules. Compact, thin-bordered, semi-rounded.
    // ─────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999, // pill — feels right for chips
          fontSize: "0.75rem",
          fontWeight: 600,
          height: 24,
        },
        filled: {
          backgroundColor: palette.grey[100],
          color: palette.text.primary,
        },
        outlined: {
          borderColor: palette.divider,
          color: palette.text.primary,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiAppBar
    //
    // Sticky header. Light surface, hairline shadow, no heavy elevation.
    // ─────────────────────────────────────────────────────────────
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
          boxShadow: "0px 1px 2px rgba(31, 27, 23, 0.04)",
          borderBottom: `1px solid ${palette.divider}`,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiBadge
    //
    // Cart count, wishlist count, notification dot. Orange = emphasis.
    // ─────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          fontWeight: 700,
          fontSize: "0.65rem",
          minWidth: 18,
          height: 18,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiTypography
    //
    // Default colour matches text.primary so unclassed Typography inherits
    // our dark warm neutral. We also explicitly map variants to the right
    // HTML tag for accessibility (h1..h6, paragraphs for body).
    // ─────────────────────────────────────────────────────────────
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "h3",
          h4: "h4",
          h5: "h5",
          h6: "h6",
          subtitle1: "div",
          subtitle2: "div",
          body1: "p",
          body2: "p",
        },
      },
      styleOverrides: {
        root: {
          color: palette.text.primary,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiContainer
    //
    // Standard layout container. 24px gutter, 1240px max width for the
    // largest breakpoint — tight enough to feel commerce-grade.
    // ─────────────────────────────────────────────────────────────
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
        },
        maxWidthLg: {
          maxWidth: 1240,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiIconButton
    //
    // Wishlist, cart, account icons. Faint orange wash on hover so
    // the entire interactive toolset feels cohesive.
    // ─────────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.18s ease",
          "&:hover": {
            backgroundColor: "rgba(241, 90, 41, 0.06)",
          },
        },
        sizeMedium: {
          padding: 8,
        },
        sizeSmall: {
          padding: 6,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiDivider
    //
    // 1px line biased a touch lighter than the canvas divider so it works
    // inside white surfaces too.
    // ─────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiLink
    //
    // Brand-orange links under-on-canvas. Default underline on hover.
    // ─────────────────────────────────────────────────────────────
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
      styleOverrides: {
        root: {
          color: palette.primary.main,
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiTooltip
    //
    // Compact, dark surface, small text.
    // ─────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.grey[800],
          color: "#FFFFFF",
          fontSize: "0.75rem",
          borderRadius: 4,
          padding: "6px 8px",
        },
        arrow: {
          color: palette.grey[800],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────
    // MuiGrid
    //
    // In MUI v9 / Material 6, Grid v2 is the consolidated `Grid` export.
    // The old MuiGrid2 key from earlier drafts is invalid in MUI 9 and will
    // throw a TypeScript error. We don't actually need to override anything
    // here — Grid is fine on its own — but we declare the key for clarity
    // and to keep the door open for future tweaks.
    // ─────────────────────────────────────────────────────────────
    MuiGrid: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;