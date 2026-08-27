/**
 * NEXTCART — Product normalization helpers.
 *
 * This file converts backend product payloads and legacy/mock product
 * payloads into the canonical frontend Product shape.
 *
 * Responsibilities:
 * 1. Normalize backend ProductResponse payloads.
 * 2. Normalize backend ProductDetailsResponse payloads.
 * 3. Normalize product images and image URLs.
 * 4. Normalize product variants and attributes.
 * 5. Normalize inventory.
 * 6. Merge per-variant inventory into products.
 *
 * UI components should consume the canonical Product type and should
 * not need to know the backend DTO structure.
 */

import type {
  Product,
  ProductImage,
  ProductInventory,
  ProductVariant,
} from "@/types/product";

import { getProductImage } from "@/utils/productImages";
import { API_BASE_URL } from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Image URL helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Convert a backend-supplied image URL into a URL usable by the frontend.
 *
 * Supported:
 * - https://...
 * - http://...
 * - //cdn.example.com/...
 * - /products/...
 *
 * Root-relative backend paths are resolved against API_BASE_URL.
 */
export function absolutizeImageUrl(
  url: string | undefined | null,
): string {
  if (!url) return "";

  if (/^(https?:)?\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    const base = API_BASE_URL.replace(/\/+$/, "");
    return `${base}${url}`;
  }

  return url;
}

/* -------------------------------------------------------------------------- */
/* Backend DTOs                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Backend ProductResponse / product-like payload.
 *
 * This type intentionally remains defensive because different backend
 * product endpoints may expose slightly different fields.
 */
export interface BackendProductDto {
  id: number | string;

  name?: string;

  slug?: string;

  description?: string;

  price?: number;

  originalPrice?: number;

  discount?: number;

  brand?: string;

  brandName?: string;

  category?: string;

  categoryName?: string;

  subCategoryName?: string;

  status?: string | null;

  rating?: number;

  reviewsCount?: number;

  images?: Array<{
    imageUrl?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }>;

  variants?: Array<{
    id: number | string;

    sku?: string;

    price?: number | string;

    attributes?: Record<
      string,
      string | number | null | undefined
    >;

    inventory?: {
      stockStatus?: string;

      quantity?: number;

      reservedQty?: number;

      reservedQuantity?: number;

      availableQuantity?: number;
    };
  }>;
}

/**
 * Backend ProductDetailsResponse.
 *
 * Matches the current backend structure:
 *
 * ProductDetailsResponse {
 *   id
 *   name
 *   slug
 *   description
 *   categoryId
 *   subCategoryId
 *   brandId
 *   information
 *   specifications
 *   images
 *   variants
 * }
 *
 * Important:
 * This DTO is FLAT. It does not require:
 *
 * {
 *   product: {...}
 * }
 */
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

  variants?: Array<{
    id: number | string;

    productId?: number | string;

    sku?: string;

    price?: number | string;

    attributes?: Record<
      string,
      string | number | null | undefined
    >;

    status?: string;
  }>;

  images?: Array<{
    id?: number | string;

    productId?: number | string;

    imageUrl?: string;

    isPrimary?: boolean;

    displayOrder?: number;
  }>;
}

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                          */
/* -------------------------------------------------------------------------- */

function optionalNumber(
  value: number | string | null | undefined,
): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : undefined;
  }

  return undefined;
}

/**
 * Normalize backend variant attributes.
 *
 * ProductVariant expects:
 *
 * Record<string, string | number | null>
 *
 * Backend payloads may contain undefined values, so we explicitly remove
 * undefined values here instead of weakening the ProductVariant type.
 */
function normalizeVariantAttributes(
  attributes:
    | Record<
        string,
        string | number | null | undefined
      >
    | null
    | undefined,
): Record<string, string | number | null> {
  const normalized: Record<
    string,
    string | number | null
  > = {};

  if (!attributes) {
    return normalized;
  }

  Object.entries(attributes).forEach(
    ([key, value]) => {
      if (value !== undefined) {
        normalized[key] = value;
      }
    },
  );

  return normalized;
}

function attrString(
  attributes: Record<
    string,
    string | number | null
  >,
  key: string,
): string | null | undefined {
  if (!(key in attributes)) {
    return undefined;
  }

  const value = attributes[key];

  if (value === null) {
    return null;
  }

  return String(value);
}

/* -------------------------------------------------------------------------- */
/* Backend ProductResponse → Product                                          */
/* -------------------------------------------------------------------------- */

