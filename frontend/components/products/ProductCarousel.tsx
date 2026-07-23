"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "./ProductCard";

interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  offer: string;
}

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={20}
      breakpoints={{
        320: {
          slidesPerView: 2,
        },
        640: {
          slidesPerView: 3,
        },
        900: {
          slidesPerView: 4,
        },
        1200: {
          slidesPerView: 5,
        },
      }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard
            image={product.image}
            title={product.title}
            price={product.price}
            offer={product.offer}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}