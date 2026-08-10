import products from "./products";
import type { Product } from "@/types/product";

export default function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
