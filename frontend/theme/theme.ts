"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2874F0",
    },
    secondary: {
      main: "#FB641B",
    },
    background: {
      default: "#F1F3F6",
    },
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",

    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },

    h2: {
      fontSize: "2rem",
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    body1: {
      fontSize: "1rem",
    },

    body2: {
      fontSize: "0.9rem",
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },
});

export default theme;