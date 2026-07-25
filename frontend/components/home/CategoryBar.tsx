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
        p: 2,
        mb: 3,
        overflowX: "auto",
        boxShadow: 1,

        "&::-webkit-scrollbar": {
          display: "none",
        },

        scrollbarWidth: "none",
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        sx={{
          minWidth: "max-content",
          justifyContent: "space-between",
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.name.toLowerCase()}`}
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
                transition: ".25s",

                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea>
                <Stack
                  spacing={1.5}
                  alignItems="center"
                
                  sx={{
                    p: 2,
                  }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={60}
                    height={60}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {category.name}
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