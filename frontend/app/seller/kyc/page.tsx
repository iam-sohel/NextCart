"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Link as MuiLink,
  MenuItem,
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
  getMyKyc,
  submitKyc,
  updateKyc,
  uploadKycDocuments,
  type BusinessType,
  type KycDocumentFiles,
  type SellerKycRequest,
  type SellerKycResponse,
} from "@/services/sellerKycService";

const BUSINESS_TYPES: Array<{ value: BusinessType; label: string }> = [
  { value: "PROPRIETORSHIP", label: "Proprietorship" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "LLP", label: "LLP" },
  { value: "PRIVATE_LIMITED", label: "Private Limited" },
  { value: "PUBLIC_LIMITED", label: "Public Limited" },
  { value: "ONE_PERSON_COMPANY", label: "One Person Company" },
  { value: "TRUST", label: "Trust" },
  { value: "SOCIETY", label: "Society" },
  { value: "OTHER", label: "Other" },
];

const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

const EMPTY_FORM: SellerKycRequest = {
  businessType: "PROPRIETORSHIP",
  gstNumber: "",
  registrationNumber: "",
  ownerName: "",
  panNumber: "",
  aadhaarNumber: "",
  businessAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
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

function DocumentLink({ label, url }: { label: string; url?: string | null }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      {url ? (
        <MuiLink href={url} target="_blank" rel="noopener noreferrer" variant="body2">
          View document
        </MuiLink>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Not uploaded
        </Typography>
      )}
    </Box>
  );
}

