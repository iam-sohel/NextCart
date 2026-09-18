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

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";

import {
  addBankAccount,
  deactivateBankAccount,
  getMyBankAccount,
  updateBankAccount,
  type SellerBankRequest,
  type SellerBankResponse,
} from "@/services/sellerBankService";

const EMPTY_FORM: SellerBankRequest = {
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
};

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.25, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function SellerBankPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [bank, setBank] = useState<SellerBankResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<"view" | "form">("view");

  const [form, setForm] = useState<SellerBankRequest>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    setSaveError(null);
    setSaveSuccess(null);

    const res = await getMyBankAccount();

    if (!res.ok) {
      setLoading(false);

      // Only HTTP 404 proves that this singleton is absent. The backend maps
      // its missing-bank IllegalArgumentException through generic HTTP 500
      // handling, so every other failure must remain a retryable API error.
      if (res.status === 404) {
        setBank(null);
        setForm({ ...EMPTY_FORM });
        setMode("form");
        setNotFound(true);
      } else {
        setLoadError(res.message);
      }
      return;
    }

    setBank(res.data);
    setNotFound(false);
    setMode("view");
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

  const startEditing = () => {
    if (!bank) return;

    setForm({
      accountHolderName: bank.accountHolderName ?? "",
      // The backend only ever returns a masked account number, so it must be
      // re-entered on edit.
      accountNumber: "",
      ifscCode: bank.ifscCode ?? "",
      bankName: bank.bankName ?? "",
    });
    setFormError(null);
    setSaveError(null);
    setSaveSuccess(null);
    setMode("form");
  };

  const validate = (): string | null => {
    if (!form.accountHolderName.trim()) {
      return "Account holder name is required.";
    }
    if (!/^[0-9]{9,18}$/.test(form.accountNumber.trim())) {
      return "Account number must be 9 to 18 digits.";
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase())) {
      return "Invalid IFSC code.";
    }
    if (!form.bankName.trim()) {
      return "Bank name is required.";
    }
    return null;
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
    setSaveSuccess(null);
    setSaving(true);

    const payload: SellerBankRequest = {
      accountHolderName: form.accountHolderName.trim(),
      accountNumber: form.accountNumber.trim(),
      ifscCode: form.ifscCode.trim().toUpperCase(),
      bankName: form.bankName.trim(),
    };

    const res = bank
      ? await updateBankAccount(payload)
      : await addBankAccount(payload);

    if (!res.ok) {
      setSaving(false);
      setSaveError(res.message);
      return;
    }

    setBank(res.data);
    setSaving(false);
    setMode("view");
    setSaveSuccess(
      bank
        ? "Bank account updated. Verification is now pending."
        : "Bank account added. Verification is now pending.",
    );
  };

  const handleDeactivate = async () => {
    if (deactivating) return;

    setDeactivating(true);
    setDeactivateError(null);

    const res = await deactivateBankAccount();

    if (!res.ok) {
      setDeactivating(false);
      setDeactivateError(res.message);
      return;
    }

    setBank((prev) => (prev ? { ...prev, active: false } : prev));
    setConfirmOpen(false);
    setDeactivating(false);
    setSaveSuccess("Bank account deactivated.");
  };

  if (loading) {
    return <SellerPageSkeleton cards={2} />;
  }

  if (loadError) {
    return <SellerErrorState message={loadError} onRetry={() => void load()} />;
  }

  const isVerified = bank?.verificationStatus === "VERIFIED";

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Bank Account
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage the bank account used for your payouts.
      </Typography>

      <Stack spacing={3}>
        {saveSuccess && <Alert severity="success">{saveSuccess}</Alert>}

        {notFound && (
          <Alert severity="info">
            No bank account is on file. Add your bank details below.
          </Alert>
        )}

        {/* ── View ──────────────────────────────────────────────────── */}
        {bank && mode === "view" && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {bank.bankName || "Bank account"}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <StatusChip status={bank.verificationStatus} />
                    <StatusChip
                      status={bank.active ? "ACTIVE" : "INACTIVE"}
                      label={bank.active ? "Active" : "Inactive"}
                    />
                  </Stack>
                </Box>

                {!isVerified && (
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" onClick={startEditing} disabled={!bank.active}>
                      Edit
                    </Button>
                    {bank.active && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          setDeactivateError(null);
                          setConfirmOpen(true);
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>

              {isVerified && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your bank account is verified and can no longer be modified.
                </Alert>
              )}

              {!bank.active && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This bank account is deactivated. The backend does not expose
                  a reactivation endpoint — contact support to reactivate it.
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Account holder" value={bank.accountHolderName || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Account number" value={bank.maskedAccountNumber || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="IFSC code" value={bank.ifscCode || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Bank name" value={bank.bankName || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Verified at"
                    value={bank.verifiedAt ? new Date(bank.verifiedAt).toLocaleString() : "—"}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ── Add / edit form ───────────────────────────────────────── */}
        {mode === "form" && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {bank ? "Edit bank account" : "Add bank account"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                All fields are required.
              </Typography>

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

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Account holder name"
                    value={form.accountHolderName}
                    onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Account number"
                    value={form.accountNumber}
                    onChange={(e) =>
                      setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "") })
                    }
                    disabled={saving}
                    helperText="9 to 18 digits"
                    slotProps={{ htmlInput: { maxLength: 18, inputMode: "numeric" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="IFSC code"
                    value={form.ifscCode}
                    onChange={(e) =>
                      setForm({ ...form, ifscCode: e.target.value.toUpperCase() })
                    }
                    disabled={saving}
                    helperText="e.g. HDFC0001234"
                    slotProps={{ htmlInput: { maxLength: 11 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Bank name"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="contained" onClick={() => void handleSubmit()} disabled={saving}>
                  {saving ? "Saving…" : bank ? "Save changes" : "Add bank account"}
                </Button>

                {bank && (
                  <Button onClick={() => setMode("view")} disabled={saving}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* ── Deactivation confirmation ───────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!deactivating) setConfirmOpen(false);
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="bank-deactivate-title"
      >
        <DialogTitle id="bank-deactivate-title">Deactivate bank account?</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: deactivateError ? 2 : 0 }}>
            Your bank account will be deactivated for payouts. This does not
            delete the stored account details.
          </DialogContentText>

          {deactivateError && <Alert severity="error">{deactivateError}</Alert>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={deactivating}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeactivate()}
            disabled={deactivating}
          >
            {deactivating ? "Deactivating…" : "Deactivate bank account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
