export interface Category {
  id: number;
  name: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Mobiles",
    image: "/categories/mobiles.png",
  },
  {
    id: 2,
    name: "Fashion",
    image: "/categories/fashion.png",
  },
  {
    id: 3,
    name: "Electronics",
    image: "/categories/electronics.png",
  },
  {
    id: 4,
    name: "Appliances",
    image: "/categories/appliances.png",
  },
  {
    id: 5,
    name: "Beauty",
    image: "/categories/beauty.png",
  },
  {
    id: 6,
    name: "Gaming",
    image: "/categories/gaming.png",
  },
  {
    id: 7,
    name: "Grocery",
    image: "/categories/grocery.png",
  },
  {
    id: 8,
    name: "Furniture",
    image: "/categories/furniture.png",
  },
];
export default categories;