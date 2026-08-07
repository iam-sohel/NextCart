export interface Product {
  id: number;

  title: string;
  slug: string;
  description: string;

  brand: string;
  category: string;

  image: string;
  images: string[];

  price: number;
  originalPrice: number;
  discount: number;

  rating: number;
  reviews: number;

  stock: number;

  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;

  color?: string;
  warranty?: string;
  delivery?: string;
}