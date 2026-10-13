"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { formatPrice } from "@/utils/formatPrice";

import { getProductImage } from "@/utils/productImages";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

/**
 * HAVLOOK — Home hero banner.
 *
 * Receives a backend-sourced product as a prop and renders a
 * premium-minimalist banner. The product slug drives the CTA
 * navigation.
 *
 * This is a client component because MUI's Button uses the
 * Next.js Link component through the component prop.
 */
export default function Hero({ product }: Props) {
  const title = product.title?.trim() || "Discover something you'll love";
  const description =
    product.description?.trim() ||
    "Explore this product and discover more from our collection.";

  const offerPrice = formatPrice(product.price);
  const originalPrice = formatPrice(
    product.originalPrice ?? product.price,
  );
  const discountPct = product.discount
    ? Math.round(
        ((product.originalPrice ?? product.price) - product.price) /
          (product.originalPrice ?? product.price) * 100,
      )
    : 0;

  const image = getProductImage(product);

  return (
    <Box
      component="section"
      aria-label="Featured offer"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        color: "text.primary",
        mt: { xs: 2, md: 3 },
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 2.5, sm: 3, md: 4.5 },
          pb: { xs: 4, sm: 4.5, md: 6 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.05fr 1fr",
          },
          alignItems: "center",
          gap: { xs: 2.5, md: 6 },
        }}
      >
        {/* Left — copy block */}
        <Stack
          spacing={1.25}
          sx={{
            textAlign: {
              xs: "center",
              md: "left",
            },
            alignItems: {
              xs: "center",
              md: "flex-start",
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.25rem",
                sm: "1.5rem",
                md: "2rem",
              },
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              color: "text.primary",
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontSize: {
                xs: "0.875rem",
                md: "1rem",
              },
              lineHeight: 1.6,
              color: "text.secondary",
              maxWidth: 440,
            }}
          >
            {description}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "baseline",
              pt: 0.5,
              flexWrap: "wrap",
              rowGap: 0.75,
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
            }}
          >
            {discountPct > 0 && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.3,
                  bgcolor: "action.hover",
                  color: "primary.main",
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {discountPct}% OFF
              </Box>
            )}

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: {
                  xs: "1.5rem",
                  md: "1.875rem",
                },
                color: "primary.main",
              }}
            >
              {offerPrice}
            </Typography>

            {product.originalPrice &&
              product.originalPrice > product.price && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textDecoration: "line-through",
                  fontSize: "0.875rem",
                  mr: 1,
                }}
              >
                {originalPrice}
              </Typography>
              )}

            <Button
              component={Link}
              href={`/products/${product.slug}`}
              variant="contained"
              size="large"
              disableElevation
              sx={{
                fontWeight: 700,
                px: 3,
                minHeight: 44,
                borderRadius: 2,
                mt: 1,
              }}
            >
              Shop now
            </Button>
          </Stack>
        </Stack>

        {/* Right — product showcase stage */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 190, sm: 230, md: 260 },
            borderRadius: 3,
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: 1,
          }}
        >
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 540px"
            style={{
              objectFit: "contain",
              padding: "20px",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}