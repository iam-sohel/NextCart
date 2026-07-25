export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  button: string;
  image: string;
  color: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Mega Electronics Sale",
    subtitle: "Up to 70% OFF on Mobiles & Laptops",
    button: "Shop Now",
    image: "/banners/banner1.jpg",
    color: "#0F172A",
  },
  {
    id: 2,
    title: "Fashion Week",
    subtitle: "Trending Styles Starting ₹299",
    button: "Explore",
    image: "/banners/banner2.jpg",
    color: "#4F46E5",
  },
  {
    id: 3,
    title: "Home & Kitchen",
    subtitle: "Make Your Home Beautiful",
    button: "Buy Now",
    image: "/banners/banner3.jpg",
    color: "#047857",
  },
];

export default banners;