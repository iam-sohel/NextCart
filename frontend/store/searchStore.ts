import { create } from "zustand";

import {
  listProducts,
  searchProducts,
} from "@/services/productService";

import type { Product } from "@/types/product";

export interface SearchFilters {
  query: string;

  selectedCategory: string | null;

  selectedBrand: string | null;

  priceRange: {
    min: number;
    max: number;
  };

  sortBy:
    | "relevance"
    | "price-low"
    | "price-high"
    | "rating"
    | "newest";

  currentPage: number;
}

interface SearchStore extends SearchFilters {
  /**
   * Complete dataset returned by the backend.
   *
   * Filtering is always performed against this collection.
   */
  catalog: Product[];

  /**
   * Filtered/sorted products displayed by the page.
   */
  results: Product[];

  totalResults: number;
  totalPages: number;

  itemsPerPage: number;

  loading: boolean;

  error: string | null;

  dataSource:
    | "backend"
    | null;

  search: (query: string) => Promise<void>;

  setCategory: (
    category: string | null,
  ) => void;

  setBrand: (
    brand: string | null,
  ) => void;

  setPriceRange: (
    min: number,
    max: number,
  ) => void;

  setSortBy: (
    sort: SearchFilters["sortBy"],
  ) => void;

  setPage: (page: number) => void;

  clearFilters: () => void;
}

const ITEMS_PER_PAGE = 12;

/* -------------------------------------------------------------------------- */
/* Filtering                                                                  */
/* -------------------------------------------------------------------------- */

