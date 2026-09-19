"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Link as MuiLink,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Slider,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import TuneIcon from "@mui/icons-material/Tune";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import useSearchStore from "@/store/searchStore";
import { formatCount } from "@/utils/formatAmount";
import { formatPrice } from "@/utils/formatPrice";

/**
 * NEXTCART — Search results page.
 *
 * Presentation layer for the search module. All state, filtering, sorting,
 * pagination and data fetching live in the existing Zustand store
 * (store/searchStore.ts) and the authenticated product service. This page
 * only maps store state to the UI and forwards user intent back through
 * the store actions — no business logic lives here.
 *
 * Layout:
 *   - ≥1024px   → two columns: sticky filter surface (left) + results surface.
 *   - 768–1023px → single column, filters inline above results.
 *   - <768px    → filters move into a Drawer, opened from the toolbar.
 *
 * Design language: cream page canvas, breadcrumbs, white surface cards,
 * token-driven colours (theme/palette.ts) — no hardcoded colours.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_STEP = 1000;

/* -------------------------------------------------------------------------- */
/* Page shell                                                                 */
/* -------------------------------------------------------------------------- */

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

  // Mobile (<768px) filter drawer — presentation-only UI state.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const openFilters = () => setFiltersOpen(true);
  const closeFilters = () => setFiltersOpen(false);

  /* ---------------------------------------------------------------------- */
  /* Derived values                                                          */
  /* ---------------------------------------------------------------------- */

  // Unique categories and brands, derived from the catalogue the backend
  // returned — never hardcoded or capped.
  const categories = [...new Set(catalog.map((product) => product.category))];
  const brands = [... new Set(catalog.map((product) => product.brand))];

  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedBrand !== null ||
    priceRange.min !== PRICE_MIN ||
    priceRange.max !== PRICE_MAX;

  /* ---------------------------------------------------------------------- */
  /* Effects                                                                 */
  /* ---------------------------------------------------------------------- */

  // Initialize search when page loads or query changes (existing behaviour).
  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  // Results live in a paginated list — keep each page change at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  /* ---------------------------------------------------------------------- */
  /* Handlers                                                                */
  /* ---------------------------------------------------------------------- */

  const handleRetry = () => {
    search(query);
  };

  const handlePageChange = (_event: unknown, value: number) => {
    setPage(value);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <Header />

      <Box sx={{ bgcolor: "background.default", minHeight: "100%" }}>
        <Container
          maxWidth="xl"
          sx={{ px: { xs: 2, sm: 2.5, md: 3 }, py: { xs: 3, md: 5 } }}
        >
          {/* ---------------------------------------------- */}
          {/* Breadcrumbs — Home / Search                     */}
          {/* ---------------------------------------------- */}
          <Breadcrumbs
            separator="/"
            aria-label="Breadcrumb"
            sx={{
              mb: { xs: 2, md: 2.5 },
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <MuiLink
              component={Link}
              href="/"
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: "0.8125rem", fontWeight: 500 }}
            >
              Home
            </MuiLink>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Search
            </Typography>
          </Breadcrumbs>

          {/* ---------------------------------------------- */}
          {/* Page heading                                     */}
          {/* ---------------------------------------------- */}
          <Box sx={{ mb: { xs: 2.5, md: 3.5 }, maxWidth: 720 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                lineHeight: 1.2,
                mb: 1,
                overflowWrap: "break-word",
              }}
            >
              {query ? (
                <>
                  Results for{" "}
                  <Box component="span" sx={{ color: "primary.main" }}>
                    “{query}”
                  </Box>
                </>
              ) : (
                "Search"
              )}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                fontSize: { xs: "0.9375rem", sm: "1rem" },
                lineHeight: 1.6,
              }}
            >
              {loading
                ? "Finding products for you…"
                : query
                  ? `${formatCount(totalResults)} product${totalResults === 1 ? "" : "s"} found`
                  : "Search by product name, brand or category."}
            </Typography>
          </Box>

          {/* ---------------------------------------------- */}
          {/* Two-zone layout                                  */}
          {/* ---------------------------------------------- */}
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {/* ============ FILTER RAIL (desktop only) ============== */}
            <Grid size={{ md: 12, lg: 3 }} sx={{ display: { xs: "none", md: "block", lg: "block" } }}>
              <FilterPanel
                variant="surface"
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                priceRange={priceRange}
                onCategory={setCategory}
                onBrand={setBrand}
                onPriceRange={setPriceRange}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
                loading={loading}
              />
            </Grid>

            {/* ================ RESULTS COLUMN ====================== */}
            <Grid size={{ xs: 12, md: 12, lg: 9 }}>
              {/* Toolbar surface — count + sort + mobile filters trigger */}
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  mb: { xs: 2.5, md: 3 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    px: { xs: 2, sm: 2.5, md: 3 },
                    py: { xs: 1.5, md: 2 },
                  }}
                >
                  {/* Left: result count — hidden on the narrowest phones */}
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "text.secondary",
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {loading
                      ? "Loading…"
                      : totalResults > 0
                        ? `Showing ${formatCount(startIndex + 1)}–${formatCount(Math.min(endIndex, totalResults))} of ${formatCount(totalResults)}`
                        : "No results yet"}
                  </Typography>

                  {/* Right: sort + (mobile) filters trigger */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      ml: "auto",
                      minWidth: 0,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TuneIcon sx={{ fontSize: 18 }} />}
                      onClick={openFilters}
                      aria-label="Open filters"
                      aria-haspopup="dialog"
                      sx={{
                        display: { xs: "inline-flex", md: "none" },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Filters
                    </Button>

                    {/* Functional sort — same store wiring as before */}
                    <FormControl
                      size="small"
                      sx={{ minWidth: { xs: 150, sm: 170 }, flexShrink: 0 }}
                    >
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort products"
                        startAdornment={
                          <SortIcon
                            sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
                          />
                        }
                        sx={{
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          minHeight: 36,
                          "& .MuiSelect-select": { py: 0.75 },
                        }}
                      >
                        <MenuItem value="relevance">Relevance</MenuItem>
                        <MenuItem value="price-low">Price: Low to High</MenuItem>
                        <MenuItem value="price-high">Price: High to Low</MenuItem>
                        <MenuItem value="rating">Highest Rated</MenuItem>
                        <MenuItem value="newest">Newest</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Active filter chips — removal goes through the store */}
                {hasActiveFilters && !loading && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      px: { xs: 2, sm: 2.5, md: 3 },
                      pb: { xs: 1.5, md: 2 },
                    }}
                  >
                    {selectedCategory && (
                      <Chip
                        size="small"
                        label={selectedCategory}
                        onDelete={() => setCategory(null)}
                        aria-label={`Clear category filter ${selectedCategory}`}
                        sx={activeChipSx}
                      />
                    )}
                    {selectedBrand && (
                      <Chip
                        size="small"
                        label={selectedBrand}
                        onDelete={() => setBrand(null)}
                        aria-label={`Clear brand filter ${selectedBrand}`}
                        sx={activeChipSx}
                      />
                    )}
                    {(priceRange.min !== PRICE_MIN ||
                      priceRange.max !== PRICE_MAX) && (
                      <Chip
                        size="small"
                        label={`${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}`}
                        onDelete={() => setPriceRange(PRICE_MIN, PRICE_MAX)}
                        aria-label="Clear price filter"
                        sx={activeChipSx}
                      />
                    )}
                    <Button
                      size="small"
                      variant="text"
                      onClick={clearFilters}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        textTransform: "none",
                      }}
                    >
                      Clear all
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* ==================== STATES ============================ */}

              {/* Loading — skeleton mirroring the final layout */}
              {loading && <SearchResultsSkeleton />}

              {/* Error — surfaced, icon-led, with a working retry */}
              {!loading && error && (
                <StatePanel
                  icon={<ErrorOutlinedIcon sx={{ fontSize: 40 }} />}
                  title="Search is temporarily unavailable"
                  body={error}
                  actions={
                    <Button
                      variant="contained"
                      disableElevation
                      startIcon={<RestartAltIcon />}
                      onClick={handleRetry}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Try again
                    </Button>
                  }
                />
              )}

              {/* No query — helpful entry point instead of a false "no results" */}
              {!loading && !error && !query && (
                <StatePanel
                  icon={<SearchIcon sx={{ fontSize: 40 }} />}
                  title="Start your search"
                  body="Type what you're looking for in the search bar above — by product name, brand or category."
                  actions={
                    <Button
                      component={Link}
                      href="/products"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Browse all products
                    </Button>
                  }
                />
              )}

              {/* Empty — a real search returned nothing */}
              {!loading &&
                !error &&
                query &&
                paginatedResults.length === 0 && (
                  <StatePanel
                    icon={<SearchOffIcon sx={{ fontSize: 40 }} />}
                    title="No products found"
                    body="We couldn't find anything matching your search. Try different keywords or adjust your filters."
                    actions={
                      hasActiveFilters ? (
                        <Button
                          variant="contained"
                          disableElevation
                          startIcon={<ClearAllIcon />}
                          onClick={clearFilters}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Clear all filters
                        </Button>
                      ) : (
                        <Button
                          component={Link}
                          href="/products"
                          variant="outlined"
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Continue shopping
                        </Button>
                      )
                    }
                  />
                )}

              {/* Results */}
              {!loading &&
                !error &&
                paginatedResults.length > 0 && (
                  <>
                    <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
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

                    {totalPages > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: { xs: 3.5, md: 4.5 },
                        }}
                      >
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          shape="rounded"
                          siblingCount={1}
                          boundaryCount={1}
                          sx={{
                            "& .MuiPaginationItem-root": {
                              fontWeight: 600,
                            },
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile / tablet filter drawer (below lg) */}
      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={closeFilters}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: { width: { xs: "86vw", sm: 320 }, maxWidth: 340 },
          },
        }}
      >
        <DrawerHeader
          onClose={closeFilters}
          resultCount={loading ? null : totalResults}
        />
        <FilterPanel
          variant="drawer"
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          priceRange={priceRange}
          onCategory={setCategory}
          onBrand={setBrand}
          onPriceRange={setPriceRange}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          loading={loading}
        />
      </Drawer>

      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared styling                                                              */
