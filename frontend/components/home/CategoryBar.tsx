"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Container,
  Box,
  Card,
  CardActionArea,
  Stack,
  Typography,
} from "@mui/material";

import categories from "@/data/categories";

export default function CategoryBar() {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 3,
          px: 2,
          py: 2,
          boxShadow: 1,
          overflowX: "auto",

          "&::-webkit-scrollbar": {
            display: "none",
          },

          scrollbarWidth: "none",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: "max-content",
            justifyContent: "space-between",
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Card
                elevation={0}
                sx={{
                  width: 110,
                  borderRadius: 3,
                  backgroundColor: "transparent",
                  transition: "0.25s",

                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea>
                  <Stack
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      py: 2,
                      px: 1,
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={60}
                      height={60}
                      style={{
                        objectFit: "contain",
                      }}
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#212121",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {category.title}
                    </Typography>
                  </Stack>
                </CardActionArea>
              </Card>
            </Link>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}