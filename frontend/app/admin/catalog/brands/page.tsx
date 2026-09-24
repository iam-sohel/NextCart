"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import RestoreIcon from "@mui/icons-material/Restore";

import AdminStatusChip from "@/components/admin/AdminStatusChip";

import {
  createAdminBrand,
  deactivateAdminBrand,
  listAdminBrands,
  restoreAdminBrand,
  updateAdminBrand,
  type AdminBrand,
} from "@/services/adminBrandService";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listAdminBrands(page, rowsPerPage);

      setBrands(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load brands. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadBrands();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadBrands]);

  const openCreateDialog = () => {
    setEditingBrand(null);
    setBrandName("");
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (brand: AdminBrand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingBrand(null);
    setBrandName("");
  };

  const handleSave = async () => {
    const trimmedName = brandName.trim();

    if (!trimmedName || trimmedName.length > 100) {
      setError("Brand name is required and must not exceed 100 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingBrand) {
        await updateAdminBrand(editingBrand.id, trimmedName);
      } else {
        await createAdminBrand(trimmedName);
      }

      closeDialog();
      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save brand. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (brand: AdminBrand) => {
    try {
      setActionLoading(brand.id);
      setError("");

      if (brand.status.toUpperCase() === "ACTIVE") {
        await deactivateAdminBrand(brand.id);
      } else {
        await restoreAdminBrand(brand.id);
      }

      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update brand status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
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
            Brands
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage product brands for the NextCart catalog.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void loadBrands()}
            disabled={loading}
            aria-label="Refresh brand list"
            sx={{ minHeight: 44 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{ minHeight: 44 }}
          >
            Add Brand
          </Button>
        </Box>
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
            label="Search brands"
            placeholder="Search brands..."
            helperText="Search applies to the currently loaded page."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
              },
            }}
          />
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 680 }} aria-label="Product brands">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  ID
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Brand Name
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map(
                    (_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 4 }).map(
                          (_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton
                                variant="text"
                                width="80%"
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </>
              ) : filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 7, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {brands.length === 0
                          ? "No brands found"
                          : "No matching brands on this page"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {brands.length === 0
                          ? "Try another search or create a new brand."
                          : "Search applies to the currently loaded page only. Try a different search."}
                      </Typography>

                      {brands.length > 0 && (
                        <Button
                          size="small"
                          onClick={() => setSearch("")}
                          sx={{ mt: 1.5, minHeight: 44 }}
                        >
                          Clear search
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBrands.map((brand) => {
                  const isActive =
                    brand.status.toUpperCase() === "ACTIVE";

                  const isActionLoading =
                    actionLoading === brand.id;

                  return (
                    <TableRow key={brand.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        #{brand.id}
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {brand.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <AdminStatusChip
                          status={brand.status || "UNKNOWN"}
                          label={brand.status || "UNKNOWN"}
                          tone={isActive ? "success" : "neutral"}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit brand">
                          <IconButton
                            size="small"
                            aria-label={`Edit brand ${brand.id}`}
                            onClick={() => openEditDialog(brand)}
                            disabled={isActionLoading}
                            sx={{ width: 44, height: 44 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            isActive
                              ? "Deactivate brand"
                              : "Restore brand"
                          }
                        >
                          <IconButton
                            size="small"
                            color={isActive ? "error" : "success"}
                            aria-label={`${
                              isActive ? "Deactivate" : "Restore"
                            } brand ${brand.id}`}
                            onClick={() =>
                              handleToggleStatus(brand)
                            }
                            disabled={isActionLoading}
                            sx={{ width: 44, height: 44 }}
                          >
                            {isActionLoading ? (
                              <CircularProgress size={18} />
                            ) : isActive ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <RestoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
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

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="brand-dialog-title"
      >
        <DialogTitle id="brand-dialog-title">
          {editingBrand ? "Edit Brand" : "Create Brand"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Brand Name"
            value={brandName}
            onChange={(event) => setBrandName(event.target.value)}
            margin="normal"
            error={
              brandName.length > 0 &&
              brandName.trim().length > 100
            }
            helperText="Brand name is required and must not exceed 100 characters."
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{ minHeight: 44 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              !brandName.trim() ||
              brandName.trim().length > 100
            }
            sx={{ minHeight: 44 }}
          >
            {saving
              ? "Saving..."
              : editingBrand
                ? "Update"
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}