export default function SellerKycPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [kyc, setKyc] = useState<SellerKycResponse | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const [form, setForm] = useState<SellerKycRequest>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [documents, setDocuments] = useState<KycDocumentFiles>({});
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSaveSuccess(null);

    const res = await getMyKyc();

    if (!res.ok) {
      setLoading(false);

      // Network failure → genuine error. Any other failure on this endpoint
      // means no KYC record exists yet (backend throws when none is found),
      // so we open the submission form.
      if (res.status === 0) {
        setLoadError(res.message);
      } else {
        setKyc(null);
        setForm({ ...EMPTY_FORM });
        setMode("edit");
      }
      return;
    }

    setKyc(res.data);
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
    if (!kyc) return;

    setForm({
      businessType: kyc.businessType,
      gstNumber: kyc.gstNumber ?? "",
      registrationNumber: kyc.registrationNumber ?? "",
      ownerName: kyc.ownerName ?? "",
      panNumber: kyc.panNumber ?? "",
      // Aadhaar is masked by the backend; never prefill a masked value.
      aadhaarNumber: "",
      businessAddress: kyc.businessAddress ?? "",
      city: kyc.city ?? "",
      state: kyc.state ?? "",
      postalCode: kyc.postalCode ?? "",
      country: kyc.country ?? "India",
    });
    setFormError(null);
    setSaveError(null);
    setSaveSuccess(null);
    setMode("edit");
  };

  const validate = (): string | null => {
    if (!form.businessType) return "Business type is required.";
    if (!form.ownerName.trim()) return "Owner name is required.";

    const pan = form.panNumber.trim().toUpperCase();
    if (!pan) return "PAN number is required.";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return "Invalid PAN number.";

    const gst = form.gstNumber?.trim().toUpperCase() ?? "";
    if (gst && !/^[0-9A-Z]{15}$/.test(gst)) return "Invalid GST number.";

    const aadhaar = form.aadhaarNumber?.trim() ?? "";
    if (aadhaar && !/^\d{12}$/.test(aadhaar)) {
      return "Aadhaar number must be 12 digits.";
    }

    if (!form.businessAddress.trim()) return "Business address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.postalCode.trim()) return "Postal code is required.";
    if (form.postalCode.trim().length > 10) {
      return "Postal code must not exceed 10 characters.";
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
    setSaveSuccess(null);
    setSaving(true);

    const payload: SellerKycRequest = {
      businessType: form.businessType,
      gstNumber: form.gstNumber?.trim() || undefined,
      registrationNumber: form.registrationNumber?.trim() || undefined,
      ownerName: form.ownerName.trim(),
      panNumber: form.panNumber.trim().toUpperCase(),
      aadhaarNumber: form.aadhaarNumber?.trim() || undefined,
      businessAddress: form.businessAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    };

    const res = kyc ? await updateKyc(payload) : await submitKyc(payload);

    if (!res.ok) {
      setSaving(false);
      setSaveError(res.message);
      return;
    }

    setKyc(res.data);
    setSaving(false);
    setMode("view");
    setSaveSuccess("KYC details saved. Verification is now pending review.");
  };

  const setDocument = (key: keyof KycDocumentFiles, file: File | null) => {
    setDocError(null);
    setDocSuccess(null);

    if (file) {
      if (file.type !== "application/pdf") {
        setDocError("Only PDF documents are allowed.");
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setDocError("Each document must not exceed 2 MB.");
        return;
      }
    }

    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const handleUpload = async () => {
    const hasAny = Object.values(documents).some(Boolean);

    if (!hasAny) {
      setDocError("Select at least one document to upload.");
      return;
    }

    setDocError(null);
    setDocSuccess(null);
    setUploading(true);

    const res = await uploadKycDocuments(documents);

    if (!res.ok) {
      setUploading(false);
      setDocError(res.message);
      return;
    }

    setKyc(res.data);
    setDocuments({});
    setUploading(false);
    setDocSuccess("Documents uploaded. Verification is now pending review.");
  };

  if (loading) {
    return <SellerPageSkeleton cards={2} />;
  }

  if (loadError) {
    return (
      <SellerErrorState
        message={loadError}
        onRetry={() => void load()}
      />
    );
  }

  const isVerified = kyc?.status === "VERIFIED";

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        KYC / Verification
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Submit your business and identity details for verification.
      </Typography>

      <Stack spacing={3}>
        {saveSuccess && <Alert severity="success">{saveSuccess}</Alert>}

        {!kyc && mode === "edit" && (
          <Alert severity="info">
            No KYC record was found for your account. Submit your details below
            to begin verification.
          </Alert>
        )}

        {/* ── Status ────────────────────────────────────────────────── */}
        {kyc && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Verification status
                  </Typography>
                  <StatusChip status={kyc.status} />
                </Box>

                {!isVerified && mode === "view" && (
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" onClick={startEditing}>
                      Edit details
                    </Button>
                  </Stack>
                )}
              </Stack>

              {kyc.status === "REJECTED" && kyc.rejectionReason && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {kyc.rejectionReason}
                </Alert>
              )}

              {isVerified && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Your KYC is verified and can no longer be modified.
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : "—"}
              </Typography>

              {kyc.reviewedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Reviewed: {new Date(kyc.reviewedAt).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── View details ──────────────────────────────────────────── */}
        {kyc && mode === "view" && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
                Submitted information
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Business type" value={BUSINESS_TYPES.find((b) => b.value === kyc.businessType)?.label ?? kyc.businessType} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Owner name" value={kyc.ownerName || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="PAN number" value={kyc.panNumber || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Aadhaar number" value={kyc.aadhaarNumber || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="GST number" value={kyc.gstNumber || "—"} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Registration number" value={kyc.registrationNumber || "—"} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Business address" value={[kyc.businessAddress, kyc.city, kyc.state, kyc.postalCode, kyc.country].filter(Boolean).join(", ") || "—"} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Documents
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DocumentLink label="PAN document" url={kyc.panDocumentUrl} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DocumentLink label="Aadhaar document" url={kyc.aadhaarDocumentUrl} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DocumentLink label="GST document" url={kyc.gstDocumentUrl} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DocumentLink label="Registration document" url={kyc.registrationDocumentUrl} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DocumentLink label="Address document" url={kyc.addressDocumentUrl} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ── Edit / submit form ────────────────────────────────────── */}
        {mode === "edit" && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {kyc ? "Edit KYC details" : "Submit KYC details"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Fields marked with * are required.
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
                    select
                    fullWidth
                    required
                    label="Business type"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value as BusinessType })}
                    disabled={saving}
                  >
                    {BUSINESS_TYPES.map((b) => (
                      <MenuItem key={b.value} value={b.value}>
                        {b.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Owner name"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="PAN number"
                    value={form.panNumber}
                    onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 10, style: { textTransform: "uppercase" } } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Aadhaar number"
                    helperText={kyc ? "Stored masked. Re-enter 12 digits to keep it, or leave blank." : "Optional"}
                    value={form.aadhaarNumber}
                    onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, "") })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 12, inputMode: "numeric" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="GST number"
                    helperText="15 characters (optional)"
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 15 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Registration number"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Business address"
                    multiline
                    minRows={2}
                    value={form.businessAddress}
                    onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
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

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Postal code"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    disabled={saving}
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => void handleSubmit()}
                  disabled={saving}
                >
                  {saving ? "Saving…" : kyc ? "Save changes" : "Submit KYC"}
                </Button>

                {kyc && (
                  <Button
                    onClick={() => setMode("view")}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* ── Document upload ───────────────────────────────────────── */}
        {kyc && !isVerified && mode === "view" && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Upload documents
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                PDF only, up to 2 MB per document. Uploading documents resets
                your KYC to pending review.
              </Typography>

              {docError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {docError}
                </Alert>
              )}

              {docSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {docSuccess}
                </Alert>
              )}

              <Grid container spacing={2}>
                {(
                  [
                    ["panDocument", "PAN document"],
                    ["aadhaarDocument", "Aadhaar document"],
                    ["gstDocument", "GST document"],
                    ["registrationDocument", "Registration document"],
                    ["addressDocument", "Address document"],
                  ] as Array<[keyof KycDocumentFiles, string]>
                ).map(([key, label]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <TextField
                      fullWidth
                      type="file"
                      label={label}
                      onChange={(e) => {
                        const input = e.target as HTMLInputElement;
                        setDocument(key, input.files?.[0] ?? null);
                      }}
                      disabled={uploading}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { accept: "application/pdf" },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => void handleUpload()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading…" : "Upload documents"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
