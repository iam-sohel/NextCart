import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClientProductGrid from "@/components/products/ClientProductGrid";

import { Box, Container, Typography, Alert } from "@mui/material";

import categories from "@/data/categories";
import { listProducts, enrichProductListWithDetails } from "@/services/productService";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage(props: PageProps) {
  const { slug } = await props.params;

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const list = await listProducts();

  if (list.source === "error") {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Alert severity="error">
            Failed to load products: {list.message}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  const categoryProducts = list.products.filter(
    (p) =>
      p.categorySlug === slug ||
      p.category?.toLowerCase() === category.title.toLowerCase()
  );

  const enrichedProducts = await enrichProductListWithDetails(
    categoryProducts,
    {
      loadInventory: false,
    },
  );

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {category.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Browse all products in {category.title}.
          </Typography>
        </Box>

        {enrichedProducts.length > 0 ? (
          <ClientProductGrid products={enrichedProducts} />
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              No Products Found
            </Typography>
            <Typography color="text.secondary">
              There are no products in this category at the moment.
            </Typography>
          </Box>
        )}
      </Container>

      <Footer />
    </>
  );
}