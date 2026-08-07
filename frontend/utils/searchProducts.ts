import products from "@/data/products";

export default function searchProducts(query: string) {
  if (!query.trim()) return [];

  const search = query.toLowerCase();

  return products.filter((product) => {
    return (
      product.title.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.keywords.some((keyword) =>
        keyword.toLowerCase().includes(search)
      )
    );
  });
}