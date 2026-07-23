import { Product } from "@/types/product";

const products: Product[] = [
  {
    id: 1,
    title: "Apple iPhone 16",
    slug: "apple-iphone-16",
    image: "/images/mobiles.png",
    price: 79999,
    originalPrice: 89999,
    discount: 11,
    rating: 4.8,
    reviews: 523,
    brand: "Apple",
    category: "Mobiles",
    stock: 12,
  },
  {
    id: 2,
    title: "Samsung Galaxy S25 Ultra",
    slug: "samsung-galaxy-s25-ultra",
    image: "/images/mobiles.png",
    price: 99999,
    originalPrice: 109999,
    discount: 9,
    rating: 4.7,
    reviews: 418,
    brand: "Samsung",
    category: "Mobiles",
    stock: 8,
  },
];

export default products;