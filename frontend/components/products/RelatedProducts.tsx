"use client";

import Link from "next/link";
import Image from "next/image";

import products from "@/data/products";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from "@mui/material";

interface Props {
  category: string;
  currentId: number;
}

export default function RelatedProducts({
  category,
  currentId,
}: Props) {
  const relatedProducts = products
    .filter(
      (product) =>
        product.category === category &&
        product.id !== currentId
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 8 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3 }}
      >
        Related Products
      </Typography>

      <Grid container spacing={3}>
        {relatedProducts.map((product) => (
          <Grid
            key={product.id}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                transition: ".3s",

                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-6px)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={180}
                    height={180}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Typography
                  sx={{ fontWeight: 600 }}
                  gutterBottom
                >
                  {product.title}
                </Typography>

                <Typography
                  color="primary"
                  sx={{ fontWeight: 700, mb: 2 }}
                >
                  ₹{product.price.toLocaleString()}
                </Typography>

                <Button
                  component={Link}
                  href={`/products/${product.slug}`}
                  fullWidth
                  variant="contained"
                >
                  View Product
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}