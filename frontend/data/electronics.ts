import products from "./products";

const electronics = products.filter(
  (product) => product.category === "Mobiles"
);

export default electronics;