export function normalizeBackendProduct(
  dto: BackendProductDto,
): Product {
  /* ------------------------------ Images -------------------------------- */

  const rawImages = Array.isArray(dto.images)
    ? dto.images
    : [];

  const mappedImages: ProductImage[] = [];

  rawImages.forEach((img, index) => {
    const url = absolutizeImageUrl(
      img.imageUrl,
    );

    if (!url) {
      return;
    }

    mappedImages.push({
      id: `be-${dto.id}-${index}`,
      url,
      sortOrder:
        typeof img.sortOrder === "number"
          ? img.sortOrder
          : index,
      isPrimary:
        img.isPrimary ?? index === 0,
    });
  });

  /* ------------------------------ Variants ------------------------------ */

  const rawVariants = Array.isArray(dto.variants)
    ? dto.variants
    : [];

  const mappedVariants: ProductVariant[] =
  rawVariants.map((variant) => {
    const attrs = normalizeVariantAttributes(
      variant.attributes,
    );

    const inventory = variant.inventory;

    const quantity = Number(
      inventory?.quantity ?? 0,
    );

    const reservedQty = Number(
      inventory?.reservedQty ??
        inventory?.reservedQuantity ??
        0,
    );

    const available =
      typeof inventory?.availableQuantity === "number"
        ? Math.max(
            0,
            inventory.availableQuantity,
          )
        : Math.max(
            0,
            quantity - reservedQty,
          );

    return {
      id: variant.id,

      sku: variant.sku,

      size: attrString(
        attrs,
        "size",
      ),

      color: attrString(
        attrs,
        "color",
      ),

      storage: attrString(
        attrs,
        "storage",
      ),

      price: optionalNumber(
        variant.price,
      ),

      attributes: attrs,

      inventory: inventory
        ? {
            quantity,
            reservedQty,
            available,
          }
        : undefined,
    };
  });

  /* -------------------------- Parent inventory -------------------------- */

  const aggregateInventory: ProductInventory =
    (() => {
      if (
        mappedVariants.length ===
        0
      ) {
        return {
          quantity: 0,
          reservedQty: 0,
          available: 0,
        };
      }

      let quantity = 0;

      let reservedQty = 0;

      for (const variant of mappedVariants) {
        quantity +=
          variant.inventory?.quantity ??
          0;

        reservedQty +=
          variant.inventory?.reservedQty ??
          0;
      }

      return {
        quantity,
        reservedQty,
        available: Math.max(
          0,
          quantity - reservedQty,
        ),
      };
    })();

  /* -------------------------------- Slug -------------------------------- */

  const slug =
    dto.slug ||
    (typeof dto.name === "string"
      ? dto.name
          .toLowerCase()
          .replace(/['’]/g, "")
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-|-$/g,
            "",
          )
      : String(dto.id));

  /* ----------------------------- Product -------------------------------- */

  const partial: Product = {
    id: dto.id,

    slug,

    title: dto.name ?? "",

    description:
      dto.description ?? "",

    brand:
      dto.brandName?.trim() ||
      dto.brand?.trim() ||
      "",

    category:
      dto.categoryName?.trim() ||
      dto.category?.trim() ||
      "",

    image:
      mappedImages[0]?.url ?? "",

    images: mappedImages,

    price: Number(
      dto.price ?? 0,
    ),

    originalPrice:
      typeof dto.originalPrice ===
      "number"
        ? dto.originalPrice
        : undefined,

    discount:
      typeof dto.discount ===
      "number"
        ? dto.discount
        : undefined,

    rating: Number(
      dto.rating ?? 0,
    ),

    reviews: Number(
      dto.reviewsCount ?? 0,
    ),

    inventory:
      aggregateInventory,

    variants:
      mappedVariants,
  };

  return normalizeProduct(
    partial,
  );
}

/* -------------------------------------------------------------------------- */
/* ProductDetailsResponse → Product                                           */
/* -------------------------------------------------------------------------- */

/**
 * Converts the current flat Spring Boot ProductDetailsResponse into the
 * canonical frontend Product type.
 *
 * IMPORTANT:
 * This function accepts ONE argument.
 *
 * Correct:
 *
 * normalizeBackendProductDetails(result.data)
 */
export function normalizeBackendProductDetails(
  details:
    | BackendProductDetailsDto
    | null
    | undefined,
): Product {
  const productId =
    details?.id ?? "";

  /* ------------------------------ Images -------------------------------- */

  const rawImages =
    Array.isArray(
      details?.images,
    )
      ? details.images
      : [];

  const mappedImages: ProductImage[] =
    rawImages
      .map(
        (
          img,
          index,
        ): ProductImage | null => {
          const url =
            absolutizeImageUrl(
              img.imageUrl,
            );

          if (!url) {
            return null;
          }

          return {
            id:
              img.id ??
              `be-${productId}-${index}`,

            url,

            sortOrder:
              typeof img.displayOrder ===
              "number"
                ? img.displayOrder
                : index,

            isPrimary:
              img.isPrimary ??
              index === 0,
          };
        },
      )
      .filter(
        (
          image,
        ): image is ProductImage =>
          image !== null,
      )
      .sort(
        (a, b) =>
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0),
      );

  /* ------------------------ Primary image -------------------------------- */

  if (
    mappedImages.length > 0 &&
    !mappedImages.some(
      (image) =>
        image.isPrimary,
    )
  ) {
    mappedImages[0].isPrimary =
      true;
  }

  /* ----------------------------- Variants ------------------------------- */

  const rawVariants =
    Array.isArray(
      details?.variants,
    )
      ? details.variants
      : [];

  const mappedVariants: ProductVariant[] =
    rawVariants.map(
      (variant) => {
        const attrs =
          normalizeVariantAttributes(
            variant.attributes,
          );

        return {
          id: variant.id,

          sku: variant.sku,

          size: attrString(
            attrs,
            "size",
          ),

          color: attrString(
            attrs,
            "color",
          ),

          storage: attrString(
            attrs,
            "storage",
          ),

          price:
            optionalNumber(
              variant.price,
            ),

          attributes: attrs,

          status:
            variant.status,

          /*
           * Inventory is loaded separately by
           * productService.ts through the inventory endpoint.
           */
          inventory:
            undefined,
        };
      },
    );

  /* ------------------------- Specifications ----------------------------- */

  const rawSpecifications =
    Array.isArray(
      details?.specifications,
    )
      ? details.specifications
      : [];

  const specifications: Record<
    string,
    string
  > = {};

  for (const specification of rawSpecifications) {
    const name =
      specification.specificationName?.trim();

    const value =
      specification.specificationValue?.trim();

    if (
      !name ||
      value === undefined
    ) {
      continue;
    }

    specifications[name] =
      value;
  }

  /* --------------------------- Information ------------------------------ */

  const information =
    details?.information;

  const longDescription =
    information?.longDescription?.trim();

  const shortDescription =
    information?.shortDescription?.trim();

  const description =
    longDescription &&
    longDescription.length > 0
      ? longDescription
      : shortDescription &&
          shortDescription.length > 0
        ? shortDescription
        : details?.description ??
          "";

  const warranty =
    information?.warranty?.trim() ||
    undefined;

  const brand =
    details?.brandName?.trim() ||
    details?.brand?.trim() ||
    information?.manufacturer?.trim() ||
    "";

  const category =
    details?.categoryName?.trim() ||
    details?.category?.trim() ||
    "";

  /* ----------------------------- Inventory ------------------------------ */

  /*
   * The current ProductDetailsResponse does not contain inventory.
   *
   * Inventory is merged later by productService.ts.
   */
  const aggregateInventory: ProductInventory =
    {
      quantity: 0,
      reservedQty: 0,
      available: 0,
    };

  /* -------------------------------- Slug -------------------------------- */

  const slug =
    details?.slug ||
    (typeof details?.name ===
    "string"
      ? details.name
          .toLowerCase()
          .replace(
            /['’]/g,
            "",
          )
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-|-$/g,
            "",
          )
      : String(productId));

  /* ------------------------------ Product ------------------------------- */

  const partial: Product = {
    id: productId,

    slug,

    title:
      details?.name ?? "",

    description,

    brand,

    category,

    categorySlug:
      undefined,

    image:
      mappedImages[0]?.url ?? "",

    images:
      mappedImages,

    price:
      typeof details?.price ===
      "number"
        ? details.price
        : 0,

    originalPrice:
      typeof details?.originalPrice ===
      "number"
        ? details.originalPrice
        : undefined,

    discount:
      typeof details?.discount ===
      "number"
        ? details.discount
        : undefined,

    rating: Number(
      details?.rating ?? 0,
    ),

    reviews: Number(
      details?.reviewsCount ?? 0,
    ),

    inventory:
      aggregateInventory,

    variants:
      mappedVariants,

    warranty,

    specifications,
  };

  return normalizeProduct(
    partial,
  );
}

