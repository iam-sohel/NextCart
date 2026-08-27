import { Box } from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/home/CategoryBar";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import DealsSection from "@/components/home/DealsSection";
import ElectronicsSection from "@/components/home/ElectronicsSection";
import FashionSection from "@/components/home/FashionSection";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Header />

      <Box
        sx={{
          bgcolor: "#f5f5f5",
          pb: 4,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Categories */}
        <Box
          sx={{
            pt: 3,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <CategoryBar />
        </Box>

        {/* Banner */}
        <Hero />

        {/* Homepage sections */}
        <FeaturedProducts />
        <DealsSection />
        <ElectronicsSection />
        <FashionSection />
        <Newsletter />
      </Box>

      <Footer />
    </>
  );
}