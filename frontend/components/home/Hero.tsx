"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const banners = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Image
        src={banners[current]}
        alt={`Banner ${current + 1}`}
        fill
        priority
        style={{
          objectFit: "cover",
        }}
      />
    </div>
  );
}