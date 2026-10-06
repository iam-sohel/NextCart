"use client";

import { createTheme, type ThemeOptions } from "@mui/material/styles";

import palette from "./palette";
import typography from "./typography";
import spacing from "./spacing";
import shadows from "./shadows";

/**
 * HAVLOOK MUI THEME
 *
 * This file is the assembler. It pulls in the four geometry primitives
 * (palette, typography, spacing, shadows) and adds:
 *   - shape (border radius)
 *   - component overrides (MuiButton, MuiCard, â€¦)
 *
 * Why a single theme?
 *   - One place to change the entire app's look-and-feel.
 *   - Components consume tokens via sx={{ color: "primary.main" }} etc.
 *   - We never duplicate colours, sizes, or radii in component code.
 *
 * Component overrides are layered on top of MUI's defaults. They are
 * INTENTIONALLY conservative â€” we only override the things that consistently
 * look wrong with MUI defaults on a cream commerce canvas. Anything we don't
 * override keeps MUI's accessible, well-tested default.
 *
 * MUI shadow contract: 25 entries (index 0â€“24). We have 9 unique values, so
 * theme/index.ts pads the rest with our card shadow so elevation 3, 4, â€¦, 24
 * still feel native instead of falling back to MUI's dark default.
 */

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shadows: pad to 25 with our card shadow so all elevations feel native
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiButton
    //
    // The workhorse component. Most commerce actions go through here:
    //   - "Add to Cart", "Buy Now", "Login", "Apply Coupon", paginationâ€¦
    //
    // We keep:
    //   - radius 6px (matches shape.borderRadius)
    //   - no uppercase (commerce buttons read better as Title Case)
    //   - tight padding (commerce density)
    //   - subtle hover lift on contained buttons
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiCard
    //
    // Product cards, deal cards, info panels. We want a clean white surface
    // sitting on the cream canvas with a hairline border instead of a heavy
    // shadow. This is the cornerstone of the Amazon/Flipkart feel.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiPaper
    //
    // Generic surface used by MANY MUI internals (Dialog, Drawer, Menu,
    // Popover, Snackbar, Accordionâ€¦). We deliberately do NOT add a global
    // border â€” a forced border on Paper can clip children inside menus
    // and dialogs and break elevation stacking. If a Paper needs a border
    // it can opt in via variant="outlined" or local sx.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiTextField / MuiOutlinedInput
    //
    // Used by the search bar, login form, checkout, filters. Compact
    // height, modest radius, orange focus ring instead of the heavy
    // default MUI blue.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      color: palette.text.primary,

      "& fieldset": {
        borderColor: palette.divider,
      },

      "&:hover fieldset": {
        borderColor: palette.grey[500],
      },

      "&.Mui-focused fieldset": {
        borderColor: palette.primary.main,
        borderWidth: "2px",
      },

      "&.Mui-error fieldset": {
        borderColor: palette.error.main,
      },

      "&.Mui-disabled": {
        backgroundColor: palette.action.disabledBackground,
      },

      "&.Mui-disabled fieldset": {
        borderColor: palette.action.disabled,
      },
    },

    input: {
      padding: "8px 12px",
      color: palette.text.primary,

      "&::placeholder": {
        color: palette.text.secondary,
        opacity: 1,
      },

      "&:disabled": {
        color: palette.text.disabled,
        WebkitTextFillColor: palette.text.disabled,
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
      color: palette.text.secondary,

      "&.Mui-focused": {
        color: palette.primary.main,
      },

      "&.Mui-error": {
        color: palette.error.main,
      },

      "&.Mui-disabled": {
        color: palette.text.disabled,
      },
    },
  },
},

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: "0.875rem",
          fontWeight: 500,
          color: palette.text.primary,
        },
        message: {
          color: palette.text.primary,
        },
        icon: {
          color: "inherit",
        },
      },
    },


MuiFormHelperText: {
  styleOverrides: {
    root: {
      color: palette.text.secondary,
      fontSize: "0.75rem",

      "&.Mui-error": {
        color: palette.error.main,
        fontWeight: 500,
      },
    },
  },
},


MuiRadio: {
  styleOverrides: {
    root: {
      color: palette.grey[500],

      "&.Mui-checked": {
        color: palette.primary.main,
      },

      "&.Mui-disabled": {
        color: palette.text.disabled,
      },
    },
  },
},

MuiFormControlLabel: {
  styleOverrides: {
    label: {
      color: palette.text.primary,

      "&.Mui-disabled": {
        color: palette.text.disabled,
      },
    },
  },
},

    // MuiChip
    //
    // Tags, badges, capsules. Compact, thin-bordered, semi-rounded.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999, // pill â€” feels right for chips
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiAppBar
    //
    // Sticky header. Light surface, hairline shadow, no heavy elevation.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiBadge
    //
    // Cart count, wishlist count, notification dot. Orange = emphasis.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiTypography
    //
    // Default colour matches text.primary so unclassed Typography inherits
    // our dark warm neutral. We also explicitly map variants to the right
    // HTML tag for accessibility (h1..h6, paragraphs for body).
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiContainer
    //
    // Standard layout container. 24px gutter, 1240px max width for the
    // largest breakpoint â€” tight enough to feel commerce-grade.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiIconButton
    //
    // Wishlist, cart, account icons. Faint orange wash on hover so
    // the entire interactive toolset feels cohesive.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MuiIconButton: {
  styleOverrides: {
    root: {
      color: palette.text.secondary,
      transition: "background-color 0.18s ease, color 0.18s ease",

      "&:hover": {
        backgroundColor: "rgba(241, 90, 41, 0.06)",
        color: palette.primary.main,
      },

      "&.Mui-disabled": {
        color: palette.text.disabled,
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiDivider
    //
    // 1px line biased a touch lighter than the canvas divider so it works
    // inside white surfaces too.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiLink
    //
    // Brand-orange links under-on-canvas. Default underline on hover.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiTooltip
    //
    // Compact, dark surface, small text.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MuiGrid
    //
    // In MUI v9 / Material 6, Grid v2 is the consolidated `Grid` export.
    // The old MuiGrid2 key from earlier drafts is invalid in MUI 9 and will
    // throw a TypeScript error. We don't actually need to override anything
    // here â€” Grid is fine on its own â€” but we declare the key for clarity
    // and to keep the door open for future tweaks.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MuiGrid: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;



