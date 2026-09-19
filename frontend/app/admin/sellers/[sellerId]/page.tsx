"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AdminStatusChip, {
  type AdminStatusTone,
} from "@/components/admin/AdminStatusChip";
import {
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/AdminStates";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import useAuthStore from "@/store/authStore";
import {
  activateAdminSeller,
  deactivateAdminSeller,
  getAdminSeller,
  type AdminSeller,
} from "@/services/adminSellerService";
import {
  getSellerVerification,
  type SellerVerification,
} from "@/services/adminVerificationService";

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
      <Typography variant="body2" sx={{ mt: 0.25, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function verificationTone(
  status: string | null | undefined,
): AdminStatusTone {
  switch (status) {
    case "APPROVED":
    case "PASSED":
      return "success";
    case "IN_PROGRESS":
    case "REVIEW":
      return "warning";
    case "FAILED":
    case "REJECTED":
      return "error";
    default:
      return "neutral";
  }
}

function sellerDisplayName(seller: AdminSeller): string {
  const name = `${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim();
  return name || `Seller #${seller.sellerId}`;
}

export default function AdminSellerDetailPage() {
  const token = useAuthStore((s) => s.token);
  const params = useParams();
  const rawSellerId = Array.isArray(params?.sellerId)
    ? params.sellerId[0]
    : params?.sellerId;
  const sellerId = Number(rawSellerId);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seller, setSeller] = useState<AdminSeller | null>(null);
  const [verification, setVerification] =
    useState<SellerVerification | null>(null);
  const [verificationWarning, setVerificationWarning] = useState<string | null>(
    null,
  );

  const [confirmAction, setConfirmAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setLoadError(null);
      setVerificationWarning(null);

      const sellerResult = await getAdminSeller(sellerId, signal);
      if (signal?.aborted) return;

      if (!sellerResult.ok) {
        setSeller(null);
        setVerification(null);
        setLoading(false);
        setLoadError(sellerResult.message);
        return;
      }

      const verificationResult = await getSellerVerification(
        sellerResult.data.sellerId,
        signal,
      );
      if (signal?.aborted) return;

      if (!verificationResult.ok) {
        setVerification(null);
        if (verificationResult.status !== 404) {
          setVerificationWarning(verificationResult.message);
        }
      } else {
        setVerification(verificationResult.data);
      }

      setSeller(sellerResult.data);
      setLoading(false);
    },
    [sellerId],
  );

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await load(controller.signal);
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token, load]);

  const openConfirm = (action: "activate" | "deactivate") => {
    setMutationError(null);
    setSuccess(null);
    setConfirmAction(action);
  };

  const handleConfirmStatusChange = async () => {
    if (!seller || !confirmAction || mutating) return;

    setMutating(true);
    setMutationError(null);
    setSuccess(null);

    const result =
      confirmAction === "activate"
        ? await activateAdminSeller(seller.sellerId)
        : await deactivateAdminSeller(seller.sellerId);

    if (!result.ok) {
      setMutating(false);
      setMutationError(result.message);
      return;
    }

    const changedName = sellerDisplayName(seller);
    setConfirmAction(null);
    setMutating(false);
    setSuccess(
      confirmAction === "activate"
        ? `${changedName} was activated.`
        : `${changedName} was deactivated.`,
    );
    await load();
  };

  if (loading) {
    return <AdminLoadingState label="Loading seller…" cards={3} />;
  }

  if (loadError || !seller) {
    return (
      <Stack spacing={2}>
        <Button
          component={Link}
          href="/admin/sellers"
          variant="text"
          sx={{ alignSelf: "flex-start" }}
        >
          Back to sellers
        </Button>
        <AdminErrorState
          message={loadError ?? "Could not load this seller."}
          onRetry={() => void load()}
        />
      </Stack>
    );
  }

  const detailName = sellerDisplayName(seller);

  return (
    <Box>
      <Button
        component={Link}
        href="/admin/sellers"
        variant="text"
        sx={{ mb: 2, px: 0 }}
      >
        Back to sellers
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
          {seller.businessName || detailName}
        </Typography>
        <Stack direction="row" spacing={1}>
          <AdminStatusChip
            status={seller.verified ? "VERIFIED" : "PENDING"}
            label={seller.verified ? "Verified" : "Unverified"}
            tone={seller.verified ? "success" : "neutral"}
          />
          <AdminStatusChip
            status={seller.active ? "ACTIVE" : "INACTIVE"}
            label={seller.active ? "Active" : "Inactive"}
            tone={seller.active ? "success" : "error"}
          />
        </Stack>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Seller #{seller.sellerId} · User #{seller.userId}
      </Typography>

      <Stack spacing={3}>
        {mutationError ? (
          <Alert severity="error" onClose={() => setMutationError(null)}>
            {mutationError}
          </Alert>
        ) : null}

        {success ? (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Seller information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Name" value={detailName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Business name" value={seller.businessName || "—"} />
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
                <InfoField label="Seller ID" value={`#${seller.sellerId}`} />
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              {seller.active ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => openConfirm("deactivate")}
                  aria-label={`Deactivate ${detailName}`}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => openConfirm("activate")}
                  aria-label={`Activate ${detailName}`}
                >
                  Activate
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Automated verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              This is the seller-verification workflow and is separate from the
              seller-KYC approval workflow.
            </Typography>

            {verificationWarning ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Verification details are unavailable: {verificationWarning}
              </Alert>
            ) : null}

            {!verification && !verificationWarning ? (
              <Typography variant="body2" color="text.secondary">
                No automated verification record was found for this seller.
              </Typography>
            ) : null}

            {verification ? (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Overall verification
                  </Typography>
                  <AdminStatusChip
                    status={verification.overallStatus}
                    tone={verificationTone(verification.overallStatus)}
                  />
                </Stack>

                <Grid container spacing={3}>
                  {(
                    [
                      ["Email check", verification.emailStatus, verification.emailResult],
                      ["Mobile check", verification.mobileStatus, verification.mobileResult],
                      ["PAN check", verification.panStatus, verification.panResult],
                      ["GSTIN check", verification.gstinStatus, verification.gstinResult],
                    ] as Array<[string, string | null, string | null]>
                  ).map(([label, status, result]) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={label}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", mb: 0.5 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {label}
                        </Typography>
                        <AdminStatusChip
                          status={status}
                          tone={verificationTone(status)}
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {result || "No result returned."}
                      </Typography>
                    </Grid>
                  ))}

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoField
                      label="Rejection reason"
                      value={verification.rejectionReason || "—"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoField
                      label="Reviewed by"
                      value={
                        verification.reviewedBy !== null
                          ? `Admin #${verification.reviewedBy}`
                          : "—"
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoField
                      label="Reviewed at"
                      value={formatDateTime(verification.reviewedAt)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoField
                      label="Completed at"
                      value={formatDateTime(verification.completedAt)}
                    />
                  </Grid>
                </Grid>
              </>
            ) : null}
          </CardContent>
        </Card>
      </Stack>

      <ConfirmActionDialog
        id="admin-seller-detail-status-change"
        open={confirmAction !== null}
        title={
          confirmAction === "activate"
            ? "Activate seller account?"
            : "Deactivate seller account?"
        }
        description={
          confirmAction
            ? `${confirmAction === "activate" ? "Activate" : "Deactivate"} ${detailName} (Seller #${seller.sellerId}). This changes whether the seller can operate on NextCart.`
            : undefined
        }
        confirmLabel={
          confirmAction === "activate" ? "Activate seller" : "Deactivate seller"
        }
        confirming={mutating}
        tone={confirmAction === "activate" ? "primary" : "danger"}
        onConfirm={() => void handleConfirmStatusChange()}
        onClose={() => {
          if (!mutating) setConfirmAction(null);
        }}
      />
    </Box>
  );
}
