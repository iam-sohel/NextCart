"use client";

import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 6,
        bgcolor: "secondary.dark",
        color: "secondary.contrastText",
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography>
        © 2026 HavLook. All Rights Reserved.
      </Typography>
    </Box>
  );
}