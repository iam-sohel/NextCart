"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  Box,
  Alert,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useAuthStore from "@/store/authStore";
import useAddressStore from "@/store/addressStore";

import type {
  AddressRequestPayload as AddressRequestDTO,
  AddressResponseDTO,
} from "@/services/addressService";

import {
  validateAddressPhone,
  validatePostalCode,
} from "@/components/auth/validation";

type Mode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; address: AddressResponseDTO };

const EMPTY_FORM: AddressRequestDTO = {
  fullName: "",
  phoneNumber: "",
  streetAddress: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const router = useRouter();

  const token = useAuthStore((s) => s.token);

  const items = useAddressStore((s) => s.items);
  const loading = useAddressStore((s) => s.loading);
  const error = useAddressStore((s) => s.error);

  const fetchAll = useAddressStore((s) => s.fetchAll);
  const create = useAddressStore((s) => s.create);
  const update = useAddressStore((s) => s.update);
  const remove = useAddressStore((s) => s.remove);
  const setDefault = useAddressStore((s) => s.setDefault);
  const clearError = useAddressStore((s) => s.clearError);

  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [form, setForm] = useState<AddressRequestDTO>({
    ...EMPTY_FORM,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth gate + initial fetch
  useEffect(() => {
    if (!token) {
      router.push(
        "/login?reason=login-required&return=/account/addresses",
      );
      return;
    }

    void fetchAll();
  }, [token, router, fetchAll]);

  // Seed/reset the form when changing modes
  useEffect(() => {
    if (mode.kind === "edit") {
      const a = mode.address;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        fullName: a.fullName ?? "",
        phoneNumber: a.phoneNumber ?? "",
        streetAddress: a.streetAddress ?? "",
        landmark: a.landmark ?? "",
        city: a.city ?? "",
        state: a.state ?? "",
        postalCode: a.postalCode ?? "",
        country: a.country ?? "India",
        isDefault: a.isDefault ?? false,
      });
    } else if (mode.kind === "create") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        ...EMPTY_FORM,
      });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormError(null);
  }, [mode]);

  const validateForm = (): string | null => {
    if (!form.fullName.trim()) {
      return "Full name is required.";
    }

    if (!form.streetAddress.trim()) {
      return "Street address is required.";
    }

    if (!form.city.trim()) {
      return "City is required.";
    }

    if (!form.state.trim()) {
      return "State is required.";
    }

    if (!form.country.trim()) {
      return "Country is required.";
    }

    const phoneError = validateAddressPhone(form.phoneNumber);

    if (phoneError) {
      return phoneError;
    }

    const pinError = validatePostalCode(form.postalCode);

    if (pinError) {
      return pinError;
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      if (mode.kind === "edit") {
        const res = await update(mode.address.id, form);

        if (res.ok) {
          setMode({ kind: "list" });
        }
      } else {
        const res = await create(form);

        if (res.ok) {
          setMode({ kind: "list" });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Delete this address?");

      if (!ok) {
        return;
      }
    }

    await remove(id);
  };

  const handleSetDefault = async (id: number) => {
    await setDefault(id);
  };

  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Addresses
          </Typography>

          {mode.kind === "list" && (
            <Button
              variant="contained"
              onClick={() => setMode({ kind: "create" })}
            >
              Add New Address
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {mode.kind === "list" && (
          <>
            {loading && items.length === 0 ? (
              <Typography color="text.secondary">
                Loading addresses…
              </Typography>
            ) : items.length === 0 ? (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    No addresses saved yet
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Add an address to speed up checkout.
                  </Typography>

                  <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => setMode({ kind: "create" })}
                  >
                    Add Your First Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={2}>
                {items.map((a) => (
                  <Card key={a.id} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700 }}
                            >
                              {a.fullName}
                            </Typography>

                            {a.isDefault === true && (
                              <Box
                                sx={{
                                  bgcolor: "primary.main",
                                  color: "primary.contrastText",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                }}
                              >
                                DEFAULT
                              </Box>
                            )}
                          </Box>

                          <Typography color="text.secondary">
                            {a.streetAddress}
                            {a.landmark ? `, ${a.landmark}` : ""}
                          </Typography>

                          <Typography color="text.secondary">
                            {a.city}, {a.state} {a.postalCode}
                          </Typography>

                          <Typography color="text.secondary">
                            {a.country}
                          </Typography>

                          <Typography sx={{ mt: 1, fontWeight: 600 }}>
                            Phone: {a.phoneNumber}
                          </Typography>
                        </Box>

                        <Stack spacing={1}>
                          {a.isDefault !== true && (
                            <IconButton
                              aria-label="Set as default"
                              onClick={() => handleSetDefault(a.id)}
                            >
                              <StarBorderIcon />
                            </IconButton>
                          )}

                          {a.isDefault === true && (
                            <IconButton
                              aria-label="Default address"
                              disabled
                            >
                              <StarIcon sx={{ color: "primary.main" }} />
                            </IconButton>
                          )}

                          <IconButton
                            aria-label="Edit address"
                            onClick={() =>
                              setMode({
                                kind: "edit",
                                address: a,
                              })
                            }
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            aria-label="Delete address"
                            color="error"
                            onClick={() => handleDelete(a.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}

        {(mode.kind === "create" || mode.kind === "edit") && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                {mode.kind === "edit" ? "Edit Address" : "New Address"}
              </Typography>

              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fullName: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number (10 digits)"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phoneNumber: e.target.value,
                      })
                    }
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        maxLength: 10,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={form.streetAddress}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        streetAddress: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Landmark (optional)"
                    value={form.landmark}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        landmark: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={form.city}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        city: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="State"
                    value={form.state}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        state: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Pincode (6 digits)"
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        postalCode: e.target.value,
                      })
                    }
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        maxLength: 6,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={form.country}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        country: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={form.isDefault === true}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            isDefault: e.target.checked,
                          })
                        }
                      />{" "}
                      Set as default address
                    </label>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {mode.kind === "edit"
                    ? "Save Changes"
                    : "Save Address"}
                </Button>

                <Button onClick={() => setMode({ kind: "list" })}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      <Footer />
    </>
  );
}