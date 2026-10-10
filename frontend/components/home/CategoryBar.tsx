"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Card, Stack, Typography } from "@mui/material";

import categories from "@/data/categories";

/**
 * NextCart customer storefront category navigation.
 * Uses the existing category data and route structure.
 */
export default function CategoryBar() {
  return (
    <Box
      component="nav"
      aria-label="Shop by category"
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, sm: 3 },
        px: { xs: 1.25, sm: 2.5 },
        py: { xs: 1.25, sm: 2 },
        boxShadow: { xs: 0, sm: 1 },
        overflowX: "auto",
        overflowY: "hidden",
        maxWidth: "100%",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin",
        scrollbarColor: "transparent transparent",
        "&::-webkit-scrollbar": {
          height: 4,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "transparent",
          borderRadius: 4,
        },
        "&:hover::-webkit-scrollbar-thumb": {
          backgroundColor: "action.disabled",
        },
        "& .category-link": {
          display: "block",
          flexShrink: 0,
          color: "inherit",
          textDecoration: "none",
          borderRadius: 3,
        },
        "& .category-link:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 3,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          width: "max-content",
          minWidth: "100%",
          justifyContent: { xs: "flex-start", sm: "space-between" },
          pb: 0.5,
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="category-link"
            aria-label={`Shop ${category.title}`}
          >
            <Card
              elevation={0}
              sx={{
                width: { xs: 82, sm: 108 },
                height: "100%",
                borderRadius: 3,
                bgcolor: "transparent",
                transition: "transform 180ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                },
                "&:hover .category-tile, &:focus-visible .category-tile": {
                  borderColor: "primary.main",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:hover": {
                    transform: "none",
                  },
                },
              }}
            >
              <Stack
                spacing={1}
                sx={{
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  py: { xs: 1, sm: 1.25 },
                  px: 0.5,
                }}
              >
                <Stack
                  className="category-tile"
                  sx={{
                    width: { xs: 54, sm: 62 },
                    height: { xs: 54, sm: 62 },
                    flexShrink: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: "grey.100",
                    border: "1px solid",
                    borderColor: "transparent",
                    color: "text.primary",
                    transition: "background-color 180ms ease, border-color 180ms ease",
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  }}
                >
                  <Image
                    src={category.image}
                    alt=""
                    width={40}
                    height={40}
                    sizes="40px"
                    style={{ objectFit: "contain" }}
                  />
                </Stack>

                <Typography
                  component="span"
                  sx={{
                    width: "100%",
                    fontWeight: 600,
                    color: "text.primary",
                    textAlign: "center",
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}
                >
                  {category.title}
                </Typography>
              </Stack>
            </Card>
          </Link>
        ))}
      </Stack>
    </Box>
  );
}
