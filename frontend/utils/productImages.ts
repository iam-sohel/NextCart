/**
 * NEXTCART — Product image helpers
 *
 * Centralized image resolution for product cards, product details,
 * search results and other product UI.
 *
 * Important:
 * - Backend images are preferred.
 * - Valid absolute URLs are preserved.
 * - Root-relative backend URLs are preserved.
 * - Missing images use the local product placeholder.
 * - No UI/layout changes are performed here.
 */

export const PRODUCT_PLACEHOLDER = "/placeholders/product.svg";

/**
 * Check whether a value is a usable image URL.
 */
function isValidImageUrl(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

/**
 * Return the best available image for a product.
 *
 * Priority:
 * 1. Product primary image
 * 2. First product image
 * 3. Local placeholder
 */
export function getProductImage(
  product: {
    image?: string | null;
    images?:
      | Array<{
          url?: string | null;
          isPrimary?: boolean;
          sortOrder?: number;
        }>
      | string[];
  },
): string {
  /**
   * Primary product image.
   */
  if (
    isValidImageUrl(product.image)
  ) {
    return product.image.trim();
  }

  /**
   * Product image collection.
   */
  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    /**
     * Prefer explicitly marked primary image.
     */
    const primary = product.images.find(
      (image) =>
        typeof image !== "string" &&
        image.isPrimary === true &&
        isValidImageUrl(image.url),
    );

    if (
      primary &&
      typeof primary !== "string" &&
      isValidImageUrl(primary.url)
    ) {
      return primary.url.trim();
    }

    /**
     * Otherwise use the first valid image.
     */
    for (const image of product.images) {
      if (typeof image === "string") {
        if (isValidImageUrl(image)) {
          return image.trim();
        }

        continue;
      }

      if (
        isValidImageUrl(image.url)
      ) {
        return image.url.trim();
      }
    }
  }

  /**
   * No usable backend/local product image.
   */
  return PRODUCT_PLACEHOLDER;
}

/**
 * Resolve a potentially empty image URL.
 *
 * This helper is useful anywhere an image source is
 * constructed outside normalizeProduct().
 */
export function resolveProductImage(
  image?: string | null,
): string {
  if (isValidImageUrl(image)) {
    return image.trim();
  }

  return PRODUCT_PLACEHOLDER;
}