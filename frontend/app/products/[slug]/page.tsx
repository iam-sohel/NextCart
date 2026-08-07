import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";
import products from "@/data/products";

import { Container, Typography } from "@mui/material";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ProductDetails({
  params,
}: Props) {
  const { slug } = params;

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    return (
      <>
        <Header />

        <Container sx={{ py: 6 }}>
          <Typography variant="h4">
            Product Not Found
          </Typography>
        </Container>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Pass product to client component */}
        <ProductDetailsClient product={product} />
      </Container>

      <Footer />
    </>
  );
}