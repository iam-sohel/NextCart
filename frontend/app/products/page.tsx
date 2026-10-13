import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/products/ProductGrid";

import {
  Box,
  Breadcrumbs,
  Container,
  Link as MuiLink,
  Paper,
  Typography,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";

export default function ProductsPage() {
  return (
    <>
      <Header />

      {/* ============================================================
          PAGE CANVAS
          Warm cream page background consistent with the modernized
          HavLook homepage. ProductGrid itself is left untouched.
          ============================================================ */}
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100%",
          py: { xs: 4, md: 6 },
        }}
      >
        {/* ============================================================
            LAYOUT CONTAINER
            Slightly wider than the homepage content columns on desktop so
            the catalogue reads as a first-class page rather than a narrow
            sub-section, while still keeping comfortable mobile padding.
            ============================================================ */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 2.5, md: 3 } }}>
          {/* ----------------------------------------
              BREADCRUMB
              Home / Products — subtle, responsive, semantic.
              ============================================================ */}
          <Breadcrumbs
            separator="/"
            sx={{
              mb: { xs: 2.5, md: 3 },
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
            aria-label="Breadcrumb"
          >
            <MuiLink
              component="a"
              href="/"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                py: 0.25,
              }}
            >
              Home
            </MuiLink>

            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "text.primary",
                py: 0.25,
              }}
            >
              Products
            </Typography>
          </Breadcrumbs>

          {/* ----------------------------------------
              CATALOGUE HEADER
              Products — matches the homepage section-heading weight without
              importing the non-navigating SectionTitle component.
              ============================================================ */}
          <Box sx={{ mb: { xs: 3, md: 4 }, maxWidth: 720 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "text.primary",
                fontSize: {
                  xs: "1.75rem",
                  sm: "2rem",
                  md: "2.375rem",
                },
                lineHeight: 1.15,
                mb: 1,
              }}
            >
              Products
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                fontSize: {
                  xs: "0.9375rem",
                  sm: "1rem",
                },
                lineHeight: 1.6,
              }}
            >
              Discover products you&apos;ll love.
            </Typography>
          </Box>

{/* ----------------------------------------
              PRODUCT GRID SURFACE WITH TOOLBAR
              Wraps ProductGrid in a white surface card with a polished
              toolbar: catalogue context on the left.
              ============================================================ */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: 1,
                }}
              >
                {/* Catalogue context */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  <CategoryIcon
                    sx={{
                      fontSize: 16,
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    component="span"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    All Products
                  </Typography>
                </Box>
              <ProductGrid />
              </Paper>
        </Container>
      </Box>

      <Footer />
    </>
  );
}