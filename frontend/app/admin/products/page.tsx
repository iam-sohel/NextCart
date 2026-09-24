"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import AdminStatusChip, {
  type AdminStatusTone,
} from "@/components/admin/AdminStatusChip";

import {
  deactivateAdminProduct,
  listAdminProducts,
  restoreAdminProduct,
  type AdminProduct,
} from "@/services/adminProductService";

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusTone(status: string): AdminStatusTone {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "success";

    case "INACTIVE":
      return "error";

    default:
      return "neutral";
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listAdminProducts(page, rowsPerPage);

      setProducts(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadProducts();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadProducts]);

  const handleToggleActive = async (product: AdminProduct) => {
    if (actionLoading !== null) return;

    const isActive = product.status.toUpperCase() === "ACTIVE";

    try {
      setActionLoading(product.id);
      setError("");

      if (isActive) {
        await deactivateAdminProduct(product.id);
      } else {
        await restoreAdminProduct(product.id);
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        String(product.id).includes(query)
      );
    });
  }, [products, search]);

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700 }}
          >
            Products
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage products available in the NextCart catalog.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadProducts()}
          disabled={loading}
          aria-label="Refresh product list"
          sx={{ minHeight: 44, flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            size="small"
            label="Search current page"
            placeholder="Search name, slug, or product ID"
            helperText="Search covers the currently loaded page only."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                endAdornment: search ? (
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    sx={{ width: 36, height: 36 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
              },
            }}
          />
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1080 }} aria-label="Catalog products">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Product
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Product ID
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Category
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Subcategory
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Brand
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Created
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 8 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton variant="text" width="80%" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ py: 7, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {products.length === 0
                          ? "No products found"
                          : "No matching products on this page"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {products.length === 0
                          ? "The backend returned no products for the current page."
                          : "Search covers the currently loaded page only. Try a different search."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const isActive =
                    product.status.toUpperCase() === "ACTIVE";
                  const isActionLoading =
                    actionLoading === product.id;
                  const productLabel =
                    product.name || `Product #${product.id}`;

                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {product.name || "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {product.slug || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        #{product.id}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Category #{product.categoryId}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Subcategory #{product.subCategoryId}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Brand #{product.brandId}
                      </TableCell>

                      <TableCell>
                        <AdminStatusChip
                          status={product.status || "—"}
                          label={product.status || "—"}
                          tone={statusTone(product.status)}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(product.createdAt)}
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            component={Link}
                            href={`/admin/products/${product.id}`}
                            size="small"
                            variant="outlined"
                            aria-label={`View product ${productLabel}`}
                            sx={{ minHeight: 44 }}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color={isActive ? "error" : "success"}
                            disabled={isActionLoading}
                            aria-label={`${
                              isActive ? "Deactivate" : "Restore"
                            } product ${productLabel}`}
                            onClick={() => void handleToggleActive(product)}
                            sx={{ minHeight: 44 }}
                          >
                            {isActionLoading
                              ? "Updating…"
                              : isActive
                                ? "Deactivate"
                                : "Restore"}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, nextPage) => {
            setPage(nextPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              rowGap: 1,
            },
            "& .MuiTablePagination-actions .MuiIconButton-root": {
              width: 44,
              height: 44,
            },
          }}
        />
      </Paper>
    </Box>
  );
}