function filterProducts(
  products: Product[],
  state: SearchFilters,
): Product[] {
  const normalizedQuery =
    state.query.trim().toLowerCase();

  return products.filter((product) => {
    const keywords =
      product.keywords ?? [];

    const matchesQuery =
      normalizedQuery === "" ||
      product.title
        .toLowerCase()
        .includes(normalizedQuery) ||
      product.brand
        .toLowerCase()
        .includes(normalizedQuery) ||
      product.category
        .toLowerCase()
        .includes(normalizedQuery) ||
      product.description
        .toLowerCase()
        .includes(normalizedQuery) ||
      keywords.some((keyword) =>
        keyword
          .toLowerCase()
          .includes(normalizedQuery),
      );

    const matchesCategory =
      !state.selectedCategory ||
      product.category ===
        state.selectedCategory;

    const matchesBrand =
      !state.selectedBrand ||
      product.brand ===
        state.selectedBrand;

    const matchesPrice =
      product.price >=
        state.priceRange.min &&
      product.price <=
        state.priceRange.max;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesBrand &&
      matchesPrice
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

function numericId(
  id: number | string,
): number {
  if (typeof id === "number") {
    return id;
  }

  const parsed = Number(id);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function sortProducts(
  products: Product[],
  sortBy: SearchFilters["sortBy"],
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      sorted.sort(
        (a, b) => a.price - b.price,
      );
      break;

    case "price-high":
      sorted.sort(
        (a, b) => b.price - a.price,
      );
      break;

    case "rating":
      sorted.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      );
      break;

    case "newest":
      sorted.sort(
        (a, b) =>
          numericId(b.id) -
          numericId(a.id),
      );
      break;

    case "relevance":
    default:
      break;
  }

  return sorted;
}

/* -------------------------------------------------------------------------- */
/* Calculation                                                                */
/* -------------------------------------------------------------------------- */

function calculateResults(
  catalog: Product[],
  state: SearchFilters,
) {
  const filtered = filterProducts(
    catalog,
    state,
  );

  const sorted = sortProducts(
    filtered,
    state.sortBy,
  );

  const totalResults =
    sorted.length;

  const totalPages =
    Math.ceil(
      totalResults /
        ITEMS_PER_PAGE,
    );

  return {
    results: sorted,
    totalResults,
    totalPages,
  };
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

const useSearchStore =
  create<SearchStore>((set, get) => ({
    query: "",

    catalog: [],

    results: [],

    totalResults: 0,

    totalPages: 0,

    itemsPerPage:
      ITEMS_PER_PAGE,

    selectedCategory: null,

    selectedBrand: null,

    priceRange: {
      min: 0,
      max: 100000,
    },

    sortBy: "relevance",

    currentPage: 1,

    loading: false,

    error: null,

    dataSource: null,

    /* ---------------------------------------------------------------------- */
    /* Search                                                                  */
    /* ---------------------------------------------------------------------- */

    search: async (query) => {
      set({
        loading: true,
        error: null,
        query,
        currentPage: 1,
      });

      try {
        let products: Product[] = [];

        /*
         * Real backend search when a keyword exists.
         */
        if (query.trim()) {
          const response =
            await searchProducts(
              query,
            );

          if (!response.ok) {
            set({
              loading: false,
              error:
                response.message,
              dataSource: null,
              catalog: [],
              results: [],
              totalResults: 0,
              totalPages: 0,
            });

            return;
          }

          products =
            response.data;
        } else {
          /*
           * Empty search = full catalogue.
           */
          const response =
            await listProducts();

          if (
            response.source ===
            "error"
          ) {
            set({
              loading: false,
              error:
                response.message,
              dataSource: null,
              catalog: [],
              results: [],
              totalResults: 0,
              totalPages: 0,
            });

            return;
          }

          products =
            response.products;
        }

        /*
         * IMPORTANT:
         *
         * Save the complete backend result as catalog.
         * All subsequent UI filters operate against catalog,
         * never against results.
         */
        const nextState = get();

        const calculated =
          calculateResults(
            products,
            {
              ...nextState,
              query,
            },
          );

        set({
          loading: false,

          error: null,

          dataSource:
            "backend",

          catalog:
            products,

          results:
            calculated.results,

          totalResults:
            calculated.totalResults,

          totalPages:
            calculated.totalPages,

          currentPage: 1,

          query,
        });
      } catch (error) {
        set({
          loading: false,

          error:
            error instanceof Error
              ? error.message
              : "Failed to load products.",

          catalog: [],

          results: [],

          totalResults: 0,

          totalPages: 0,

          dataSource: null,
        });
      }
    },

    /* ---------------------------------------------------------------------- */
    /* Category                                                                */
    /* ---------------------------------------------------------------------- */

    setCategory: (
      category,
    ) => {
      const state = get();

      const nextState = {
        ...state,
        selectedCategory:
          category,
      };

      const calculated =
        calculateResults(
          state.catalog,
          nextState,
        );

      set({
        selectedCategory:
          category,

        results:
          calculated.results,

        totalResults:
          calculated.totalResults,

        totalPages:
          calculated.totalPages,

        currentPage: 1,
      });
    },

    /* ---------------------------------------------------------------------- */
    /* Brand                                                                   */
    /* ---------------------------------------------------------------------- */

    setBrand: (brand) => {
      const state = get();

      const nextState = {
        ...state,
        selectedBrand:
          brand,
      };

      const calculated =
        calculateResults(
          state.catalog,
          nextState,
        );

      set({
        selectedBrand:
          brand,

        results:
          calculated.results,

        totalResults:
          calculated.totalResults,

        totalPages:
          calculated.totalPages,

        currentPage: 1,
      });
    },

    /* ---------------------------------------------------------------------- */
    /* Price                                                                   */
    /* ---------------------------------------------------------------------- */

    setPriceRange: (
      min,
      max,
    ) => {
      const state = get();

      const nextState = {
        ...state,

        priceRange: {
          min,
          max,
        },
      };

      const calculated =
        calculateResults(
          state.catalog,
          nextState,
        );

      set({
        priceRange: {
          min,
          max,
        },

        results:
          calculated.results,

        totalResults:
          calculated.totalResults,

        totalPages:
          calculated.totalPages,

        currentPage: 1,
      });
    },

    /* ---------------------------------------------------------------------- */
    /* Sorting                                                                 */
    /* ---------------------------------------------------------------------- */

    setSortBy: (
      sortBy,
    ) => {
      const state = get();

      const nextState = {
        ...state,
        sortBy,
      };

      const calculated =
        calculateResults(
          state.catalog,
          nextState,
        );

      set({
        sortBy,

        results:
          calculated.results,

        totalResults:
          calculated.totalResults,

        totalPages:
          calculated.totalPages,

        currentPage: 1,
      });
    },

    /* ---------------------------------------------------------------------- */
    /* Pagination                                                              */
    /* ---------------------------------------------------------------------- */

    setPage: (page) => {
      const totalPages =
        get().totalPages;

      set({
        currentPage:
          totalPages > 0
            ? Math.max(
                1,
                Math.min(
                  page,
                  totalPages,
                ),
              )
            : 1,
      });
    },

    /* ---------------------------------------------------------------------- */
    /* Clear filters                                                           */
    /* ---------------------------------------------------------------------- */

    clearFilters: () => {
      const state = get();

      const resetState: SearchFilters =
        {
          query: state.query,

          selectedCategory:
            null,

          selectedBrand:
            null,

          priceRange: {
            min: 0,
            max: 100000,
          },

          sortBy:
            "relevance",

          currentPage: 1,
        };

      const calculated =
        calculateResults(
          state.catalog,
          resetState,
        );

      set({
        selectedCategory:
          null,

        selectedBrand:
          null,

        priceRange: {
          min: 0,
          max: 100000,
        },

        sortBy:
          "relevance",

        currentPage: 1,

        results:
          calculated.results,

        totalResults:
          calculated.totalResults,

        totalPages:
          calculated.totalPages,

        error: null,
      });
    },
  }));

export default useSearchStore;