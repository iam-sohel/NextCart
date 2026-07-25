import { createTheme, type ThemeOptions } from "@mui/material/styles";

import palette from "./palette";
import typography from "./typography";
import spacing from "./spacing";
import shadows from "./shadows";

const resolvedShadows = [...shadows].slice(0, 25) as string[];

while (resolvedShadows.length < 25) {
  resolvedShadows.push("0px 12px 30px rgba(0,0,0,.12)");
}

const theme = createTheme({
  palette,
  typography,
  spacing,

  shadows: resolvedShadows as ThemeOptions["shadows"],

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;