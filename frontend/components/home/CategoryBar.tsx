"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Box,
  Card,
  CardActionArea,
  Stack,
  Typography,
} from "@mui/material";

import categories from "@/data/categories";

export default function CategoryBar() {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        px: {
          xs: 1.5,
          sm: 2,
        },
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
        spacing={{
          xs: 1.5,
          sm: 2,
        }}
        sx={{
          minWidth: "max-content",
          justifyContent: {
            xs: "flex-start",
            sm: "space-between",
          },
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <Card
              elevation={0}
              sx={{
                width: {
                  xs: 100,
                  sm: 110,
                },
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
                    py: {
                      xs: 1.5,
                      sm: 2,
                    },
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
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.85rem",
                      },
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
  );
}