"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import { Box } from "@mui/material";

const banners = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
];

export default function HeroSlider() {
  return (
    <Box sx={{ mt: 2 }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000 }}
        navigation
        pagination={{ clickable: true }}
        loop
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner}>
            <Image
              src={banner}
              alt="Banner"
              width={1600}
              height={450}
              style={{
                width: "100%",
                height: "420px",
                objectFit: "cover",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}