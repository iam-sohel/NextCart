import Header from "@/components/layout/Header";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import FlashSale from "@/components/home/FlashSale";
import DealsSection from "@/components/home/DealsSection";
import ElectronicsSection from "@/components/home/ElectronicsSection";
import FashionSection from "@/components/home/FashionSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Categories />
      <Hero />
      <FlashSale />
      <DealsSection />
      <ElectronicsSection />
      <FashionSection />
      <Footer />
    </>
  );
}