/* -------------------------------------------------------------------------- */
/* Variant inventory merge                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Merge inventory responses into the product's variants.
 *
 * This function is pure and returns a new Product object.
 */
export function mergeVariantInventory(
  product: Product,
  inventoryByVariant: Record<
    string | number,
    {
      quantity?: number;

      reservedQuantity?: number;

      availableQuantity?: number;

      stockStatus?: string;
    }
  >,
): Product {
  if (
    !product.variants ||
    product.variants.length === 0
  ) {
    return product;
  }

  const mergedVariants =
    product.variants.map(
      (variant) => {
        const inventory =
          inventoryByVariant[
            String(variant.id)
          ] ??
          inventoryByVariant[
            variant.id
          ];

        if (!inventory) {
          return variant;
        }

        const quantity =
          Number(
            inventory.quantity ??
              0,
          );

        const reservedQty =
          Number(
            inventory.reservedQuantity ??
              0,
          );

        const available =
          typeof inventory.availableQuantity ===
          "number"
            ? Math.max(
                0,
                inventory.availableQuantity,
              )
            : Math.max(
                0,
                quantity -
                  reservedQty,
              );

        return {
          ...variant,

          inventory: {
            quantity,

            reservedQty,

            available,
          },

          stockStatus:
            inventory.stockStatus ??
            variant.stockStatus,
        };
      },
    );

  /* ------------------------- Aggregate inventory ------------------------ */

  let quantity = 0;

  let reservedQty = 0;

  for (const variant of mergedVariants) {
    quantity +=
      variant.inventory?.quantity ??
      0;

    reservedQty +=
      variant.inventory?.reservedQty ??
      0;
  }

  return {
    ...product,

    variants:
      mergedVariants,

    inventory: {
      quantity,

      reservedQty,

      available: Math.max(
        0,
        quantity -
          reservedQty,
      ),
    },

    stock: Math.max(
      0,
      quantity -
        reservedQty,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Generic product normalizer                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Convert either backend-normalized data or legacy/mock data into the
 * canonical Product shape.
 */
export function normalizeProduct(
  raw: Product,
): Product {
  /* --------------------------- Primary image ---------------------------- */

  const resolvedPrimary =
    getProductImage(raw);

  const images =
    normalizeImages(
      raw.images,
      resolvedPrimary,
    );

  const primaryImage =
    images.find(
      (image) =>
        image.isPrimary,
    )?.url ??
    images[0]?.url ??
    resolvedPrimary;

  /* ----------------------------- Inventory ------------------------------ */

  const inventory =
    normalizeInventory(
      raw.inventory,
      raw.stock,
    );

  /* ----------------------------- Variants ------------------------------- */

  const variants =
    normalizeVariants(
      raw.variants,
    );

  return {
    ...raw,

    image:
      primaryImage,

    images,

    inventory,

    stock:
      inventory.available,

    variants,
  };
}

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

function normalizeImages(
  images:
    | ProductImage[]
    | string[]
    | undefined,
  fallback: string,
): ProductImage[] {
  if (
    !images ||
    images.length === 0
  ) {
    return fallback
      ? [
          {
            id: "primary",

            url: fallback,

            isPrimary: true,

            sortOrder: 0,
          },
        ]
      : [];
  }

  return images.map(
    (image, index) => {
      if (
        typeof image ===
        "string"
      ) {
        return {
          id: `img-${index}`,

          url: image,

          sortOrder: index,

          isPrimary:
            index === 0,
        };
      }

      return {
        ...image,

        sortOrder:
          image.sortOrder ??
          index,

        isPrimary:
          image.isPrimary ??
          index === 0,
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

function normalizeInventory(
  inventory:
    | ProductInventory
    | undefined,
  stockFallback:
    | number
    | undefined,
): ProductInventory {
  if (inventory) {
    const quantity =
      Number(
        inventory.quantity ??
          0,
      );

    const reservedQty =
      Number(
        inventory.reservedQty ??
          0,
      );

    const available =
      typeof inventory.available ===
      "number"
        ? Math.max(
            0,
            inventory.available,
          )
        : Math.max(
            0,
            quantity -
              reservedQty,
          );

    return {
      quantity,

      reservedQty,

      available,
    };
  }

  const quantity =
    Number(
      stockFallback ?? 0,
    );

  return {
    quantity,

    reservedQty: 0,

    available: Math.max(
      0,
      quantity,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

function normalizeVariants(
  variants:
    | ProductVariant[]
    | undefined,
): ProductVariant[] {
  if (!variants) {
    return [];
  }

  return variants.map(
    (variant) => {
      /*
       * ProductVariant.attributes already has the correct canonical type,
       * but we defensively remove undefined values in case older/mock
       * objects contain them.
       */
      const attributes =
        normalizeVariantAttributes(
          variant.attributes,
        );

      const inventory =
        variant.inventory;

      return {
        ...variant,

        attributes,

        price:
          typeof variant.price ===
          "number"
            ? variant.price
            : undefined,

        inventory:
          inventory
            ? {
                quantity:
                  Number(
                    inventory.quantity ??
                      0,
                  ),

                reservedQty:
                  Number(
                    inventory.reservedQty ??
                      0,
                  ),

                available:
                  typeof inventory.available ===
                  "number"
                    ? Math.max(
                        0,
                        inventory.available,
                      )
                    : Math.max(
                        0,
                        Number(
                          inventory.quantity ??
                            0,
                        ) -
                          Number(
                            inventory.reservedQty ??
                              0,
                          ),
                      ),
              }
            : undefined,
      };
    },
  );
}