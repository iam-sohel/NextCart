"use client";

import Link from "next/link";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Typography } from "@mui/material";

import type { Product } from "@/types/product";

interface ProductBreadcrumbProps {
  product: Product;
}

/**
 * NEXTCART — ProductBreadcrumb
 *
 * Breadcrumb trail for the product details page.
 *
 * Trail:
 *   Home → Products → {Category} → {Product title}
 *
 * The category link goes to the search page filtered by category. We
 * don't link to a per-category route because NextCart does not expose
 * one — the search page is the canonical listing surface and the URL is
 * easier to share.
 */
export default function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  const categoryHref = `/search?category=${encodeURIComponent(
    product.category,
  )}`;

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 3 }}
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Typography
          component="span"
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          Home
        </Typography>
      </Link>

      <Link
        href="/products"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Typography
          component="span"
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          Products
        </Typography>
      </Link>

      <Link
        href={categoryHref}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Typography
          component="span"
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          {product.category}
        </Typography>
      </Link>

      <Typography color="text.primary">{product.title}</Typography>
    </Breadcrumbs>
  );
}
