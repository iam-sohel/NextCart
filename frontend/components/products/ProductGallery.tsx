"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

import {
  Box,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";

import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  title: string;
  images: ProductImage[];
}

/**
 * NEXTCART — Product gallery
 *
 * A reusable image gallery for product detail pages.
 *
 * Features:
 *   - One main image with optional prev/next arrows (auto-hidden when
 *     there is only one image).
 *   - Vertical thumbnails on desktop, horizontal scroll on mobile.
 *   - Keyboard navigation (←/→) when the gallery has focus.
 *   - Graceful fallback when images is empty or every image fails to load.
 *   - next/image with explicit width/height for predictable layout, and
 *     objectFit: contain so products never stretch.
 *
 * Accessibility:
 *   - Each thumbnail is a button with aria-label and aria-current.
 *   - The main image is wrapped in a region with role="region" and
 *     aria-roledescription="image gallery".
 */
export default function ProductGallery({
  title,
  images,
}: ProductGalleryProps) {
  return (
    <GalleryInner
      key={images.map((img) => img.id).join("|") || "empty"}
      title={title}
      images={images}
    />
  );
}

/**
 * Inner gallery view. The outer `ProductGallery` mounts a new instance
 * whenever the underlying image list changes (variant swap, etc.), which
 * resets the selection index and per-instance error set without an
 * effect-driven setState. This is the React-idiomatic "reset state when a
 * prop changes" pattern.
 */
function GalleryInner({
  title,
  images,
}: ProductGalleryProps) {
  const safeImages = images && images.length > 0 ? images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<string | number>>(
    () => new Set(),
  );
  const regionRef = useRef<HTMLDivElement | null>(null);

  // After image-failure filtering, build the visible list.
  const visibleImages = safeImages.filter(
    (img) => !failedIds.has(img.id),
  );
  const hasMultiple = visibleImages.length > 1;
  const current = visibleImages[Math.min(selectedIndex, visibleImages.length - 1)];

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setSelectedIndex((i) => (i - 1 + visibleImages.length) % visibleImages.length);
  }, [hasMultiple, visibleImages.length]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setSelectedIndex((i) => (i + 1) % visibleImages.length);
  }, [hasMultiple, visibleImages.length]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const handleThumbError = (id: string | number) => {
    setFailedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  if (visibleImages.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          height: { xs: 320, sm: 420, md: 520 },
        }}
      >
        <Box
          component="span"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          Image coming soon
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Main image viewport. */}
      <Box
        ref={regionRef}
        role="region"
        aria-roledescription="image gallery"
        aria-label={`${title} image gallery`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        sx={{
          position: "relative",
          bgcolor: "background.default",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          height: { xs: 320, sm: 420, md: 520 },
          outline: "none",
          "&:focus-visible": {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={current.url}
            alt={current.alt ?? title}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 60vw, 520px"
            style={{ objectFit: "contain" }}
            priority
            onError={() => handleThumbError(current.id)}
          />
        </Box>

        {hasMultiple && (
          <>
            <IconButton
              aria-label="Previous image"
              onClick={goPrev}
              sx={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              ‹
            </IconButton>
            <IconButton
              aria-label="Next image"
              onClick={goNext}
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              ›
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {hasMultiple && (
        <Box
          sx={{
            mt: 2,
            overflowX: "auto",
            overflowY: "hidden",
            // Slimmer scrollbar that doesn't overpower the cream canvas.
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 3,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              pb: 1,
              flexWrap: { xs: "nowrap", md: "wrap" },
            }}
          >
            {visibleImages.map((img, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Box
                  key={img.id}
                  component="button"
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    position: "relative",
                    width: { xs: 72, md: 88 },
                    height: { xs: 72, md: 88 },
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: "background.default",
                    padding: 0,
                    transition: "border-color 0.18s ease",
                    "&:hover": {
                      borderColor: isSelected ? "primary.main" : "text.secondary",
                    },
                    "&:focus-visible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${title} thumbnail ${index + 1}`}
                    fill
                    sizes="88px"
                    style={{ objectFit: "contain" }}
                    onError={() => handleThumbError(img.id)}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
