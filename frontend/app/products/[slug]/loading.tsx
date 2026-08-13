import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailsSkeleton from "@/components/products/ProductDetailsSkeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <ProductDetailsSkeleton />
      <Footer />
    </>
  );
}
