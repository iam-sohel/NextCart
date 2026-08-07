import { create } from "zustand";
import { Product } from "@/types/product";
import products from "@/data/products";

export interface SearchFilters {
  query: string;
  selectedCategory: string | null;
  selectedBrand: string | null;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: "relevance" | "price-low" | "price-high" | "rating" | "newest";
  currentPage: number;
}

interface SearchStore extends SearchFilters {
  results: Product[];
  totalResults: number;
  totalPages: number;
  itemsPerPage: number;

  // Actions
  search: (query: string) => void;
  setCategory: (category: string | null) => void;
  setBrand: (brand: string | null) => void;
  setPriceRange: (min: number, max: number) => void;
  setSortBy: (sort: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

// Helper function to filter products
const filterProducts = (
  query: string,
  category: string | null,
  brand: string | null,
  priceRange: { min: number; max: number }
): Product[] => {
  return products.filter((product) => {
    // Match query (title, brand, category)
    const matchesQuery =
      query === "" ||
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());

    // Match category filter
    const matchesCategory = !category || product.category === category;

    // Match brand filter
    const matchesBrand = !brand || product.brand === brand;

    // Match price range
    const matchesPrice =
      product.price >= priceRange.min && product.price <= priceRange.max;

    return matchesQuery && matchesCategory && matchesBrand && matchesPrice;
  });
};

// Helper function to sort products
const sortProducts = (
  productsToSort: Product[],
  sortBy: string
): Product[] => {
  const sorted = [...productsToSort];

  switch (sortBy) {
    case "price-low":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      sorted.sort((a, b) => b.id - a.id);
      break;
    case "relevance":
    default:
      // Keep original order
      break;
  }

  return sorted;
};

const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial state
  query: "",
  results: [],
  totalResults: 0,
  totalPages: 0,
  itemsPerPage: 12,
  selectedCategory: null,
  selectedBrand: null,
  priceRange: {
    min: 0,
    max: 100000,
  },
  sortBy: "relevance",
  currentPage: 1,

  // Search action
  search: (query) =>
    set((state) => {
      const filtered = filterProducts(
        query,
        state.selectedCategory,
        state.selectedBrand,
        state.priceRange
      );
      const sorted = sortProducts(filtered, state.sortBy);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / state.itemsPerPage);

      return {
        query,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1, // Reset to page 1 when searching
      };
    }),

  // Set category filter
  setCategory: (category) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        category,
        state.selectedBrand,
        state.priceRange
      );
      const sorted = sortProducts(filtered, state.sortBy);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / state.itemsPerPage);

      return {
        selectedCategory: category,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1, // Reset to page 1
      };
    }),

  // Set brand filter
  setBrand: (brand) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        state.selectedCategory,
        brand,
        state.priceRange
      );
      const sorted = sortProducts(filtered, state.sortBy);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / state.itemsPerPage);

      return {
        selectedBrand: brand,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1, // Reset to page 1
      };
    }),

  // Set price range filter
  setPriceRange: (min, max) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        state.selectedCategory,
        state.selectedBrand,
        { min, max }
      );
      const sorted = sortProducts(filtered, state.sortBy);
      const totalResults = sorted.length;
      const totalPages = Math.ceil(totalResults / state.itemsPerPage);

      return {
        priceRange: { min, max },
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1, // Reset to page 1
      };
    }),

  // Set sorting
  setSortBy: (sortBy) =>
    set((state) => {
      const sorted = sortProducts(state.results, sortBy);

      return {
        sortBy: sortBy as SearchStore["sortBy"],
        results: sorted,
        currentPage: 1, // Reset to page 1
      };
    }),

  // Set current page
  setPage: (page) =>
    set({
      currentPage: Math.max(1, Math.min(page, get().totalPages)),
    }),

  // Clear all filters
  clearFilters: () =>
    set({
      query: "",
      results: [],
      totalResults: 0,
      totalPages: 0,
      selectedCategory: null,
      selectedBrand: null,
      priceRange: {
        min: 0,
        max: 100000,
      },
      sortBy: "relevance",
      currentPage: 1,
    }),
}));

export default useSearchStore;