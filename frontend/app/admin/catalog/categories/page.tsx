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

import AdminStatusChip from "@/components/admin/AdminStatusChip";

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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadCategories();
    };

    void run();

    return () => {
      cancelled = true;
    };
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category. Please try again."
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category status."
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
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            component="h2"
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
            onClick={() => void loadCategories()}
            disabled={loading}
            aria-label="Refresh category list"
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
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            size="small"
            label="Search categories"
            placeholder="Search categories..."
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
          <Table sx={{ minWidth: 760 }} aria-label="Product categories">
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
                <>
                  {Array.from({ length: 5 }).map(
                    (_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 5 }).map(
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
                        {categories.length === 0
                          ? "No categories found"
                          : "No matching categories on this page"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {categories.length === 0
                          ? "Try another search or create a new category."
                          : "Search applies to the currently loaded page only. Try a different search."}
                      </Typography>

                      {categories.length > 0 && (
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
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        #{category.id}
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {category.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <AdminStatusChip
                          status={category.status || "UNKNOWN"}
                          label={category.status || "UNKNOWN"}
                          tone={
                            isActive ? "success" : "neutral"
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
                            aria-label={`Edit category ${category.id}`}
                            onClick={() =>
                              openEditDialog(category)
                            }
                            disabled={isActionLoading}
                            sx={{ width: 44, height: 44 }}
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
                            aria-label={`${
                              isActive
                                ? "Deactivate"
                                : "Restore"
                            } category ${category.id}`}
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
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
            setRowsPerPage(
              Number(event.target.value)
            );
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
        aria-labelledby="category-dialog-title"
      >
        <DialogTitle id="category-dialog-title">
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
              categoryName.trim().length < 2 ||
              categoryName.trim().length > 100
            }
            sx={{ minHeight: 44 }}
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