/* -------------------------------------------------------------------------- */

/** Filled orange chip used for removable active-filter pills. */
const activeChipSx = {
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontWeight: 600,
  "& .MuiChip-deleteIcon": {
    color: "rgba(255, 255, 255, 0.75)",
    "&:hover": { color: "#fff" },
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Filter panel (shared by desktop surface + mobile drawer)                    */
/* -------------------------------------------------------------------------- */

interface FilterPanelProps {
  variant: "surface" | "drawer";
  categories: string[];
  brands: string[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  priceRange: { min: number; max: number };
  onCategory: (category: string | null) => void;
  onBrand: (brand: string | null) => void;
  onPriceRange: (min: number, max: number) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  loading: boolean;
}

function FilterPanel({
  variant,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  priceRange,
  onCategory,
  onBrand,
  onPriceRange,
  onClear,
  hasActiveFilters,
  loading,
}: FilterPanelProps) {
  const isDrawer = variant === "drawer";

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: 1,
        // Desktop surface sticks while results scroll; drawer fills height.
        position: isDrawer ? "static" : { lg: "sticky" },
        top: isDrawer ? undefined : 24,
        height: isDrawer ? "100%" : "fit-content",
        maxHeight: isDrawer ? "100%" : undefined,
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 2.75 } }}>
        {/* Header row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <TuneIcon sx={{ fontSize: 18, color: "primary.main" }} />
            Filters
          </Typography>

          {hasActiveFilters && (
            <Button
              size="small"
              variant="text"
              onClick={onClear}
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "none",
              }}
            >
              Clear all
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Loading skeleton inside the filter rail */}
        {loading && (
          <Box>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{ height: 28, mb: 1.5, borderRadius: 1 }}
              />
            ))}
          </Box>
        )}

        {!loading && (
          <>
            {/* -------- Category -------- */}
            <FilterSection title="Category">
              {categories.length === 0 && (
                <Typography
                  sx={{ fontSize: "0.8125rem", color: "text.secondary" }}
                >
                  No categories available
                </Typography>
              )}
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={selectedCategory === category}
                      onChange={(e) =>
                        onCategory(e.target.checked ? category : null)
                      }
                      size="small"
                      sx={{ color: "primary.main", py: 0.5 }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color:
                          selectedCategory === category
                            ? "text.primary"
                            : "text.secondary",
                        fontWeight: selectedCategory === category ? 600 : 400,
                      }}
                    >
                      {category}
                    </Typography>
                  }
                  sx={{
                    mx: -0.5,
                    my: 0,
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.25,
                    transition: "background-color .15s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                />
              ))}
            </FilterSection>

            {/* -------- Brand -------- */}
            <FilterSection title="Brand">
              {brands.length === 0 && (
                <Typography
                  sx={{ fontSize: "0.8125rem", color: "text.secondary" }}
                >
                  No brands available
                </Typography>
              )}
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={selectedBrand === brand}
                      onChange={(e) => onBrand(e.target.checked ? brand : null)}
                      size="small"
                      sx={{ color: "primary.main", py: 0.5 }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color:
                          selectedBrand === brand
                            ? "text.primary"
                            : "text.secondary",
                        fontWeight: selectedBrand === brand ? 600 : 400,
                      }}
                    >
                      {brand}
                    </Typography>
                  }
                  sx={{
                    mx: -0.5,
                    my: 0,
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.25,
                    transition: "background-color .15s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                />
              ))}
            </FilterSection>

            {/* -------- Price -------- */}
            <FilterSection title="Price">
              <Slider
                value={[priceRange.min, priceRange.max]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  onPriceRange(min, max);
                }}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatPrice(v)}
                getAriaLabel={() => "Price range"}
                sx={{
                  "& .MuiSlider-thumb": {
                    width: 18,
                    height: 18,
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: "0 0 0 8px rgba(241, 90, 41, 0.12)",
                    },
                  },
                  "& .MuiSlider-valueLabel": {
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "text.primary",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatPrice(priceRange.min)}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  to
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "text.primary",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatPrice(priceRange.max)}
                </Typography>
              </Box>
            </FilterSection>
          </>
        )}
      </Box>
    </Paper>
  );
}

