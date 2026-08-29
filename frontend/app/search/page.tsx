"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Checkbox,
  Slider,
  MenuItem,
  Select,
  Button,
  Pagination,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import useSearchStore from "@/store/searchStore";


export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const {
  catalog,
  results,
  totalResults,
  totalPages,
  currentPage,
  selectedCategory,
  selectedBrand,
  priceRange,
  sortBy,
  loading,
  error,
  search,
  setCategory,
  setBrand,
  setPriceRange,
  setSortBy,
  setPage,
  clearFilters,
} = useSearchStore();

  // Initialize search when page loads or query changes
  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  // Get unique categories and brands for filters
 const categories = [
  ...new Set(
    catalog.map((product) => product.category),
  ),
];

const brands = [
  ...new Set(
    catalog.map((product) => product.brand),
  ),
];
  // Paginate results
  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {query ? `Search Results for "${query}"` : "Search Products"}
          </Typography>
          <Typography color="text.secondary">
            {totalResults} products found
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Sidebar - Filters */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                {/* Clear Filters Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  sx={{ mb: 2 }}
                >
                  Clear All Filters
                </Button>

                {/* Category Filter */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, mt: 2 }}
                >
                  Category
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={selectedCategory === category}
                          onChange={(e) =>
                            setCategory(e.target.checked ? category : null)
                          }
                        />
                      }
                      label={category}
                    />
                  ))}
                </Box>

                {/* Brand Filter */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, mt: 3 }}
                >
                  Brand
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {brands.slice(0, 5).map((brand) => (
                    <FormControlLabel
                      key={brand}
                      control={
                        <Checkbox
                          checked={selectedBrand === brand}
                          onChange={(e) =>
                            setBrand(e.target.checked ? brand : null)
                          }
                        />
                      }
                      label={brand}
                    />
                  ))}
                </Box>

                {/* Price Range Filter */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, mt: 3 }}
                >
                  Price Range
                </Typography>
                <Slider
                  value={[priceRange.min, priceRange.max]}
                  onChange={(e, newValue) => {
                    const [min, max] = newValue as number[];
                    setPriceRange(min, max);
                  }}
                  min={0}
                  max={100000}
                  step={1000}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">
                    ₹{priceRange.min.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    ₹{priceRange.max.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content - Results */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Sorting */}
            {totalResults > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px solid #eee",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalResults)}{" "}
                  of {totalResults} results
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Results Grid */}
            {loading ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Searching...
                </Typography>
                <Typography color="text.secondary">
                  Fetching the latest results from our catalogue.
                </Typography>
              </Box>
            ) : error ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Search is temporarily unavailable
                </Typography>
                <Typography color="text.secondary">
                  {error}
                </Typography>
              </Box>
            ) : paginatedResults.length > 0 ? (
              <>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {paginatedResults.map((product) => (
                    <Grid size={{ xs: 6, sm: 6, md: 4 }} key={product.id}>
                      <ProductCard
                        id={product.id}
                        slug={product.slug}
                        image={product.image}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        offer={searchPageOffer(product)}
                        rating={product.rating}
                        brand={product.brand}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
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
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}

/**
 * Compute the offer chip text for a search result. Returns "Best Price"
 * when there is no discounted original price to compare against.
 */
function searchPageOffer(product: { price: number; originalPrice?: number }):
  string {
  if (
    typeof product.originalPrice !== "number" ||
    product.originalPrice <= product.price
  ) {
    return "Best Price";
  }
  const pct = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  return `${pct}% off`;
}