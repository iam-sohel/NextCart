"use client";

import { Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

import useCartStore from "@/store/cartStore";

interface Props {
  product: {
    id: number;
    slug: string;
    title: string;
    image: string;
    price: number;
  };
}

export default function ProductActions({
  product,
}: Props) {
  const router = useRouter();

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
    });

    router.push("/cart");
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ mt: 4 }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>

      <Button
        variant="outlined"
        size="large"
      >
        Buy Now
      </Button>
    </Stack>
  );
}