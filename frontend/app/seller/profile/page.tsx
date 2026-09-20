"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import useAuthStore from "@/store/authStore";
import {
  deactivateMySellerAccount,
  getMySellerProfile,
  updateMySellerProfile,
  type SellerResponse,
} from "@/services/sellerService";

const MAX_BUSINESS_NAME_LENGTH = 150;

function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
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

<<<<<<< HEAD
<Typography
  component="div"
  variant="body1"
  sx={{ mt: 0.25, wordBreak: "break-word" }}
>
  {value}
</Typography>
=======
      <Box
        component="div"
        sx={{
          mt: 0.25,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Box>
>>>>>>> 1fc831f (fix: harden seller bank and hydration handling)
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={220} height={44} />
      <Skeleton variant="text" width={320} height={24} sx={{ mb: 4 }} />

      <Skeleton
        variant="rounded"
        height={240}
        sx={{ borderRadius: 3, mb: 3 }}
      />
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
    </Box>
  );
}

export default function SellerProfilePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [seller, setSeller] = useState<SellerResponse | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    setSaveError(null);
    setSaveSuccess(null);

    const res = await getMySellerProfile();

    if (!res.ok) {
      setLoading(false);

      // Forward-compatible: the backend currently reports a missing seller
      // profile through its generic error handler, so this branch may not
      // trigger until it returns a dedicated 404 / error code.
      if (res.status === 404 || res.errorCode === "SELLER_NOT_FOUND") {
        setNotFound(true);
      } else {
        setLoadError(res.message);
      }
      return;
    }

    setSeller(res.data);
    setBusinessName(res.data.businessName ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadProfile();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, loadProfile]);

  const handleSave = async () => {
    const trimmed = businessName.trim();

    if (!trimmed) {
      setFieldError("Business name is required.");
      setSaveSuccess(null);
      return;
    }

    if (trimmed.length > MAX_BUSINESS_NAME_LENGTH) {
      setFieldError(
        `Business name must not exceed ${MAX_BUSINESS_NAME_LENGTH} characters.`,
      );
      setSaveSuccess(null);
      return;
    }

    if (saving) return;

    setFieldError(null);
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    const res = await updateMySellerProfile({ businessName: trimmed });

    if (!res.ok) {
      setSaving(false);
      setSaveError(res.message);
      return;
    }

    setSeller(res.data);
    setBusinessName(res.data.businessName ?? "");
    setSaving(false);
    setSaveSuccess("Business name updated successfully.");
  };

  const handleConfirmDeactivate = async () => {
    if (deactivating) return;

    setDeactivating(true);
    setDeactivateError(null);

    const res = await deactivateMySellerAccount();

    if (!res.ok) {
      setDeactivating(false);
      setDeactivateError(res.message);
      return;
    }

    setConfirmOpen(false);
    useAuthStore.getState().logout();
    router.replace("/login");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound) {
    return (
      <Box>
        <Typography
          variant="h3"
          component="h2"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Seller Profile
        </Typography>

        <Card sx={{ borderRadius: 3, maxWidth: 560 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No seller profile found
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We couldn&apos;t find a seller profile linked to your account.
            </Typography>

            <Button component={Link} href="/seller" variant="contained">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box>
        <Typography
          variant="h3"
          component="h2"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Seller Profile
        </Typography>

        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadProfile()}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Box>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 700, mb: 0.5 }}
      >
        Seller Profile
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your seller account details. Only the business name is editable.
      </Typography>

      <Stack spacing={3}>
        {/* ── Read-only details ─────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Account details
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Seller ID" value={seller.sellerId} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="User ID" value={seller.userId} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="First name" value={seller.firstName || "—"} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Last name" value={seller.lastName || "—"} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Email" value={seller.email || "—"} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Phone" value={seller.phone || "—"} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="GST number" value={seller.gstNumber || "—"} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Verification status"
                  value={
                    <Chip
                      size="small"
                      label={seller.verified ? "Verified" : "Not verified"}
                      sx={{
                        bgcolor: seller.verified
                          ? "success.light"
                          : "grey.200",
                        color: seller.verified
                          ? "success.main"
                          : "text.secondary",
                        fontWeight: 700,
                      }}
                    />
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Account status"
                  value={
                    <Chip
                      size="small"
                      label={seller.active ? "Active" : "Inactive"}
                      sx={{
                        bgcolor: seller.active
                          ? "success.light"
                          : "error.light",
                        color: seller.active
                          ? "success.main"
                          : "error.main",
                        fontWeight: 700,
                      }}
                    />
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Editable business name ────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Business name
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Update the business name associated with your seller account.
            </Typography>

            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {saveSuccess}
              </Alert>
            )}

            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Business name"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (fieldError) setFieldError(null);
                if (saveSuccess) setSaveSuccess(null);
              }}
              disabled={saving}
              error={Boolean(fieldError)}
              helperText={
                fieldError ??
                `Maximum ${MAX_BUSINESS_NAME_LENGTH} characters.`
              }
              slotProps={{
                htmlInput: { maxLength: MAX_BUSINESS_NAME_LENGTH },
              }}
            />

            <Box sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                onClick={() => void handleSave()}
                disabled={saving || !businessName.trim()}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ── Danger zone ───────────────────────────────────────────── */}
        <Card
          sx={{
            borderRadius: 3,
            borderColor: "error.main",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 0.5, color: "error.main" }}
            >
              Danger zone
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Deactivating your seller account stops it from being used and ends
              your current session. Your seller profile is not permanently
              deleted.
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDeactivateError(null);
                setConfirmOpen(true);
              }}
            >
              Deactivate seller account
            </Button>
          </CardContent>
        </Card>
      </Stack>

      {/* ── Deactivation confirmation ───────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!deactivating) setConfirmOpen(false);
        }}
        aria-labelledby="seller-deactivate-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="seller-deactivate-title">
          Deactivate seller account?
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: deactivateError ? 2 : 0 }}>
            Your seller account will be deactivated and you will be signed out.
            You can have it reactivated later by an administrator.
          </DialogContentText>

          {deactivateError && (
            <Alert severity="error">{deactivateError}</Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={deactivating}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmDeactivate()}
            disabled={deactivating}
          >
            {deactivating ? "Deactivating…" : "Deactivate seller account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
