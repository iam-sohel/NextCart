"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

import { Box, IconButton, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  title: string;
  images: ProductImage[];
}

/**
 * NEXTCART — Product gallery
 *
 * A polished image viewer for the product details page.
 *
 * Features:
 *   - Large contained stage: products are always shown whole
 *     (object-fit: contain) on a clean neutral surface — never stretched.
 *   - Subtle zoom-on-hover on desktop for a closer look at the product.
 *   - Circular prev/next arrows (auto-hidden when there is only one image).
 *   - Thumbnail rail: horizontal on mobile, wrapping row on desktop.
 *   - Keyboard navigation (←/→) when the gallery has focus.
 *   - Graceful fallback when images is empty or every image fails to load.
 *   - next/image with explicit sizes for predictable layout.
 *
 * Accessibility:
 *   - Each thumbnail is a button with aria-label and aria-current.
 *   - The stage is a region with aria-roledescription="image gallery".
 *   - Arrows have descriptive aria-labels and remain keyboard-focusable.
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
  const currentIndex = Math.min(selectedIndex, visibleImages.length - 1);
  const current = visibleImages[currentIndex];

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
          borderRadius: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          height: { xs: 340, sm: 440, md: 520 },
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
      </Box>
    );
  }

  return (
    <Box>
      {/* Main image stage. */}
      <Box
        ref={regionRef}
        role="region"
        aria-roledescription="image gallery"
        aria-label={`${title} image gallery`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        sx={{
          position: "relative",
          bgcolor: "grey.50",
          borderRadius: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          height: { xs: 340, sm: 440, md: 520 },
          outline: "none",
          cursor: "zoom-in",
          "&:focus-visible": {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
          },
          // Gentle zoom on hover — desktop affordance for a closer look.
          "&:hover .gallery-zoom": {
            transform: "scale(1.06)",
          },
          "&:hover .gallery-arrow": {
            opacity: 1,
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
            p: { xs: 1.5, md: 3 },
          }}
        >
          <Box
            className="gallery-zoom"
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              transition: "transform 0.35s ease",
            }}
          >
            <Image
              src={current.url}
              alt={current.alt ?? title}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 60vw, 560px"
              style={{ objectFit: "contain" }}
              priority
              onError={() => handleThumbError(current.id)}
            />
          </Box>
        </Box>

        {hasMultiple && (
          <>
            <IconButton
              aria-label="Previous image"
              onClick={goPrev}
              className="gallery-arrow"
              sx={{
                position: "absolute",
                top: "50%",
                left: { xs: 8, md: 12 },
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 1,
                width: 36,
                height: 36,
                opacity: { xs: 1, md: 0 },
                transition: "opacity 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  bgcolor: "background.paper",
                  borderColor: "primary.main",
                },
                "&:focus-visible": { opacity: 1 },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Next image"
              onClick={goNext}
              className="gallery-arrow"
              sx={{
                position: "absolute",
                top: "50%",
                right: { xs: 8, md: 12 },
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 1,
                width: 36,
                height: 36,
                opacity: { xs: 1, md: 0 },
                transition: "opacity 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  bgcolor: "background.paper",
                  borderColor: "primary.main",
                },
                "&:focus-visible": { opacity: 1 },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>

            {/* Image counter — reassures users there is more to browse. */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                bottom: 10,
                right: 12,
                px: 1.25,
                py: 0.25,
                borderRadius: 999,
                bgcolor: "rgba(31, 27, 23, 0.55)",
                color: "#FFFFFF",
                fontSize: "0.6875rem",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.02em",
                pointerEvents: "none",
              }}
            >
              {currentIndex + 1} / {visibleImages.length}
            </Box>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {hasMultiple && (
        <Box
          sx={{
            mt: 1.5,
            overflowX: "auto",
            overflowY: "hidden",
            // Slim scrollbar that doesn't overpower the surface.
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 3,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              pb: 1,
              flexWrap: { xs: "nowrap", md: "wrap" },
            }}
          >
            {visibleImages.map((img, index) => {
              const isSelected = index === currentIndex;
              return (
                <Box
                  key={img.id}
                  component="button"
                  type="button"
                  aria-label={`Show image ${index + 1} of ${visibleImages.length}`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    position: "relative",
                    width: { xs: 64, md: 76 },
                    height: { xs: 64, md: 76 },
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: "background.paper",
                    padding: 0,
                    opacity: isSelected ? 1 : 0.85,
                    transition:
                      "border-color 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                      borderColor: isSelected ? "primary.main" : "grey.400",
                      opacity: 1,
                    },
                    "&:focus-visible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                    ...(isSelected && {
                      boxShadow: (theme) =>
                        `0 0 0 3px ${theme.palette.primary.main}22`,
                    }),
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${title} thumbnail ${index + 1}`}
                    fill
                    sizes="76px"
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
