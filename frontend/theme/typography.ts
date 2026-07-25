const typography = {
  fontFamily: [
    "Inter",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ].join(","),

  h1: {
    fontSize: "3rem",
    fontWeight: 700,
  },

  h2: {
    fontSize: "2.5rem",
    fontWeight: 700,
  },

  h3: {
    fontSize: "2rem",
    fontWeight: 700,
  },

  h4: {
    fontSize: "1.75rem",
    fontWeight: 700,
  },

  h5: {
    fontSize: "1.5rem",
    fontWeight: 600,
  },

  h6: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },

  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
  },

  subtitle2: {
    fontSize: ".875rem",
    fontWeight: 500,
  },

  body1: {
    fontSize: "1rem",
  },

  body2: {
    fontSize: ".875rem",
  },

  button: {
    textTransform: "none" as const,
    fontWeight: 600,
  },
};

export default typography;