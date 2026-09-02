/**
 * NEXTCART — Product normalization helpers.
 *
 * Converts backend product payloads into the canonical frontend Product shape.
 *
 * IMPORTANT:
 * - No mock product data.
 * - No placeholder image fallback.
 * - Images come only from the backend.
 */

import type {
  Product,
  ProductImage,
  ProductInventory,
  ProductVariant,
} from "@/types/product";

import { API_BASE_URL } from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Image URL helpers                                                          */
/* -------------------------------------------------------------------------- */

export function absolutizeImageUrl(
  url: string | undefined | null,
): string {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  // Absolute HTTP/HTTPS URL
  if (/^(https?:)?\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Backend-relative URL
  if (trimmed.startsWith("/")) {
    const base = API_BASE_URL.replace(/\/+$/, "");
    return `${base}${trimmed}`;
  }

  return trimmed;
}

/* -------------------------------------------------------------------------- */
/* Backend DTOs                                                              */
/* -------------------------------------------------------------------------- */

export interface BackendProductDto {
  id: number | string;
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number | string;
  subCategoryId?: number | string;
  brandId?: number | string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendProductDetailsDto {
  id?: number | string;
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number | string;
  subCategoryId?: number | string;
  brandId?: number | string;

  brand?: string;
  brandName?: string;

  category?: string;
  categoryName?: string;

  status?: string | null;

  price?: number;
  originalPrice?: number;
  discount?: number;

  rating?: number;
  reviewsCount?: number;

  information?: {
    id?: number | string;
    productId?: number | string;
    shortDescription?: string;
    longDescription?: string;
    warranty?: string;
    manufacturer?: string;
  };

  specifications?: Array<{
    id?: number | string;
    productId?: number | string;
    specificationName?: string;
    specificationValue?: string;
  }>;

  variants?: BackendProductVariantDto[];
  images?: BackendProductImageDto[];
}

export interface BackendProductVariantDto {
  id: number | string;
  productId?: number | string;
  sku?: string;
  status?: string | null;
  available?: boolean;
  stockStatus?: string;

  price?: {
    id?: number | string;
    productVariantId?: number | string;
    mrp?: number;
    sellingPrice?: number;
    currency?: string;
  } | null;

  attributes?: Array<{
    id?: number | string;
    variantId?: number | string;
    attributeName?: string;
    attributeValue?: string;
  }>;
}

export interface BackendProductImageDto {
  id?: number | string;
  productId?: number | string;
  imageUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface BackendInventoryDto {
  id?: number | string;
  productId?: number | string;
  variantId?: number | string;
  quantity?: number;
  reservedStock?: number;
  availableStock?: number;
  stockStatus?: string;
  lastUpdated?: string;
}

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                          */
/* -------------------------------------------------------------------------- */

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toString(
  value: unknown,
  fallback = "",
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

/* -------------------------------------------------------------------------- */
/* Attribute normalization                                                    */
/* -------------------------------------------------------------------------- */

export function normalizeVariantAttributes(
  attributes:
    | BackendProductVariantDto["attributes"]
    | Record<
        string,
        string | number | null | undefined
      >
    | undefined
    | null,
): Record<string, string> {
  if (!attributes) {
    return {};
  }

  if (Array.isArray(attributes)) {
    return attributes.reduce<Record<string, string>>(
      (result, attribute) => {
        if (!attribute?.attributeName) {
          return result;
        }

        result[attribute.attributeName] =
          toString(attribute.attributeValue);

        return result;
      },
      {},
    );
  }

  return Object.entries(attributes).reduce<
    Record<string, string>
  >(
    (result, [key, value]) => {
      if (
        value !== null &&
        value !== undefined
      ) {
        result[key] = String(value);
      }

      return result;
    },
    {},
  );
}

/* -------------------------------------------------------------------------- */
/* Image normalization                                                        */
/* -------------------------------------------------------------------------- */

export function normalizeProductImages(
  images:
    | BackendProductImageDto[]
    | undefined
    | null,
): ProductImage[] {
  if (!images?.length) {
    return [];
  }

  return images
    .map((image, index) => {
      const url = absolutizeImageUrl(
        image.imageUrl,
      );

      return {
        id:
          image.id !== undefined
            ? toNumber(image.id, index)
            : index,

        url,

        isPrimary: Boolean(
          image.isPrimary,
        ),

        sortOrder:
          image.displayOrder !== undefined
            ? toNumber(
                image.displayOrder,
                index,
              )
            : index,
      };
    })
    .filter(
      (image) =>
        Boolean(image.url),
    )
    .sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0),
    );
}

/* -------------------------------------------------------------------------- */
/* Inventory normalization                                                    */
/* -------------------------------------------------------------------------- */

export function normalizeInventory(
  inventory?: BackendInventoryDto | null,
): ProductInventory {
  if (!inventory) {
    return {
      quantity: 0,
      reservedQty: 0,
      available: 0,
    };
  }

  const quantity = toNumber(
    inventory.quantity,
    0,
  );

  const reservedQty = toNumber(
    inventory.reservedStock,
    0,
  );

  const available =
    inventory.availableStock !== undefined
      ? toNumber(
          inventory.availableStock,
          0,
        )
      : Math.max(
          quantity - reservedQty,
          0,
        );

  return {
    quantity,
    reservedQty,
    available,
  };
}

/* -------------------------------------------------------------------------- */
/* Variant normalization                                                      */
/* -------------------------------------------------------------------------- */

export function normalizeProductVariant(
  variant: BackendProductVariantDto,
  inventory?: BackendInventoryDto | null,
): ProductVariant {
  const sellingPrice = toNumber(
    variant.price?.sellingPrice,
    0,
  );

  const mrp = toNumber(
    variant.price?.mrp,
    0,
  );

  const attributes =
    normalizeVariantAttributes(
      variant.attributes,
    );

  return {
    id: toString(variant.id),

    sku:
      variant.sku ?? "",

    price:
      sellingPrice,

    originalPrice:
      mrp > 0
        ? mrp
        : undefined,

    attributes,

    inventory:
      normalizeInventory(
        inventory,
      ),

    stockStatus:
      variant.stockStatus,

    available:
      variant.available,
  };
}

/* -------------------------------------------------------------------------- */
/* Price helpers                                                              */
/* -------------------------------------------------------------------------- */

function getProductPricing(
  product: BackendProductDetailsDto,
  variants: ProductVariant[],
) {
  const firstVariant =
    variants[0];

  const price =
    product.price !== undefined
      ? toNumber(product.price)
      : firstVariant?.price ?? 0;

  const originalPrice =
    product.originalPrice !== undefined
      ? toNumber(
          product.originalPrice,
        )
      : firstVariant?.originalPrice ??
        price;

  const discount =
    product.discount !== undefined
      ? toNumber(product.discount)
      : originalPrice > price &&
          originalPrice > 0
        ? Math.round(
            ((originalPrice - price) /
              originalPrice) *
              100,
          )
        : 0;

  return {
    price,
    originalPrice,
    discount,
  };
}

/* -------------------------------------------------------------------------- */
/* Backend list/search normalization                                          */
/* -------------------------------------------------------------------------- */

export function normalizeBackendProduct(
  product: BackendProductDto,
): Product {
  const name =
    product.name ?? "";

  return {
    id:
      toString(product.id),

    name,

    title:
      name,

    slug:
      product.slug ??
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(
          /(^-|-$)/g,
          "",
        ),

    description:
      product.description ?? "",

    price: 0,

    originalPrice: 0,

    discount: 0,

    brand: "",

    category: "",

    images: [],

    variants: [],

    /*
     * List/search responses do not necessarily
     * contain product images.
     */
    image: "",

    rating: 0,

    reviewsCount: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Backend details normalization                                              */
/* -------------------------------------------------------------------------- */

export function normalizeBackendProductDetails(
  product: BackendProductDetailsDto,
  inventories?: BackendInventoryDto[],
): Product {
  /* ------------------------------ Variants -------------------------------- */

  const backendVariants =
    product.variants ?? [];

  const normalizedVariants =
    backendVariants.map(
      (variant) => {
        const inventory =
          inventories?.find(
            (item) =>
              item.variantId !==
                undefined &&
              String(item.variantId) ===
                String(variant.id),
          );

        return normalizeProductVariant(
          variant,
          inventory,
        );
      },
    );

  /* -------------------------------- Pricing -------------------------------- */

  const pricing =
    getProductPricing(
      product,
      normalizedVariants,
    );

  /* -------------------------------- Images --------------------------------- */

  const images =
    normalizeProductImages(
      product.images,
    );

  /*
   * Image priority:
   *
   * 1. Backend image marked isPrimary=true
   * 2. First backend image by displayOrder
   * 3. Empty string when backend has no image
   *
   * NO placeholder.
   * NO mock image.
   * NO local fallback.
   */

  const primaryImage =
    [...images]
      .sort((a, b) => {
        if (
          a.isPrimary !==
          b.isPrimary
        ) {
          return a.isPrimary
            ? -1
            : 1;
        }

        return (
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0)
        );
      })[0] ?? null;

  /* -------------------------------- Product -------------------------------- */

  const name =
    product.name ?? "";

  const slug =
    product.slug ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(
        /(^-|-$)/g,
        "",
      );

  return {
    id:
      toString(product.id),

    name,

    title:
      name,

    slug,

    description:
      product.description ??
      product.information
        ?.longDescription ??
      "",

    price:
      pricing.price,

    originalPrice:
      pricing.originalPrice,

    discount:
      pricing.discount,

    brand:
      product.brand ??
      product.brandName ??
      "",

    category:
      product.category ??
      product.categoryName ??
      "",

    images,

    variants:
      normalizedVariants,

    rating:
      product.rating !== undefined
        ? toNumber(
            product.rating,
          )
        : undefined,

    reviewsCount:
      product.reviewsCount !== undefined
        ? toNumber(
            product.reviewsCount,
          )
        : 0,

    /*
     * This is the ONLY product image assigned here.
     * It comes directly from the backend image list.
     */
    image:
      primaryImage?.url ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/* Inventory merge                                                            */
/* -------------------------------------------------------------------------- */

export function mergeVariantInventory(
  product: Product,
  inventories: BackendInventoryDto[],
): Product {
  if (
    !product.variants?.length
  ) {
    return product;
  }

  const variants =
    product.variants.map(
      (variant) => {
        const inventory =
          inventories.find(
            (item) =>
              item.variantId !==
                undefined &&
              String(item.variantId) ===
                String(variant.id),
          );

        if (!inventory) {
          return variant;
        }

        return {
          ...variant,

          inventory:
            normalizeInventory(
              inventory,
            ),
        };
      },
    );

  return {
    ...product,
    variants,
  };
}

/* -------------------------------------------------------------------------- */
/* Generic normalization entry point                                          */
/* -------------------------------------------------------------------------- */

export function normalizeProduct(
  product:
    | Product
    | BackendProductDto
    | BackendProductDetailsDto,
): Product {
  if (!product) {
    throw new Error(
      "Cannot normalize an empty product",
    );
  }

  if (
    "images" in product ||
    "variants" in product ||
    "information" in product ||
    "specifications" in product
  ) {
    return normalizeBackendProductDetails(
      product as BackendProductDetailsDto,
    );
  }

  return normalizeBackendProduct(
    product as BackendProductDto,
  );
}