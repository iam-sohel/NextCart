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

  search: (query: string) => void;
  setCategory: (category: string | null) => void;
  setBrand: (brand: string | null) => void;
  setPriceRange: (min: number, max: number) => void;
  setSortBy: (sort: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

const filterProducts = (
  query: string,
  category: string | null,
  brand: string | null,
  priceRange: { min: number; max: number }
): Product[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const keywords = product.keywords ?? [];

    const matchesQuery =
      normalizedQuery === "" ||
      product.title.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      keywords.some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery)
      );

    const matchesCategory =
      !category || product.category === category;

    const matchesBrand =
      !brand || product.brand === brand;

    const matchesPrice =
      product.price >= priceRange.min &&
      product.price <= priceRange.max;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesBrand &&
      matchesPrice
    );
  });
};

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
      sorted.sort((a, b) => numericId(b.id) - numericId(a.id));
      break;

    case "relevance":
    default:
      break;
  }

  return sorted;
};

const useSearchStore = create<SearchStore>((set, get) => ({
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

  search: (query) =>
    set((state) => {
      const filtered = filterProducts(
        query,
        state.selectedCategory,
        state.selectedBrand,
        state.priceRange
      );

      const sorted = sortProducts(
        filtered,
        state.sortBy
      );

      const totalResults = sorted.length;
      const totalPages = Math.ceil(
        totalResults / state.itemsPerPage
      );

      return {
        query,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1,
      };
    }),

  setCategory: (category) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        category,
        state.selectedBrand,
        state.priceRange
      );

      const sorted = sortProducts(
        filtered,
        state.sortBy
      );

      const totalResults = sorted.length;
      const totalPages = Math.ceil(
        totalResults / state.itemsPerPage
      );

      return {
        selectedCategory: category,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1,
      };
    }),

  setBrand: (brand) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        state.selectedCategory,
        brand,
        state.priceRange
      );

      const sorted = sortProducts(
        filtered,
        state.sortBy
      );

      const totalResults = sorted.length;
      const totalPages = Math.ceil(
        totalResults / state.itemsPerPage
      );

      return {
        selectedBrand: brand,
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1,
      };
    }),

  setPriceRange: (min, max) =>
    set((state) => {
      const filtered = filterProducts(
        state.query,
        state.selectedCategory,
        state.selectedBrand,
        { min, max }
      );

      const sorted = sortProducts(
        filtered,
        state.sortBy
      );

      const totalResults = sorted.length;
      const totalPages = Math.ceil(
        totalResults / state.itemsPerPage
      );

      return {
        priceRange: { min, max },
        results: sorted,
        totalResults,
        totalPages,
        currentPage: 1,
      };
    }),

  setSortBy: (sortBy) =>
    set((state) => {
      const sorted = sortProducts(
        state.results,
        sortBy
      );

      return {
        sortBy: sortBy as SearchStore["sortBy"],
        results: sorted,
        currentPage: 1,
      };
    }),

  setPage: (page) =>
    set({
      currentPage: Math.max(
        1,
        Math.min(page, get().totalPages)
      ),
    }),

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

/**
 * Coerce a Product.id (`number | string`) into a number for arithmetic.
 * Falls back to 0 when the id is non-numeric so the sort stays stable.
 */
function numericId(id: number | string): number {
  if (typeof id === "number") return id;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default useSearchStore;