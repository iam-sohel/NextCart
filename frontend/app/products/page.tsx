import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ProductGrid from "../../components/products/ProductGrid";

import { Container, Typography } from "@mui/material";

export default function ProductsPage() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
          }}
        >
          All Products
        </Typography>

        <ProductGrid />
      </Container>

      <Footer />
    </>
  );
}