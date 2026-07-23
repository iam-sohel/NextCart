import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Typography, Box } from "@mui/material";

function ProductGrid() {
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="body1">No products available.</Typography>
    </Box>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
    All Products
  </Typography>

  <ProductGrid />
</Container>

      <Footer />
    </>
  );
}