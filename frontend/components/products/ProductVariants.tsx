"use client";

import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

const colors = [
  "Titanium Black",
  "Silver",
  "Blue",
];

const storage = [
  "128 GB",
  "256 GB",
  "512 GB",
];

export default function ProductVariants() {
  return (
    <Box mt={4}>
      <Typography
        variant="h6"
        fontWeight={700}
      >
        Choose Variant
      </Typography>

      <Typography mt={3} mb={1}>
        Color
      </Typography>

      <Stack direction="row" spacing={2}>
        {colors.map((item) => (
          <Chip
            key={item}
            label={item}
            clickable
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>

      <Typography mt={3} mb={1}>
        Storage
      </Typography>

      <Stack direction="row" spacing={2}>
        {storage.map((item) => (
          <Chip
            key={item}
            label={item}
            clickable
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}