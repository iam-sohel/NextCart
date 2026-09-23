"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import useAuthStore from "@/store/authStore";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";
import PageHeader from "@/components/ops/PageHeader";

import {
  listBrands,
  listCategories,
  listSubCategories,
  type Brand,
  type Category,
  type SubCategory,
} from "@/services/catalogService";
import {
  listWarehouses,
  type WarehouseResponse,
} from "@/services/sellerWarehouseService";
import {
  createProduct,
  type SellerProductCreateRequest,
} from "@/services/sellerProductService";

interface AttributeDraft {
  attributeName: string;
  attributeValue: string;
}

interface VariantDraft {
  sku: string;
  attributes: AttributeDraft[];
  mrp: string;
  sellingPrice: string;
  currency: string;
  warehouseId: string;
  quantity: string;
}

interface SpecificationDraft {
  specificationName: string;
  specificationValue: string;
}

function emptyVariant(): VariantDraft {
  return {
    sku: "",
    attributes: [{ attributeName: "", attributeValue: "" }],
    mrp: "",
    sellingPrice: "",
    currency: "INR",
    warehouseId: "",
    quantity: "",
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

function isActiveOption(status?: string | null): boolean {
  return !status || status === "ACTIVE";
}

function validateImageFiles(files: File[]): string | null {
  for (const file of files) {
    if (file.size === 0) return "Product images cannot be empty.";
    if (!file.type.toLowerCase().startsWith("image/")) {
      return "Only image files are allowed.";
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      return "Each product image must not exceed 5 MB.";
    }
  }
  return null;
}

export default function NewSellerProductPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");

  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [warranty, setWarranty] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  const [specifications, setSpecifications] = useState<SpecificationDraft[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [images, setImages] = useState<File[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [imagesInputKey, setImagesInputKey] = useState(0);

  const activeCategories = categories.filter((category) =>
    isActiveOption(category.status),
  );
  const activeSubCategories = subCategories.filter((subCategory) =>
    isActiveOption(subCategory.status),
  );
  const activeBrands = brands.filter((brand) => isActiveOption(brand.status));
  const activeWarehouses = warehouses.filter((warehouse) =>
    isActiveOption(warehouse.status),
  );

  const startAnotherProduct = () => {
    setCategoryId("");
    setSubCategoryId("");
    setBrandId("");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setShortDescription("");
    setLongDescription("");
    setWarranty("");
    setManufacturer("");
    setSpecifications([]);
    setVariants([emptyVariant()]);
    setImages([]);
    setImagesInputKey((key) => key + 1);
    setFormError(null);
    setSaveError(null);
    setCreatedName(null);
    setCreatedId(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const [categoriesRes, brandsRes, warehousesRes] = await Promise.all([
      listCategories(),
      listBrands(),
      listWarehouses(),
    ]);

    if (!categoriesRes.ok) {
      setLoading(false);
      setLoadError(categoriesRes.message);
      return;
    }

    setCategories(categoriesRes.data);
    setBrands(brandsRes.ok ? brandsRes.data : []);
    setWarehouses(warehousesRes.ok ? warehousesRes.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await load();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, load]);

  // Load subcategories whenever the selected category changes.
  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    const run = async () => {
      const res = await listSubCategories(Number(categoryId));
      if (cancelled) return;
      setSubCategories(res.ok ? res.data : []);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const updateVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );
  };

  const updateAttribute = (
    variantIndex: number,
    attrIndex: number,
    patch: Partial<AttributeDraft>,
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;
        const attributes = variant.attributes.map((attr, a) =>
          a === attrIndex ? { ...attr, ...patch } : attr,
        );
        return { ...variant, attributes };
      }),
    );
  };

  const addAttribute = (variantIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: [
                ...variant.attributes,
                { attributeName: "", attributeValue: "" },
              ],
            }
          : variant,
      ),
    );
  };

  const removeAttribute = (variantIndex: number, attrIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.filter((_, a) => a !== attrIndex),
            }
          : variant,
      ),
    );
  };

  const validate = (): string | null => {
    if (
      !activeCategories.some((category) => String(category.id) === categoryId)
    ) {
      return "Select an active category.";
    }
    if (
      !activeSubCategories.some(
        (subCategory) => String(subCategory.id) === subCategoryId,
      )
    ) {
      return "Select an active subcategory for the selected category.";
    }
    if (!activeBrands.some((brand) => String(brand.id) === brandId)) {
      return "Select an active brand.";
    }
    if (!name.trim()) return "Product name is required.";
    if (name.trim().length > 200) return "Product name must not exceed 200 characters.";
    if (!slug.trim()) return "Product slug is required.";
    if (slug.trim().length > 250) return "Product slug must not exceed 250 characters.";

    if (shortDescription.trim().length > 500) {
      return "Short description must not exceed 500 characters.";
    }
    if (warranty.trim().length > 200) {
      return "Warranty must not exceed 200 characters.";
    }
    if (manufacturer.trim().length > 200) {
      return "Manufacturer must not exceed 200 characters.";
    }

    const specificationNames = new Set<string>();
    for (let i = 0; i < specifications.length; i += 1) {
      const nameValue = specifications[i].specificationName.trim();
      const detailValue = specifications[i].specificationValue.trim();

      if (!nameValue && !detailValue) continue;
      if (!nameValue) return `Specification ${i + 1}: name is required.`;
      if (!detailValue) return `Specification ${i + 1}: value is required.`;

      const normalized = nameValue.toLowerCase();
      if (specificationNames.has(normalized)) {
        return `Specification ${i + 1}: duplicate specification name.`;
      }
      specificationNames.add(normalized);
    }

    if (variants.length === 0) return "At least one variant is required.";

    const skus = new Set<string>();
    for (let i = 0; i < variants.length; i += 1) {
      const variant = variants[i];

      if (!variant.sku.trim()) return `Variant ${i + 1}: SKU is required.`;
      const normalizedSku = variant.sku.trim().toLowerCase();
      if (skus.has(normalizedSku)) {
        return `Variant ${i + 1}: duplicate SKU.`;
      }
      skus.add(normalizedSku);

      const attributes = variant.attributes.filter(
        (attr) => attr.attributeName.trim() && attr.attributeValue.trim(),
      );
      if (attributes.length === 0) {
        return `Variant ${i + 1}: at least one attribute is required.`;
      }

      const attributeNames = new Set<string>();
      for (const attribute of variant.attributes) {
        const attributeName = attribute.attributeName.trim();
        const attributeValue = attribute.attributeValue.trim();
        if (!attributeName && !attributeValue) continue;
        if (!attributeName || !attributeValue) {
          return `Variant ${i + 1}: attribute names and values are required.`;
        }

        const normalizedAttribute = attributeName.toLowerCase();
        if (attributeNames.has(normalizedAttribute)) {
          return `Variant ${i + 1}: duplicate attribute name.`;
        }
        attributeNames.add(normalizedAttribute);
      }

      const mrp = Number(variant.mrp);
      if (!(mrp > 0)) return `Variant ${i + 1}: MRP must be greater than 0.`;

      const sellingPrice = Number(variant.sellingPrice);
      if (!(sellingPrice > 0)) {
        return `Variant ${i + 1}: selling price must be greater than 0.`;
      }
      if (sellingPrice > mrp) {
        return `Variant ${i + 1}: selling price cannot be greater than MRP.`;
      }

      if (!/^[A-Za-z]{3}$/.test(variant.currency.trim())) {
        return `Variant ${i + 1}: currency must be a 3-letter code.`;
      }

      if (variant.warehouseId) {
        if (
          !activeWarehouses.some(
            (warehouse) => String(warehouse.id) === variant.warehouseId,
          )
        ) {
          return `Variant ${i + 1}: select an active warehouse.`;
        }

        const quantity = Number(variant.quantity);
        if (!Number.isInteger(quantity) || quantity < 0) {
          return `Variant ${i + 1}: quantity must be a non-negative whole number.`;
        }
      }
    }

    return validateImageFiles(images);
  };

  const handleSubmit = async () => {
    if (saving) return;

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setSaveError(null);
    setSaving(true);

    const payload: SellerProductCreateRequest = {
      categoryId: Number(categoryId),
      subCategoryId: Number(subCategoryId),
      brandId: Number(brandId),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      information:
        shortDescription.trim() || longDescription.trim() || warranty.trim() || manufacturer.trim()
          ? {
              shortDescription: shortDescription.trim() || undefined,
              longDescription: longDescription.trim() || undefined,
              warranty: warranty.trim() || undefined,
              manufacturer: manufacturer.trim() || undefined,
            }
          : undefined,
      specifications: specifications
        .filter((s) => s.specificationName.trim() && s.specificationValue.trim())
        .map((s) => ({
          specificationName: s.specificationName.trim(),
          specificationValue: s.specificationValue.trim(),
        })),
      variants: variants.map((variant) => ({
        sku: variant.sku.trim(),
        attributes: variant.attributes
          .filter((attr) => attr.attributeName.trim() && attr.attributeValue.trim())
          .map((attr) => ({
            attributeName: attr.attributeName.trim(),
            attributeValue: attr.attributeValue.trim(),
          })),
        price: {
          mrp: Number(variant.mrp),
          sellingPrice: Number(variant.sellingPrice),
          currency: variant.currency.trim().toUpperCase(),
        },
        inventories: variant.warehouseId
          ? [
              {
                warehouseId: Number(variant.warehouseId),
                quantity: Number(variant.quantity || 0),
              },
            ]
          : undefined,
      })),
    };

    const res = await createProduct(payload, images);

    if (!res.ok) {
      setSaving(false);
      setSaveError(res.message);
      return;
    }

    setSaving(false);
    setCreatedName(res.data.name);
    setCreatedId(res.data.id);
  };

  if (loading) {
    return <SellerPageSkeleton cards={2} />;
  }

  if (loadError) {
    return <SellerErrorState message={loadError} onRetry={() => void load()} />;
  }

  return (
    <Box>
      <PageHeader
        title="Add Product"
        subtitle="Create a new product in your catalogue."
      />

      <Stack spacing={3}>
        {createdName !== null && (
          <Alert severity="success">
            Product “{createdName}” created successfully
            {createdId !== null ? ` (ID ${createdId})` : ""}.
          </Alert>
        )}

        {saveError && <Alert severity="error">{saveError}</Alert>}

        {formError && <Alert severity="error">{formError}</Alert>}

        {/* ── Basics ────────────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Basics
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubCategoryId("");
                  }}
                  disabled={saving}
                >
                  {activeCategories.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Subcategory"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  disabled={saving || !categoryId}
                  helperText={!categoryId ? "Select a category first" : undefined}
                >
                  {activeSubCategories.map((sc) => (
                    <MenuItem key={sc.id} value={String(sc.id)}>
                      {sc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Brand"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={saving}
                >
                  {activeBrands.map((b) => (
                    <MenuItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Product name"
                  value={name}
                  onChange={(e) => {
                    const next = e.target.value;
                    setName(next);
                    if (!slugTouched) setSlug(slugify(next));
                  }}
                  disabled={saving}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  disabled={saving}
                  helperText="URL-friendly identifier"
                  slotProps={{ htmlInput: { maxLength: 250 } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  minRows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Information ───────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Short description"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  disabled={saving}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  disabled={saving}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Warranty"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  disabled={saving}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Long description"
                  multiline
                  minRows={3}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  disabled={saving}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Specifications ────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Specifications
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  setSpecifications((prev) => [
                    ...prev,
                    { specificationName: "", specificationValue: "" },
                  ])
                }
                disabled={saving}
                sx={{ minHeight: 44 }}
              >
                Add
              </Button>
            </Stack>

            {specifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Optional. Add key/value specifications such as Material or
                Weight.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {specifications.map((spec, index) => (
                  <Grid container spacing={2} key={index} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={spec.specificationName}
                        onChange={(e) =>
                          setSpecifications((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, specificationName: e.target.value } : s,
                            ),
                          )
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 10, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Value"
                        value={spec.specificationValue}
                        onChange={(e) =>
                          setSpecifications((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, specificationValue: e.target.value } : s,
                            ),
                          )
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 2, sm: 1 }}>
                      <IconButton
                        aria-label="Remove specification"
                        onClick={() =>
                          setSpecifications((prev) => prev.filter((_, i) => i !== index))
                        }
                        disabled={saving}
                        sx={{ width: 44, height: 44 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* ── Variants ──────────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Variants
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
                disabled={saving}
                sx={{ minHeight: 44 }}
              >
                Add variant
              </Button>
            </Stack>

            <Stack spacing={3} divider={<Divider flexItem />}>
              {variants.map((variant, vIndex) => (
                <Box key={vIndex}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Variant {vIndex + 1}
                    </Typography>
                    {variants.length > 1 && (
                      <IconButton
                        aria-label="Remove variant"
                        onClick={() =>
                          setVariants((prev) => prev.filter((_, i) => i !== vIndex))
                        }
                        disabled={saving}
                        sx={{ width: 44, height: 44 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariant(vIndex, { sku: e.target.value })}
                        disabled={saving}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                      <TextField
                        fullWidth
                        required
                        label="MRP"
                        value={variant.mrp}
                        onChange={(e) =>
                          updateVariant(vIndex, { mrp: e.target.value.replace(/[^0-9.]/g, "") })
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: { inputMode: "decimal" } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                      <TextField
                        fullWidth
                        required
                        label="Selling price"
                        value={variant.sellingPrice}
                        onChange={(e) =>
                          updateVariant(vIndex, {
                            sellingPrice: e.target.value.replace(/[^0-9.]/g, ""),
                          })
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: { inputMode: "decimal" } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                      <TextField
                        fullWidth
                        required
                        label="Currency"
                        value={variant.currency}
                        onChange={(e) =>
                          updateVariant(vIndex, { currency: e.target.value.toUpperCase() })
                        }
                        disabled={saving}
                        slotProps={{ htmlInput: { maxLength: 3 } }}
                      />
                    </Grid>
                  </Grid>

                  {/* Attributes */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2.5,
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Attributes
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addAttribute(vIndex)}
                      disabled={saving}
                      sx={{ minHeight: 44 }}
                    >
                      Add attribute
                    </Button>
                  </Stack>

                  <Stack spacing={1.5}>
                    {variant.attributes.map((attr, aIndex) => (
                      <Grid container spacing={2} key={aIndex} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <TextField
                            fullWidth
                            label="Attribute name"
                            value={attr.attributeName}
                            onChange={(e) =>
                              updateAttribute(vIndex, aIndex, {
                                attributeName: e.target.value,
                              })
                            }
                            disabled={saving}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 10, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Attribute value"
                            value={attr.attributeValue}
                            onChange={(e) =>
                              updateAttribute(vIndex, aIndex, {
                                attributeValue: e.target.value,
                              })
                            }
                            disabled={saving}
                            slotProps={{ htmlInput: { maxLength: 255 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 2, sm: 1 }}>
                          {variant.attributes.length > 1 && (
                            <IconButton
                              aria-label="Remove attribute"
                              onClick={() => removeAttribute(vIndex, aIndex)}
                              disabled={saving}
                              sx={{ width: 44, height: 44 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    ))}
                  </Stack>

                  {/* Optional inventory */}
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mt: 2.5, mb: 1.5 }}
                  >
                    Inventory (optional)
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Warehouse"
                        value={variant.warehouseId}
                        onChange={(e) =>
                          updateVariant(vIndex, { warehouseId: e.target.value })
                        }
                        disabled={saving}
                        helperText={
                          activeWarehouses.length === 0
                            ? "No active warehouses are available. Add one first."
                            : "Only active warehouses can receive new inventory."
                        }
                      >
                        {activeWarehouses.map((w) => (
                          <MenuItem key={w.id} value={String(w.id)}>
                            {w.warehouseName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        value={variant.quantity}
                        onChange={(e) =>
                          updateVariant(vIndex, {
                            quantity: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        disabled={saving || !variant.warehouseId}
                        slotProps={{ htmlInput: { inputMode: "numeric" } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* ── Images ────────────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Images
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Optional. Upload one or more image files, no larger than 5 MB each.
            </Typography>

            <TextField
              key={imagesInputKey}
              fullWidth
              type="file"
              label="Product images"
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                const selected = Array.from(input.files ?? []);
                const imageError = validateImageFiles(selected);

                if (imageError) {
                  input.value = "";
                  setImages([]);
                  setFormError(imageError);
                  return;
                }

                setFormError(null);
                setSaveError(null);
                setImages(selected);
              }}
              disabled={saving}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { accept: "image/*", multiple: true },
              }}
            />

            {images.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {images.length} image{images.length > 1 ? "s" : ""} selected
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: "wrap", mt: 1 }}
                >
                  {images.map((file, fileIndex) => (
                    <Chip
                      key={`${file.name}-${file.size}-${fileIndex}`}
                      label={file.name}
                      disabled={saving}
                      onDelete={() =>
                        setImages((previous) =>
                          previous.filter((_, index) => index !== fileIndex),
                        )
                      }
                    />
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={saving || createdId !== null}
            sx={{ minHeight: 44 }}
          >
            {saving ? "Creating…" : "Create product"}
          </Button>

          {createdId !== null && (
            <Button
              variant="outlined"
              onClick={startAnotherProduct}
              disabled={saving}
              sx={{ minHeight: 44 }}
            >
              Start another product
            </Button>
          )}

          <Button
            component={Link}
            href="/seller/products"
            disabled={saving}
            sx={{ minHeight: 44 }}
          >
            Back to products
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
