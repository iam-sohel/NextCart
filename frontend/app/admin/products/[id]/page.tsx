"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useParams, useRouter } from "next/navigation";

import {
  getAdminProductDetails,
  type AdminProduct,
} from "@/services/adminProductService";

interface ProductDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  information?: any;
  specifications?: any[];
  images?: any[];
  variants?: any[];
}

function toNumber(value: any): number {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function getImageUrl(image: any): string {
  return (
    image?.imageUrl ??
    image?.url ??
    image?.src ??
    image?.image ??
    ""
  );
}

function getVariantName(variant: any): string {
  return (
    variant?.name ??
    variant?.variantName ??
    variant?.title ??
    variant?.sku ??
    `Variant #${variant?.id ?? "—"}`
  );
}

function getVariantSku(variant: any): string {
  return (
    variant?.sku ??
    variant?.SKU ??
    "—"
  );
}

function getVariantPrice(variant: any): string {
  const price =
    variant?.sellingPrice ??
    variant?.price ??
    variant?.unitSellingPrice ??
    variant?.mrp;

  if (
    price === undefined ||
    price === null ||
    price === ""
  ) {
    return "—";
  }

  return `₹${Number(price).toLocaleString(
    "en-IN"
  )}`;
}

export default function AdminProductDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const productId = toNumber(params?.id);

  const [product, setProduct] =
    useState<ProductDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadProduct = useCallback(
    async () => {
      if (!productId) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result =
          await getAdminProductDetails(
            productId
          );

        setProduct({
          id: toNumber(result?.id),
          name: result?.name ?? "",
          slug: result?.slug ?? "",
          description:
            result?.description ?? "",
          categoryId: toNumber(
            result?.categoryId
          ),
          subCategoryId: toNumber(
            result?.subCategoryId
          ),
          brandId: toNumber(
            result?.brandId
          ),
          information:
            result?.information ?? null,
          specifications:
            Array.isArray(
              result?.specifications
            )
              ? result.specifications
              : [],
          images: Array.isArray(
            result?.images
          )
            ? result.images
            : [],
          variants: Array.isArray(
            result?.variants
          )
            ? result.variants
            : [],
        });
      } catch (err: any) {
        console.error(
          "Failed to load product:",
          err
        );

        setError(
          err?.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            router.push("/admin/products")
          }
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>

        <Alert severity="error">
          {error || "Product not found."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() =>
              router.push("/admin")
            }
          >
            Admin
          </Link>

          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() =>
              router.push("/admin/products")
            }
          >
            Products
          </Link>

          <Typography color="text.primary">
            {product.name || "Product"}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent:
              "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              {product.name ||
                "Unnamed Product"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Product ID: {product.id}
            </Typography>
          </Box>

          <Box
  sx={{
    display: "flex",
    flexDirection: "row",
    gap: 1,
    flexWrap: "wrap",
  }}
>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProduct}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() =>
                router.push(
                  `/seller/products/new?edit=${product.id}`
                )
              }
            >
              Edit Product
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Basic Information */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Product Information
            </Typography>

            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
              }}
            >
              {product.description ||
                "No description available."}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Catalog Mapping
            </Typography>

            <Stack spacing={1.5}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Category
                </Typography>

                <Typography
                  sx={{ fontWeight: 600 }}
                >
                  #{product.categoryId}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Subcategory
                </Typography>

                <Typography
                  sx={{ fontWeight: 600 }}
                >
                  #{product.subCategoryId}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Brand
                </Typography>

                <Typography
                  sx={{ fontWeight: 600 }}
                >
                  #{product.brandId}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Slug
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    wordBreak: "break-word",
                  }}
                >
                  {product.slug || "—"}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Images */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Product Images
        </Typography>

        {product.images &&
        product.images.length > 0 ? (
          <Grid container spacing={2}>
            {product.images.map(
              (image, index) => {
                const imageUrl =
                  getImageUrl(image);

                return (
                  <Grid
                    key={
                      image?.id ??
                      `${imageUrl}-${index}`
                    }
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Box
                      sx={{
                        aspectRatio: "1 / 1",
                        border: "1px solid",
                        borderColor:
                          "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor:
                          "action.hover",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      {imageUrl ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={
                            image?.altText ??
                            product.name
                          }
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit:
                              "contain",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Image URL unavailable
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                );
              }
            )}
          </Grid>
        ) : (
          <Typography
            color="text.secondary"
          >
            No product images available.
          </Typography>
        )}
      </Paper>

      {/* Information */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Additional Information
        </Typography>

        {product.information ? (
          <Grid container spacing={2}>
            {Object.entries(
              product.information
            )
              .filter(
                ([key]) =>
                  key !== "id" &&
                  key !== "productId"
              )
              .map(([key, value]) => (
                <Grid
                  key={key}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {key.replace(
                      /([A-Z])/g,
                      " $1"
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {String(
                      value ?? "—"
                    )}
                  </Typography>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Typography
            color="text.secondary"
          >
            No additional information
            available.
          </Typography>
        )}
      </Paper>

      {/* Specifications */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Specifications
        </Typography>

        {product.specifications &&
        product.specifications.length > 0 ? (
          <Stack divider={<Divider />}>
            {product.specifications.map(
              (specification, index) => (
                <Box
                  key={
                    specification?.id ??
                    index
                  }
                  sx={{ py: 1.5 }}
                >
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        md: 4,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {specification
                          ?.name ??
                          specification
                            ?.key ??
                          "Specification"}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {String(
                          specification
                            ?.value ??
                            specification
                              ?.description ??
                            "—"
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )
            )}
          </Stack>
        ) : (
          <Typography
            color="text.secondary"
          >
            No specifications available.
          </Typography>
        )}
      </Paper>

      {/* Variants */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Product Variants
        </Typography>

        {product.variants &&
        product.variants.length > 0 ? (
          <Box
            sx={{
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                minWidth: 700,
              }}
            >
              {product.variants.map(
                (variant, index) => (
                  <Box
                    key={
                      variant?.id ??
                      index
                    }
                    sx={{
                      py: 2,
                      borderBottom:
                        index ===
                        product.variants!
                          .length -
                          1
                          ? "none"
                          : "1px solid",
                      borderColor:
                        "divider",
                    }}
                  >
                    <Grid
  container
  spacing={2}
  sx={{
    alignItems: "center",
  }}
>
                      <Grid
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {getVariantName(
                            variant
                          )}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          ID:{" "}
                          {variant?.id ??
                            "—"}
                        </Typography>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          SKU
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {getVariantSku(
                            variant
                          )}
                        </Typography>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Price
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {getVariantPrice(
                            variant
                          )}
                        </Typography>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Status
                        </Typography>

                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={
                              variant?.status ??
                              "UNKNOWN"
                            }
                          />
                        </Box>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 3,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Variant Data
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {Object.entries(
                            variant
                          )
                            .filter(
                              ([key]) =>
                                ![
                                  "id",
                                  "sku",
                                  "status",
                                  "name",
                                  "variantName",
                                  "title",
                                ].includes(
                                  key
                                )
                            )
                            .slice(0, 3)
                            .map(
                              ([key, value]) =>
                                `${key}: ${String(
                                  value ?? "—"
                                )}`
                            )
                            .join(" • ") ||
                            "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )
              )}
            </Box>
          </Box>
        ) : (
          <Typography
            color="text.secondary"
          >
            No variants available.
          </Typography>
        )}
      </Paper>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            router.push("/admin/products")
          }
        >
          Back to Products
        </Button>
      </Box>
    </Box>
  );
}