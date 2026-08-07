import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import CategoryBar from "@/components/home/CategoryBar";

import FeaturedProducts from "@/components/home/FeaturedProducts";
import DealsSection from "@/components/home/DealsSection";
import ElectronicsSection from "@/components/home/ElectronicsSection";
import FashionSection from "@/components/home/FashionSection";
import Newsletter from "@/components/home/Newsletter";

import { Box, Container } from "@mui/material";

export default function HomePage() {
  return (
    <>
      <Header />

      <Box sx={{ bgcolor: "#f5f5f5", pb: 4 }}>

        {/* Categories FIRST */}
        <Container maxWidth="xl" sx={{ pt: 3 }}>
          <CategoryBar />
        </Container>

        {/* Banner SECOND */}
        <Hero />

        {/* Remaining Sections */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <FeaturedProducts />
          <DealsSection />
          <ElectronicsSection />
          <FashionSection />
          <Newsletter />
        </Container>

      </Box>

      <Footer />
    </>
  );
}