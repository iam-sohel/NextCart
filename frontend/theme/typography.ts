const typography = {
  fontFamily: "var(--font-inter), Inter, Roboto, Helvetica, Arial, sans-serif",

  h1: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
    fontSize: "3rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  h2: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
    fontSize: "2.5rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },

  h3: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
    fontSize: "2rem",
    fontWeight: 700,
  },

  h4: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
    fontSize: "1.75rem",
    fontWeight: 700,
  },

  h5: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
  },

  h6: {
    fontFamily: "var(--font-sora), Sora, sans-serif",
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
    letterSpacing: "0.02em",
  },

  body1: {
    fontSize: "1rem",
  },

  body2: {
    fontSize: ".875rem",
  },

  caption: {
    letterSpacing: "0.03em",
  },

  button: {
    textTransform: "none" as const,
    fontWeight: 600,
  },
};

export default typography;