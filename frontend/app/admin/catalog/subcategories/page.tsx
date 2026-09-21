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
  MenuItem,
  Paper,
  Select,
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

import { apiRequest } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  status: string;
}

interface SubCategory {
  id: number;
  name: string;
  status: string;
  categoryId: number;
  categoryName: string;
}

interface PageResponse {
  content: SubCategory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function unwrap<T>(response: any): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

function normalizeCategory(value: any): Category {
  return {
    id: Number(value?.id ?? 0),
    name: value?.name ?? "",
    status: value?.status ?? "",
  };
}

function normalizeSubCategory(value: any): SubCategory {
  return {
    id: Number(value?.id ?? 0),
    name: value?.name ?? "",
    status: value?.status ?? "",
    categoryId: Number(
      value?.categoryId ??
        value?.category?.id ??
        0
    ),
    categoryName:
      value?.categoryName ??
      value?.category?.name ??
      "",
  };
}

async function listCategories(): Promise<Category[]> {
  const response = await apiRequest(
    "/api/v1/admin/categories?page=0&size=100&sort=name,asc",
    {
      method: "GET",
    }
  );

  const data = unwrap<any>(response);

  const content = Array.isArray(data?.content)
    ? data.content
    : [];

  return content.map(normalizeCategory);
}

async function listSubCategories(
  page: number,
  size: number
): Promise<PageResponse> {
  const response = await apiRequest(
    `/api/v1/admin/subcategories?page=${page}&size=${size}&sort=name,asc`,
    {
      method: "GET",
    }
  );

  const data = unwrap<any>(response);

  const content = Array.isArray(data?.content)
    ? data.content.map(normalizeSubCategory)
    : [];

  return {
    content,
    page: Number(data?.page ?? page),
    size: Number(data?.size ?? size),
    totalElements: Number(
      data?.totalElements ?? content.length
    ),
    totalPages: Number(
      data?.totalPages ??
        (content.length > 0 ? 1 : 0)
    ),
  };
}

async function createSubCategory(
  name: string,
  categoryId: number
): Promise<SubCategory> {
  const response = await apiRequest(
    "/api/v1/admin/subcategories",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        categoryId,
      }),
    }
  );

  return normalizeSubCategory(
    unwrap<any>(response)
  );
}

async function updateSubCategory(
  id: number,
  name: string,
  categoryId: number
): Promise<SubCategory> {
  const response = await apiRequest(
    `/api/v1/admin/subcategories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name,
        categoryId,
      }),
    }
  );

  return normalizeSubCategory(
    unwrap<any>(response)
  );
}

async function deactivateSubCategory(
  id: number
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/subcategories/${id}`,
    {
      method: "DELETE",
    }
  );
}

async function restoreSubCategory(
  id: number
): Promise<SubCategory> {
  const response = await apiRequest(
    `/api/v1/admin/subcategories/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  return normalizeSubCategory(
    unwrap<any>(response)
  );
}

export default function AdminSubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<
    SubCategory[]
  >([]);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">(
    ""
  );

  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [subCategoryResult, categoryResult] =
        await Promise.all([
          listSubCategories(page, rowsPerPage),
          listCategories(),
        ]);

      setSubCategories(subCategoryResult.content);
      setTotalElements(
        subCategoryResult.totalElements
      );

      setCategories(categoryResult);
    } catch (err: any) {
      console.error(
        "Failed to load subcategories:",
        err
      );

      setError(
        err?.message ||
          "Unable to load subcategories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateDialog = () => {
    setEditingSubCategory(null);
    setName("");
    setCategoryId("");
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (
    subCategory: SubCategory
  ) => {
    setEditingSubCategory(subCategory);
    setName(subCategory.name);
    setCategoryId(
      subCategory.categoryId || ""
    );
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingSubCategory(null);
    setName("");
    setCategoryId("");
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Subcategory name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError(
        "Subcategory name must not exceed 100 characters."
      );
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingSubCategory) {
        await updateSubCategory(
          editingSubCategory.id,
          trimmedName,
          Number(categoryId)
        );
      } else {
        await createSubCategory(
          trimmedName,
          Number(categoryId)
        );
      }

      closeDialog();
      await loadData();
    } catch (err: any) {
      console.error(
        "Failed to save subcategory:",
        err
      );

      setError(
        err?.message ||
          "Unable to save subcategory. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (
    subCategory: SubCategory
  ) => {
    try {
      setActionLoading(subCategory.id);
      setError("");

      if (
        subCategory.status.toUpperCase() === "ACTIVE"
      ) {
        await deactivateSubCategory(
          subCategory.id
        );
      } else {
        await restoreSubCategory(
          subCategory.id
        );
      }

      await loadData();
    } catch (err: any) {
      console.error(
        "Failed to update subcategory status:",
        err
      );

      setError(
        err?.message ||
          "Unable to update subcategory status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubCategories =
    subCategories.filter((subCategory) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return (
        subCategory.name
          .toLowerCase()
          .includes(query) ||
        subCategory.categoryName
          .toLowerCase()
          .includes(query)
      );
    });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent: "space-between",
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
            Subcategories
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage product subcategories and their
            parent categories.
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
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Subcategory
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
            placeholder="Search subcategories or categories..."
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
                  Subcategory
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Category
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
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
              ) : filteredSubCategories.length ===
                0 ? (
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
                        No subcategories found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try another search or create a
                        new subcategory.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubCategories.map(
                  (subCategory) => {
                    const isActive =
                      subCategory.status.toUpperCase() ===
                      "ACTIVE";

                    const isActionLoading =
                      actionLoading ===
                      subCategory.id;

                    return (
                      <TableRow
                        key={subCategory.id}
                        hover
                      >
                        <TableCell>
                          #{subCategory.id}
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{ fontWeight: 600 }}
                          >
                            {subCategory.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {subCategory.categoryName ||
                            `Category #${subCategory.categoryId}`}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              subCategory.status ||
                              "UNKNOWN"
                            }
                            color={
                              isActive
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Edit subcategory">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditDialog(
                                  subCategory
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              isActive
                                ? "Deactivate subcategory"
                                : "Restore subcategory"
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
                                  subCategory
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                            >
                              {isActionLoading ? (
                                <CircularProgress
                                  size={18}
                                />
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
                  }
                )
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
          {editingSubCategory
            ? "Edit Subcategory"
            : "Create Subcategory"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Subcategory Name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            margin="normal"
            error={
              name.length > 0 &&
              name.trim().length > 100
            }
            helperText="Subcategory name is required and must not exceed 100 characters."
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />

          <Select
            fullWidth
            displayEmpty
            value={categoryId}
onChange={(event) =>
  setCategoryId(Number(event.target.value))
}
            sx={{ mt: 1 }}
          >
            <MenuItem value="">
              <em>Select Category</em>
            </MenuItem>

            {categories.map((category) => (
              <MenuItem
                key={category.id}
                value={category.id}
              >
                {category.name}
              </MenuItem>
            ))}
          </Select>
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
              !name.trim() ||
              !categoryId ||
              name.trim().length > 100
            }
          >
            {saving
              ? "Saving..."
              : editingSubCategory
                ? "Update"
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}