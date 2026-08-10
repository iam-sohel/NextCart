"use client";

import Link from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Typography } from "@mui/material";

import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export default function ProductBreadcrumb({ product }: Props) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 3 }}
    >
      <Link
        href="/"
        style={{ textDecoration: "none", color: "#2874F0" }}
      >
        Home
      </Link>

      <Link
        href="/products"
        style={{ textDecoration: "none", color: "#2874F0" }}
      >
        Products
      </Link>

      <Link
        href={`/category/${product.category.toLowerCase()}`}
        style={{ textDecoration: "none", color: "#2874F0" }}
      >
        {product.category}
      </Link>

      <Typography color="text.primary">
        {product.title}
      </Typography>
    </Breadcrumbs>
  );
}