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
        bgcolor: "secondary.main",
        backgroundImage:
          "radial-gradient(120% 160% at 85% 0%, rgba(241, 90, 41, 0.28) 0%, rgba(241, 90, 41, 0) 55%)",
        color: "#F4EFE6",
        mt: { xs: 1, md: 2 },
        borderRadius: { xs: 0, md: 4 },
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 2.5, sm: 3, md: 4.5 },
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
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: "center",
              bgcolor: "rgba(241, 90, 41, 0.16)",
              border: "1px solid rgba(241, 90, 41, 0.35)",
              borderRadius: 100,
              px: 1.25,
              py: 0.4,
            }}
          >
            <LocalOfferIcon
              sx={{
                fontSize: 16,
                color: "primary.main",
              }}
            />

            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1.2,
                color: "#F8B5A0",
              }}
            >
              Limited-time offer
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.4rem",
                sm: "1.65rem",
                md: "2rem",
              },
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.title}
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: "0.8125rem",
                md: "0.9375rem",
              },
              lineHeight: 1.6,
              color: "rgba(244, 239, 230, 0.75)",
              maxWidth: 440,
              display: "-webkit-box",
              WebkitLineClamp: { xs: 2, md: 3 },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
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
              rowGap: 0.75,
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "1.5rem",
                  md: "1.875rem",
                },
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              ₹{offerPrice}
            </Typography>

            {product.originalPrice &&
              product.originalPrice > product.price && (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "rgba(244, 239, 230, 0.5)",
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
                  fontWeight: 800,
                  color: "#FFFFFF",
                  bgcolor: "primary.main",
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  letterSpacing: "0.02em",
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
              size="large"
              disableElevation
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 700,
                px: 3,
                minHeight: 44,
                borderRadius: 2,
                fontSize: "0.875rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: "none",
                },
              }}
            >
              Shop now
            </Button>

            <Button
              component={Link}
              href="/products"
              variant="text"
              size="large"
              sx={{
                color: "#F4EFE6",
                fontWeight: 600,
                minHeight: 44,
                borderRadius: 2,
                px: 2,
                fontSize: "0.875rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(244, 239, 230, 0.1)",
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
            height: { xs: 190, sm: 230, md: 260 },
            borderRadius: { xs: 2, md: 3 },
            bgcolor: "background.paper",
            backgroundImage:
              "radial-gradient(80% 80% at 50% 30%, rgba(241, 90, 41, 0.08) 0%, rgba(241, 90, 41, 0) 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: 3,
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
              padding: "20px",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}