/** Overline heading wrapper for a filter group. */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "text.secondary",
          mb: 1.25,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer header                                                               */
/* -------------------------------------------------------------------------- */

function DrawerHeader({
  onClose,
  resultCount,
}: {
  onClose: () => void;
  resultCount: number | null;
}) {
  return (
    <Box
      sx={{
        minHeight: 60,
        px: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={onClose}
          aria-label="Close filters"
          edge="start"
          size="small"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
          Filters
        </Typography>
      </Box>
      {resultCount !== null && (
        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          {formatCount(resultCount)} result{resultCount === 1 ? "" : "s"}
        </Typography>
      )}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* State panels (error / empty / no-query)                                     */
/* -------------------------------------------------------------------------- */

function StatePanel({
  icon,
  title,
  body,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actions?: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: 1,
        textAlign: "center",
        px: { xs: 2.5, md: 4 },
        py: { xs: 5, md: 7 },
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        {icon}
      </Box>
      <Typography
        component="h2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.0625rem", md: "1.1875rem" },
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          maxWidth: 420,
          mx: "auto",
          mb: actions ? 3 : 0,
        }}
      >
        {body}
      </Typography>
      {actions}
    </Paper>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                            */
/* -------------------------------------------------------------------------- */

function SearchResultsSkeleton() {
  return (
    <>
      {/* Card-grid skeleton mirroring the results layout */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid size={{ xs: 6, sm: 6, md: 4 }} key={i}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{ height: { xs: 150, sm: 200 }, borderRadius: 0 }}
              />
              <Box sx={{ p: { xs: 1.25, sm: 2 } }}>
                <Skeleton variant="text" width="40%" height={14} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="45%" height={22} />
                <Skeleton
                  variant="rounded"
                  sx={{ height: 30, mt: 1.5, borderRadius: 1.5 }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Pagination skeleton */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Skeleton
          variant="rounded"
          width={280}
          height={32}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Offer chip helper (unchanged business logic)                                */
/* -------------------------------------------------------------------------- */

/**
 * Compute the offer chip text for a search result. Returns "Best Price"
 * when there is no discounted original price to compare against.
 */
function searchPageOffer(product: {
  price: number;
  originalPrice?: number;
}): string {
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
