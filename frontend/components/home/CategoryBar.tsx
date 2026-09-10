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

/**
 * NEXTCART — Category strip.
 *
 * Presentation layer only: renders the existing backend-driven category data
 * as a premium horizontal navigation strip. White surface card with circular
 * image tiles, orange hover accents, and hidden-scrollbar mobile scrolling
 * (no document-level overflow).
 */
export default function CategoryBar() {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        px: { xs: 1.25, sm: 2.5 },
        py: { xs: 1.5, sm: 2 },
        boxShadow: 1,
        overflowX: "auto",
        // Contain the scroll so the strip never widens the document.
        maxWidth: "100%",

        "&::-webkit-scrollbar": {
          display: "none",
        },

        scrollbarWidth: "none",
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1.5, sm: 2 }}
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
                width: { xs: 88, sm: 112 },
                borderRadius: 3,
                backgroundColor: "transparent",
                transition: "transform 0.2s ease",

                "&:hover": {
                  transform: "translateY(-4px)",

                  "& .category-tile": {
                    borderColor: "primary.main",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <CardActionArea
                sx={{
                  borderRadius: 3,
                }}
              >
                <Stack
                  spacing={1.25}
                  sx={{
                    alignItems: "center",
                    py: { xs: 1, sm: 1.5 },
                    px: 1,
                  }}
                >
                  <Stack
                    className="category-tile"
                    sx={{
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      bgcolor: "grey.100",
                      border: "1px solid",
                      borderColor: "transparent",
                      color: "text.primary",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={40}
                      height={40}
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      textAlign: "center",
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                      lineHeight: 1.25,
                      letterSpacing: "-0.01em",
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