"use client";

import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";

const categories = [
  {
    title: "Grocery",
    image: "/categories/grocery.png",
  },
  {
    title: "Mobiles",
    image: "/categories/mobiles.png",
  },
  {
    title: "Fashion",
    image: "/categories/fashion.png",
  },
  {
    title: "Electronics",
    image: "/categories/electronics.png",
  },
  {
    title: "Home",
    image: "/categories/home.png",
  },
  {
    title: "Appliances",
    image: "/categories/appliances.png",
  },
  {
    title: "Travel",
    image: "/categories/travel.png",
  },
  {
    title: "Beauty",
    image: "/categories/beauty.png",
  },
  {
    title: "Furniture",
    image: "/categories/furniture.png",
  },
  {
    title: "Toys",
    image: "/categories/toys.png",
  },
];

export default function Categories() {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        py: 2,
        boxShadow: 1,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            overflowX: "auto",
            gap: 3,
          }}
        >
          {categories.map((item) => (
            <Box
              key={item.title}
              sx={{
                textAlign: "center",
                cursor: "pointer",
                minWidth: 90,
                transition: ".3s",

                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={70}
                height={70}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {item.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}