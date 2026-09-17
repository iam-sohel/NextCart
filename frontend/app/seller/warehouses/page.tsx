"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerEmptyState,
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";

import {
  createWarehouse,
  deactivateWarehouse,
  listWarehouses,
  updateWarehouse,
  type WarehouseCreateRequest,
  type WarehouseResponse,
} from "@/services/sellerWarehouseService";

const EMPTY_FORM: WarehouseCreateRequest = {
  warehouseName: "",
  contactPerson: "",
  phoneNumber: "",
  streetAddress: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function SellerWarehousesPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseResponse | null>(null);
  const [form, setForm] = useState<WarehouseCreateRequest>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [deactivateTarget, setDeactivateTarget] = useState<WarehouseResponse | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const res = await listWarehouses();

    if (!res.ok) {
      setLoading(false);
      setLoadError(res.message);
      return;
    }

    setWarehouses(res.data);
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEdit = (warehouse: WarehouseResponse) => {
    setEditing(warehouse);
    setForm({
      warehouseName: warehouse.warehouseName ?? "",
      contactPerson: warehouse.contactPerson ?? "",
      phoneNumber: warehouse.phoneNumber ?? "",
      streetAddress: warehouse.streetAddress ?? "",
      landmark: warehouse.landmark ?? "",
      city: warehouse.city ?? "",
      state: warehouse.state ?? "",
      postalCode: warehouse.postalCode ?? "",
      country: warehouse.country ?? "India",
    });
    setFormError(null);
    setSaveError(null);
    setDialogOpen(true);
  };

  const validate = (): string | null => {
    if (!form.warehouseName.trim()) return "Warehouse name is required.";
    if (!form.contactPerson.trim()) return "Contact person is required.";
    if (!/^[6-9][0-9]{9}$/.test(form.phoneNumber.trim())) {
      return "Enter a valid 10-digit Indian phone number.";
    }
    if (!form.streetAddress.trim()) return "Street address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!/^[0-9]{6}$/.test(form.postalCode.trim())) {
      return "Enter a valid 6-digit postal code.";
    }
    if (!form.country.trim()) return "Country is required.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setSaveError(null);
    setSaving(true);

    const res = editing
      ? await updateWarehouse(editing.id, {
          warehouseName: form.warehouseName.trim(),
          contactPerson: form.contactPerson.trim(),
          phoneNumber: form.phoneNumber.trim(),
          streetAddress: form.streetAddress.trim(),
          landmark: form.landmark?.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        })
      : await createWarehouse({
          ...form,
          warehouseName: form.warehouseName.trim(),
          contactPerson: form.contactPerson.trim(),
          phoneNumber: form.phoneNumber.trim(),
          streetAddress: form.streetAddress.trim(),
          landmark: form.landmark?.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        });

    if (!res.ok) {
      setSaving(false);
      setSaveError(res.message);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    setSuccess(editing ? "Warehouse updated." : "Warehouse created.");
    await load();
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget || deactivating) return;

    setDeactivating(true);
    setDeactivateError(null);

    const res = await deactivateWarehouse(deactivateTarget.id);

    if (!res.ok) {
      setDeactivating(false);
      setDeactivateError(res.message);
      return;
    }

    setDeactivating(false);
    setDeactivateTarget(null);
    setSuccess("Warehouse deactivated.");
    await load();
  };

  if (loading) {
    return <SellerPageSkeleton cards={2} />;
  }

  if (loadError) {
    return <SellerErrorState message={loadError} onRetry={() => void load()} />;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Warehouses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage the locations you ship from.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add warehouse
        </Button>
      </Stack>

      <Stack spacing={3}>
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {warehouses.length === 0 ? (
          <SellerEmptyState
            title="No warehouses yet"
            description="Add a warehouse to start storing inventory and fulfilling orders."
            action={
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                Add warehouse
              </Button>
            }
          />
        ) : (
          <Grid container spacing={3}>
            {warehouses.map((warehouse) => (
              <Grid size={{ xs: 12, md: 6 }} key={warehouse.id}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
                        {warehouse.warehouseName}
                      </Typography>
                      <StatusChip status={warehouse.status} />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {warehouse.contactPerson} · {warehouse.phoneNumber}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {[warehouse.streetAddress, warehouse.landmark, warehouse.city, warehouse.state, warehouse.postalCode, warehouse.country]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>

                    <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(warehouse)}
                      >
                        Edit
                      </Button>

                      {warehouse.status === "ACTIVE" && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<BlockIcon />}
                          onClick={() => {
                            setDeactivateError(null);
                            setDeactivateTarget(warehouse);
                          }}
                        >
                          Deactivate
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* ── Create / edit dialog ────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) setDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="warehouse-dialog-title"
      >
        <DialogTitle id="warehouse-dialog-title">
          {editing ? "Edit warehouse" : "Add warehouse"}
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Warehouse name"
                value={form.warehouseName}
                onChange={(e) => setForm({ ...form, warehouseName: e.target.value })}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 150 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Contact person"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 150 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Phone number"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "") })
                }
                disabled={saving}
                helperText="10 digits"
                slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Postal code"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value.replace(/\D/g, "") })
                }
                disabled={saving}
                helperText="6 digits"
                slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Street address"
                value={form.streetAddress}
                onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Landmark"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                disabled={saving}
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                disabled={saving}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Create warehouse"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Deactivate confirmation ─────────────────────────────────── */}
      <Dialog
        open={Boolean(deactivateTarget)}
        onClose={() => {
          if (!deactivating) setDeactivateTarget(null);
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="warehouse-deactivate-title"
      >
        <DialogTitle id="warehouse-deactivate-title">Deactivate warehouse?</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: deactivateError ? 2 : 0 }}>
            {deactivateTarget?.warehouseName} will be deactivated and will no
            longer be available for fulfilment.
          </DialogContentText>

          {deactivateError && <Alert severity="error">{deactivateError}</Alert>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeactivateTarget(null)} disabled={deactivating}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeactivate()}
            disabled={deactivating}
          >
            {deactivating ? "Deactivating…" : "Deactivate warehouse"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
