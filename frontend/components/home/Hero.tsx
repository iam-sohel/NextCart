"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { getProductImage } from "@/utils/productImages";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

/**
 * NEXTCART — Home hero banner.
 *
 * Receives a backend-sourced product as a prop and renders the
 * existing banner visual. The product slug drives the CTA
 * navigation.
 *
 * This is a client component because MUI's Button uses the
 * Next.js Link component through the component prop.
 */
export default function Hero({ product }: Props) {
  const offerPrice = product.price.toLocaleString("en-IN");

  const originalPrice = (
    product.originalPrice ?? product.price
  ).toLocaleString("en-IN");

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100,
        )
      : 0;

  const image = getProductImage(product);

  return (
    <Box
      component="section"
      aria-label="Featured offer"
      sx={{
        width: "100%",
        bgcolor: "#2A1F18",
        color: "#F4EFE6",
        mt: 2,
        borderRadius: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 3 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.1fr 1fr",
          },
          alignItems: "center",
          gap: { xs: 2, md: 4 },
          minHeight: { xs: 220, md: 280 },
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
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "#F4EFE6",
              opacity: 0.85,
            }}
          >
            <LocalOfferIcon
              sx={{
                fontSize: 18,
                color: "#F15A29",
              }}
            />

            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.08em",
                lineHeight: 1.2,
              }}
            >
              Limited-time offer
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.25rem",
                md: "1.65rem",
              },
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#FFFFFF",
            }}
          >
            {product.title}
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: "0.85rem",
                md: "0.95rem",
              },
              color: "rgba(244, 239, 230, 0.78)",
              maxWidth: 420,
            }}
          >
            {product.description}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "baseline",
              pt: 0.5,
              flexWrap: "wrap",
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "1.35rem",
                  md: "1.6rem",
                },
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              ₹{offerPrice}
            </Typography>

            {product.originalPrice &&
              product.originalPrice > product.price && (
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "rgba(244, 239, 230, 0.55)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{originalPrice}
                </Typography>
              )}

            {discountPct > 0 && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#F15A29",
                  bgcolor: "rgba(241, 90, 41, 0.15)",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                }}
              >
                {discountPct}% OFF
              </Typography>
            )}
          </Stack>

          {/* CTA buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              pt: 1,
              alignItems: {
                xs: "center",
                md: "flex-start",
              },
              flexWrap: "wrap",
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
            }}
          >
            <Button
              component={Link}
              href={`/products/${product.slug}`}
              variant="contained"
              size="medium"
              sx={{
                bgcolor: "#F15A29",
                color: "#FFFFFF",
                fontWeight: 700,
                px: 2.5,
                py: 0.75,
                fontSize: "0.85rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#C8421B",
                },
              }}
            >
              Shop now
            </Button>

            <Button
              component={Link}
              href="/products"
              variant="text"
              size="medium"
              sx={{
                color: "#F4EFE6",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(244, 239, 230, 0.08)",
                },
              }}
            >
              View all deals
            </Button>
          </Stack>
        </Stack>

        {/* Right — product showcase stage */}
        <Box
          sx={{
            position: "relative",
            height: {
              xs: 160,
              md: 220,
            },
            borderRadius: 2,
            bgcolor: "#F4EFE6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            src={image}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 540px"
            style={{
              objectFit: "contain",
              padding: "12px",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}