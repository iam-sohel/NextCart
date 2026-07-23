import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductSearch from "@/components/products/ProductSearch";
import ProductGrid from "@/components/products/ProductGrid";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function ProductsPage() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 3,
          }}
        >
          All Products
        </Typography>

        <ProductSearch />

        <ProductGrid />
      </Container>

      <Footer />
    </>
  );
}