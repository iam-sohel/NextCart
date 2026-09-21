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
  TablePagination,
  TableHead,
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
  createAdminCategory,
  deactivateAdminCategory,
  listAdminCategories,
  restoreAdminCategory,
  updateAdminCategory,
  type AdminCategory,
} from "@/services/adminCategoryService";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listAdminCategories(page, rowsPerPage);

      setCategories(result.content);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      console.error("Failed to load categories:", err);

      setError(
        err?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: AdminCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSave = async () => {
    const trimmedName = categoryName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError(
        "Category name must be between 2 and 100 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCategory) {
        await updateAdminCategory(
          editingCategory.id,
          trimmedName
        );
      } else {
        await createAdminCategory(trimmedName);
      }

      closeDialog();
      await loadCategories();
    } catch (err: any) {
      console.error("Failed to save category:", err);

      setError(
        err?.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (
    category: AdminCategory
  ) => {
    try {
      setActionLoading(category.id);
      setError("");

      if (
        category.status.toUpperCase() === "ACTIVE"
      ) {
        await deactivateAdminCategory(category.id);
      } else {
        await restoreAdminCategory(category.id);
      }

      await loadCategories();
    } catch (err: any) {
      console.error(
        "Failed to update category status:",
        err
      );

      setError(
        err?.message ||
          "Unable to update category status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())
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
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Categories
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage product categories for the NextCart
            catalog.
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
            onClick={loadCategories}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Category
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
            placeholder="Search categories..."
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
                  Category Name
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Created
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
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
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        py: 7,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 600 }}
                      >
                        No categories found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try another search or create a new
                        category.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => {
                  const isActive =
                    category.status.toUpperCase() ===
                    "ACTIVE";

                  const isActionLoading =
                    actionLoading === category.id;

                  return (
                    <TableRow
                      key={category.id}
                      hover
                    >
                      <TableCell>
                        #{category.id}
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{ fontWeight: 600 }}
                        >
                          {category.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            category.status || "UNKNOWN"
                          }
                          color={
                            isActive
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Edit category">
                          <IconButton
                            size="small"
                            onClick={() =>
                              openEditDialog(category)
                            }
                            disabled={isActionLoading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            isActive
                              ? "Deactivate category"
                              : "Restore category"
                          }
                        >
                          <IconButton
                            size="small"
                            color={
                              isActive
                                ? "error"
                                : "success"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
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
            setRowsPerPage(
              Number(event.target.value)
            );
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
          {editingCategory
            ? "Edit Category"
            : "Create Category"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
            margin="normal"
            error={
              categoryName.length > 0 &&
              (categoryName.trim().length < 2 ||
                categoryName.trim().length > 100)
            }
            helperText="Category name must be between 2 and 100 characters."
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              categoryName.trim().length < 2 ||
              categoryName.trim().length > 100
            }
          >
            {saving
              ? "Saving..."
              : editingCategory
                ? "Update"
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}