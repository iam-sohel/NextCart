import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import products from "@/data/products";

import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
} from "@mui/material";

import Image from "next/image";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ProductDetails({
  params,
}: Props) {
  const { slug } = params;

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    return (
      <>
        <Header />

        <Container sx={{ py: 6 }}>
          <Typography variant="h4">
            Product Not Found
          </Typography>
        </Container>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Image
                src={product.image}
                alt={product.title}
                width={400}
                height={400}
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {product.title}
            </Typography>

            <Typography
              variant="h5"
              color="success.main"
              sx={{ mt: 2 }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              {product.description}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              Brand: {product.brand}
            </Typography>

            <Typography>
              Rating: ⭐ {product.rating}
            </Typography>

            <Typography>
              Reviews: {product.reviews}
            </Typography>

            <Typography>
              Stock: {product.stock}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                size="large"
              >
                Add to Cart
              </Button>

              <Button
                variant="outlined"
                size="large"
              >
                Buy Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}