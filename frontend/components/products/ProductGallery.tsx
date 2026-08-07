"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Box,
  Stack,
  Paper,
} from "@mui/material";

interface Props {
  product: any;
}

export default function ProductGallery({
  product,
}: Props) {
  const [selected, setSelected] = useState(
    product.images?.[0] || product.image
  );

  return (
    <Box>
      {/* Main Image */}

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 520,
        }}
      >
        <Image
          src={selected}
          alt={product.title}
          width={420}
          height={420}
          style={{
            objectFit: "contain",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </Paper>

      {/* Thumbnails */}

      <Stack
        direction="row"
        spacing={2}
        mt={2}
      >
        {(product.images || [product.image]).map(
          (img: string) => (
            <Paper
              key={img}
              elevation={selected === img ? 5 : 1}
              onClick={() => setSelected(img)}
              sx={{
                cursor: "pointer",
                p: 1,
                border:
                  selected === img
                    ? "2px solid #2874F0"
                    : "1px solid #ddd",
                borderRadius: 2,
              }}
            >
              <Image
                src={img}
                alt={product.title}
                width={80}
                height={80}
                style={{
                  objectFit: "contain",
                }}
              />
            </Paper>
          )
        )}
      </Stack>
    </Box>
  );
}