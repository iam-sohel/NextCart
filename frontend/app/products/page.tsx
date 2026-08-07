import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/products/ProductGrid";

import { Box, Container, Typography } from "@mui/material";

export default function ProductsPage() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Our Products
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Browse all available products in NextCart.
          </Typography>
        </Box>

        <ProductGrid />
      </Container>

      <Footer />
    </>
  );
}