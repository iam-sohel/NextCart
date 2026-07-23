"use client";

import Image from "next/image";
import { Container, Box } from "@mui/material";

export default function PromoBanner() {
  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 180, md: 250 },
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Image
          src="/banners/promo-banner.jpg"
          alt="Promotion Banner"
          fill
          priority
          style={{
            objectFit: "cover",
          }}
        />
      </Box>
    </Container>
  );
}