import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/products/ProductGrid";

import {
  Box,
  Breadcrumbs,
  Container,
  Link as MuiLink,
  Paper,
  Select,
  FormControl,
  MenuItem,
  Typography,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import SortIcon from "@mui/icons-material/Sort";
export default function ProductsPage() {
  return (
    <>
      <Header />

      {/* ============================================================
          PAGE CANVAS
          Clean premium catalogue background consistent with the modernized
          NextCart homepage. ProductGrid itself is left untouched.
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
          Responsive horizontal padding so narrow mobile widths stay clean.
          ============================================================ */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 2.5, md: 3 } }}>
          {/* ----------------------------------------
                  BREADCRUMB
                  Home / Products — semantic, no overflow on mobile.
                  ---------------------------------------- */}
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
                  Products / Discover products you'll love.
                  ---------------------------------------- */}
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
                  CATALOGUE SURFACE + TOOLBAR
                  The grid stays exactly as ProductGrid renders it.
                  The Sort control is visual/placeholder only — no fake sorting.
                  ---------------------------------------- */}
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
            {/* Toolbar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
                px: { xs: 2.5, sm: 3, md: 3.5 },
                py: { xs: 2, sm: 2.25, md: 2.5 },
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Left — catalogue context */}
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

              {/* Right — presentational Sort control */}
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: 130, sm: 140 },
                  flexShrink: 0,
                }}
              >
                <Select
                  value=""
                  displayEmpty
                  aria-label="Sort products"
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    minHeight: 36,
                    "& .MuiSelect-select": {
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      "&$disabled": {
                        color: "text.secondary",
                      },
                    },
                    "&:hover .MuiSelect-select": {
                      bgcolor: "action.hover",
                    },
                    "&.Mui-focused .MuiSelect-select": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <SortIcon
                        sx={{
                          fontSize: 16,
                          color: "text.secondary",
                        }}
                      />
                      Sort by
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Product grid — unchanged rendering/data layer */}
            <Box
              sx={{
                px: { xs: 2.5, sm: 3, md: 3.5 },
                pb: { xs: 3.5, sm: 4, md: 5 },
              }}
            >
              <ProductGrid />
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </>
  );
}