"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
    } catch (err: any) {
      console.error("Failed to load brands:", err);
      setError(
        err?.message || "Unable to load brands. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadBrands();
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
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      setError(
        err?.message || "Unable to save brand. Please try again."
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
    } catch (err: any) {
      console.error("Failed to update brand status:", err);
      setError(
        err?.message || "Unable to update brand status."
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            onClick={loadBrands}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
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
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search brands..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </Box>

        <TableContainer>
          <Table>
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
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box
                      sx={{
                        py: 7,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 7, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        No brands found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try another search or create a new brand.
                      </Typography>
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
                      <TableCell>#{brand.id}</TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {brand.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={brand.status || "UNKNOWN"}
                          color={isActive ? "success" : "default"}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit brand">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(brand)}
                            disabled={isActionLoading}
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
                            onClick={() =>
                              handleToggleStatus(brand)
                            }
                            disabled={isActionLoading}
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
        />
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
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

        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
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