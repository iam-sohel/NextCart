"use client";

import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 6,
        bgcolor: "#172337",
        color: "#fff",
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography>
        © 2026 NextCart. All Rights Reserved.
      </Typography>
    </Box>
  );
}