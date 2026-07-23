"use client";

import { Box, Button, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface Props {
  title: string;
}

export default function SectionTitle({ title }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: 700 }}
      >
        {title}
      </Typography>

      <Button
        variant="contained"
        endIcon={<ArrowForwardIosIcon />}
        sx={{
          borderRadius: 2,
          textTransform: "none",
        }}
      >
        View All
      </Button>
    </Box>
  );
}