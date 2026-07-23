"use client";

import { Grid, Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import products from "@/data/products";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  offer: string;
}

function ProductCard({ image, title, price, offer }: ProductCardProps) {
  return (
    <Card elevation={1}>
      <CardMedia component="img" image={image} alt={title} />
      <CardContent>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" color="text.primary">
          {price}
        </Typography>
        <Typography variant="body2" color="success.main">
          {offer}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ProductGrid() {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid
          key={product.id}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        >
          <ProductCard
            image={product.image}
            title={product.title}
            price={`₹${product.price.toLocaleString()}`}
            offer={`${product.discount}% OFF`}
          />
        </Grid>
      ))}
    </Grid>
  );
}