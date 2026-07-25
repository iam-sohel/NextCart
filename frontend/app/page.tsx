import ElectronicsSection from "@/components/home/ElectronicsSection";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import CategoryBar from "@/components/home/CategoryBar";
import HeroSlider from "@/components/home/HeroSlider";
import FlashSale from "@/components/home/FlashSale";
import FeaturedProducts from "@/components/home/FeaturedProducts";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ProductSearch from "@/components/products/ProductSearch";
import ProductGrid from "@/components/products/ProductGrid";

export default function HomePage() {
  return (
    <>
<Header />

<Container maxWidth="xl" sx={{ mt: 2 }}>
  <CategoryBar />
  <HeroSlider />
</Container>

<FlashSale />

<FeaturedProducts /><FlashSale />

<FeaturedProducts />

<ElectronicsSection />

<Container maxWidth="xl" sx={{ py: 4 }}>
  ...
</Container>

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

  <ProductSearch />

  <ProductGrid />
</Container>

<Footer />
    </>
  );
}