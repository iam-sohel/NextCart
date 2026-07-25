import {
  Container,
  Typography,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductSearch from "./ProductSearch";
import ProductGrid from "@/components/products/ProductGrid";

export default function ProductsPage() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          All Products
        </Typography>

        <ProductSearch />
        <ProductGrid />
      </Container>

      <Footer />
    </>
  );
}