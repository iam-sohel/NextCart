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
    MenuItem,
    Paper,
    Select,
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
    listAdminCategories,
    type AdminCategory,
} from "@/services/adminCategoryService";

import {
    listAdminSubcategories,
    createAdminSubcategory,
    updateAdminSubcategory,
    deactivateAdminSubcategory,
    restoreAdminSubcategory,
    type AdminSubcategory,
} from "@/services/adminSubcategoryService";

export default function AdminSubCategoriesPage() {
    const [subCategories, setSubCategories] = useState<
        AdminSubcategory[]
    >([]);

    const [categories, setCategories] = useState<AdminCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingSubCategory, setEditingSubCategory] =
        useState<AdminSubcategory | null>(null);

    const [name, setName] = useState("");

    const [categoryId, setCategoryId] = useState<number | "">("");

    const [saving, setSaving] = useState(false);

    /**
     * Load subcategories + categories
     */
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [subCategoryResult, categoryResult] =
                await Promise.all([
                    listAdminSubcategories(page, rowsPerPage),
                    listAdminCategories(0, 100),
                ]);

            setSubCategories(subCategoryResult.content);

            setTotalElements(
                subCategoryResult.totalElements
            );

            setCategories(categoryResult.content);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load subcategories. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage]);

    /**
     * Initial / pagination / page-size load
     *
     * eslint-disable is intentional because this effect
     * loads server data and updates the component state.
     */
    useEffect(() => {
        // Intentional: load server data when pagination or page size changes.
        // loadData updates state after the asynchronous requests complete.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadData();
    }, [loadData]);

    /**
     * Open create dialog
     */
    const openCreateDialog = () => {
        setEditingSubCategory(null);
        setName("");
        setCategoryId("");
        setError("");
        setDialogOpen(true);
    };

    /**
     * Open edit dialog
     */
    const openEditDialog = (
        subCategory: AdminSubcategory
    ) => {
        setEditingSubCategory(subCategory);

        setName(subCategory.name);

        setCategoryId(
            subCategory.categoryId || ""
        );

        setError("");
        setDialogOpen(true);
    };

    /**
     * Close dialog
     */
    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialogOpen(false);
        setEditingSubCategory(null);
        setName("");
        setCategoryId("");
    };

    /**
     * Create / Update
     */
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

        if (categoryId === "") {
            setError("Please select a category.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const selectedCategoryId = Number(categoryId);

            if (editingSubCategory) {
                await updateAdminSubcategory(
                    editingSubCategory.id,
                    trimmedName,
                    selectedCategoryId
                );
            } else {
                await createAdminSubcategory(
                    trimmedName,
                    selectedCategoryId
                );
            }

            setDialogOpen(false);
            setEditingSubCategory(null);
            setName("");
            setCategoryId("");

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to save subcategory. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    /**
     * Activate / Deactivate
     */
    const handleToggleStatus = async (
        subCategory: AdminSubcategory
    ) => {
        try {
            setActionLoading(subCategory.id);
            setError("");

            const isActive =
                subCategory.status.toUpperCase() === "ACTIVE";

            if (isActive) {
                await deactivateAdminSubcategory(
                    subCategory.id
                );
            } else {
                await restoreAdminSubcategory(
                    subCategory.id
                );
            }

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update subcategory status."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Search
     */
    const filteredSubCategories =
        subCategories.filter((subCategory) => {
            const query = search
                .trim()
                .toLowerCase();

            if (!query) {
                return true;
            }

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
        <Box
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },
            }}
        >
            {/* HEADER */}

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
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Subcategories
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Manage product subcategories and
                        their parent categories.
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
                        onClick={() => void loadData()}
                        disabled={loading}
                        sx={{
                            minHeight: 44,
                        }}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreateDialog}
                        sx={{
                            minHeight: 44,
                        }}
                    >
                        Add Subcategory
                    </Button>
                </Box>
            </Box>

            {/* ERROR */}

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                    }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* TABLE */}

            <Paper
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {/* SEARCH */}

                <Box
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                        },
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        label="Search subcategories"
                        placeholder="Search subcategories or categories..."
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

                <TableContainer
                    sx={{
                        overflowX: "auto",
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 820,
                        }}
                        aria-label="Product subcategories"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    ID
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Subcategory
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Category
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Status
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {/* LOADING */}

                            {loading ? (
                                <>
                                    {Array.from({
                                        length: 5,
                                    }).map(
                                        (_, rowIndex) => (
                                            <TableRow
                                                key={rowIndex}
                                            >
                                                {Array.from({
                                                    length: 5,
                                                }).map(
                                                    (
                                                        __,
                                                        cellIndex
                                                    ) => (
                                                        <TableCell
                                                            key={
                                                                cellIndex
                                                            }
                                                        >
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
                            ) : filteredSubCategories.length ===
                            0 ? (
                                /* EMPTY */

                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Box
                                            sx={{
                                                py: 7,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {subCategories.length ===
                                                0
                                                    ? "No subcategories found"
                                                    : "No matching subcategories on this page"}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5,
                                                }}
                                            >
                                                {subCategories.length ===
                                                0
                                                    ? "Try another search or create a new subcategory."
                                                    : "Search applies to the currently loaded page only. Try a different search."}
                                            </Typography>

                                            {subCategories.length >
                                                0 && (
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            setSearch(
                                                                ""
                                                            )
                                                        }
                                                        sx={{
                                                            mt: 1.5,
                                                            minHeight: 44,
                                                        }}
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                /* DATA */

                                filteredSubCategories.map(
                                    (subCategory) => {
                                        const isActive =
                                            subCategory.status
                                                .toUpperCase() ===
                                            "ACTIVE";

                                        const isActionLoading =
                                            actionLoading ===
                                            subCategory.id;

                                        return (
                                            <TableRow
                                                key={
                                                    subCategory.id
                                                }
                                                hover
                                            >
                                                <TableCell
                                                    sx={{
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    #
                                                    {
                                                        subCategory.id
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            overflowWrap:
                                                                "anywhere",
                                                        }}
                                                    >
                                                        {
                                                            subCategory.name
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        overflowWrap:
                                                            "anywhere",
                                                    }}
                                                >
                                                    {subCategory.categoryName ||
                                                        `Category #${subCategory.categoryId}`}
                                                </TableCell>

                                                <TableCell>
                                                    <AdminStatusChip
                                                        status={
                                                            subCategory.status ||
                                                            "UNKNOWN"
                                                        }
                                                        label={
                                                            subCategory.status ||
                                                            "UNKNOWN"
                                                        }
                                                        tone={
                                                            isActive
                                                                ? "success"
                                                                : "neutral"
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Tooltip
                                                        title="Edit subcategory"
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            aria-label={`Edit subcategory ${subCategory.id}`}
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    subCategory
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            sx={{
                                                                width: 44,
                                                                height: 44,
                                                            }}
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
                                                            aria-label={`${isActive ? "Deactivate" : "Restore"} subcategory ${subCategory.id}`}
                                                            onClick={() =>
                                                                void handleToggleStatus(
                                                                    subCategory
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            sx={{
                                                                width: 44,
                                                                height: 44,
                                                            }}
                                                        >
                                                            {isActionLoading ? (
                                                                <CircularProgress
                                                                    size={
                                                                        18
                                                                    }
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

                {/* PAGINATION */}

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
                    rowsPerPageOptions={[
                        10,
                        20,
                        50,
                    ]}
                    sx={{
                        "& .MuiTablePagination-toolbar": {
                            flexWrap: "wrap",
                            rowGap: 1,
                        },
                        "& .MuiTablePagination-actions .MuiIconButton-root":
                            {
                                width: 44,
                                height: 44,
                            },
                    }}
                />
            </Paper>

            {/* CREATE / EDIT DIALOG */}

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                aria-labelledby="subcategory-dialog-title"
            >
                <DialogTitle id="subcategory-dialog-title">
                    {editingSubCategory
                        ? "Edit Subcategory"
                        : "Create Subcategory"}
                </DialogTitle>

                <DialogContent>
                    {/* NAME */}

                    <TextField
                        autoFocus
                        fullWidth
                        label="Subcategory Name"
                        value={name}
                        onChange={(event) => {
                            setName(
                                event.target.value
                            );
                        }}
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

                    {/* CATEGORY */}

                    <Select
                        fullWidth
                        displayEmpty
                        aria-label="Parent category"
                        value={categoryId}
                        onChange={(event) => {
                            const value =
                                event.target.value as
                                    | string
                                    | number;

                            setCategoryId(
                                value === ""
                                    ? ""
                                    : Number(value)
                            );
                        }}
                        sx={{
                            mt: 1,
                            minHeight: 44,
                        }}
                    >
                        <MenuItem value="">
                            <em>
                                Select Category
                            </em>
                        </MenuItem>

                        {categories.map(
                            (category) => (
                                <MenuItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </MenuItem>
                            )
                        )}
                    </Select>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >
                    <Button
                        onClick={closeDialog}
                        disabled={saving}
                        sx={{
                            minHeight: 44,
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            void handleSave()
                        }
                        disabled={
                            saving ||
                            !name.trim() ||
                            categoryId === "" ||
                            name.trim().length > 100
                        }
                        sx={{
                            minHeight: 44,
                        }}
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