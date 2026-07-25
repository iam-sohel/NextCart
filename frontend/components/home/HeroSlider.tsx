"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import {
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import banners from "@/data/banners";

export default function HeroSlider() {
  const autoplay = Autoplay({
    delay: 4000,
    stopOnInteraction: false,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [autoplay]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Box
      sx={{
        position: "relative",
        mt: 3,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 3,
      }}
    >
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex" }}>
          {banners.map((banner) => (
            <Box
              key={banner.id}
              sx={{
                minWidth: "100%",
                position: "relative",
                height: { xs: 250, md: 450 },
              }}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority
                style={{
                  objectFit: "cover",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,.35)",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 20, md: 60 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                  maxWidth: 500,
                }}
              >
                <Typography
                  component="h2"
                  variant="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: {
                      xs: "2rem",
                      md: "3.5rem",
                    },
                  }}
                >
                  {banner.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ mb: 3 }}
                >
                  {banner.subtitle}
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "#FF6B00",
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {banner.button}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <IconButton
        onClick={scrollPrev}
        sx={{
          position: "absolute",
          left: 15,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "#fff",
          "&:hover": {
            bgcolor: "#fff",
          },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      <IconButton
        onClick={scrollNext}
        sx={{
          position: "absolute",
          right: 15,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "#fff",
          "&:hover": {
            bgcolor: "#fff",
          },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {banners.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor:
                selectedIndex === index ? "#fff" : "rgba(255,255,255,.4)",
              transition: ".3s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}