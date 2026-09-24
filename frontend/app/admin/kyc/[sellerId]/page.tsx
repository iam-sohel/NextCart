"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Grid,
  Link as MuiLink,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";

import AdminStatusChip, {
  type AdminStatusTone,
} from "@/components/admin/AdminStatusChip";
import {
  AdminErrorState,
} from "@/components/admin/AdminStates";

import {
  AdminSellerKyc,
  approveAdminKyc,
  getAdminKyc,
  rejectAdminKyc,
} from "@/services/adminKycService";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

function DocumentLink({
  label,
  url,
}: {
  label: string;
  url?: string | null;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>

      {url ? (
        <Button
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          aria-label={`Open ${label} in a new tab`}
          sx={{ minHeight: 44, alignSelf: "flex-start" }}
        >
          Open document
        </Button>
      ) : (
        <Typography color="text.secondary">
          Not provided
        </Typography>
      )}
    </Box>
  );
}

function statusTone(status: string): AdminStatusTone {
  switch (status) {
    case "VERIFIED":
      return "success";

    case "REJECTED":
      return "error";

    case "UNDER_REVIEW":
      return "warning";

    default:
      return "neutral";
  }
}

export default function AdminSellerKycPage() {
  const params = useParams();
  const router = useRouter();

  const sellerId = String(
    params?.sellerId ?? "",
  );

  const [kyc, setKyc] =
    useState<AdminSellerKyc | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [action, setAction] = useState<
    "approve" | "reject" | null
  >(null);

  const [reason, setReason] =
    useState("");

  const [mutating, setMutating] =
    useState(false);

  const [success, setSuccess] =
    useState<string | null>(null);

  const loadKyc = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getAdminKyc(sellerId);

      setKyc(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load seller KYC.",
      );
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadKyc();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [sellerId, loadKyc]);

  async function handleApprove() {
    try {
      setMutating(true);
      setError(null);
      setSuccess(null);

      await approveAdminKyc(sellerId);

      setAction(null);

      setSuccess(
        "Seller KYC approved successfully.",
      );

      await loadKyc();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve seller KYC.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function handleReject() {
    const trimmedReason =
      reason.trim();

    if (!trimmedReason) {
      setError(
        "Please enter a rejection reason.",
      );
      return;
    }

    try {
      setMutating(true);
      setError(null);
      setSuccess(null);

      await rejectAdminKyc(
        sellerId,
        trimmedReason,
      );

      setAction(null);
      setReason("");

      setSuccess(
        "Seller KYC rejected successfully.",
      );

      await loadKyc();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject seller KYC.",
      );
    } finally {
      setMutating(false);
    }
  }

  if (loading) {
    return (
      <Box>
        <Skeleton
          variant="text"
          width={280}
          height={24}
          sx={{ mb: 2 }}
        />
        <Skeleton
          variant="text"
          width={220}
          height={44}
          sx={{ mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={280}
          sx={{ borderRadius: 2, mb: 3 }}
        />
        <Skeleton
          variant="rounded"
          height={220}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    );
  }

  if (!kyc) {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <AdminErrorState
            message={
              error ||
              "Seller KYC record not found."
            }
            onRetry={() => void loadKyc()}
          />
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            router.push("/admin/kyc")
          }
          sx={{ minHeight: 44 }}
        >
          Back to KYC
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs
        sx={{
          mb: 2,
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "wrap",
            rowGap: 0.5,
          },
        }}
        aria-label="KYC location"
      >
        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => router.push("/admin")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <HomeIcon fontSize="small" />
          Admin
        </MuiLink>

        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => router.push("/admin/kyc")}
          sx={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          KYC
        </MuiLink>

        <Typography
          color="text.primary"
          sx={{ overflowWrap: "anywhere" }}
        >
          Seller #{kyc.sellerId}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent:
            "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              overflowWrap: "anywhere",
            }}
          >
            Seller KYC
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5, overflowWrap: "anywhere" }}
          >
            Seller #{kyc.sellerId}
            {" · "}
            {kyc.ownerName ||
              "Unknown owner"}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <AdminStatusChip
            status={kyc.status}
            label={kyc.status}
            tone={statusTone(kyc.status)}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void loadKyc()}
            disabled={loading || mutating}
            aria-label="Refresh KYC record"
            sx={{ minHeight: 44 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() =>
            setSuccess(null)
          }
        >
          {success}
        </Alert>
      ) : null}

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Identity & Business
            </Typography>

            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Owner name"
                  value={kyc.ownerName}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Date of birth"
                  value={kyc.dateOfBirth}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="PAN"
                  value={kyc.panNumber}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Aadhaar"
                  value={kyc.aadhaarNumber}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Business type"
                  value={
                    kyc.businessType?.replace(
                      /_/g,
                      " ",
                    )
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="GST number"
                  value={kyc.gstNumber}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Registration number"
                  value={
                    kyc.registrationNumber
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Seller ID"
                  value={`#${kyc.sellerId}`}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Business Address
            </Typography>

            <Grid
              container
              spacing={3}
            >
              <Grid size={{ xs: 12 }}>
                <Field
                  label="Address"
                  value={
                    kyc.businessAddress
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <Field
                  label="City"
                  value={kyc.city}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <Field
                  label="State"
                  value={kyc.state}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <Field
                  label="Postal code"
                  value={kyc.postalCode}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <Field
                  label="Country"
                  value={kyc.country}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Documents
            </Typography>

            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <DocumentLink
                  label="PAN document"
                  url={
                    kyc.panDocumentUrl
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <DocumentLink
                  label="Aadhaar document"
                  url={
                    kyc.aadhaarDocumentUrl
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <DocumentLink
                  label="GST document"
                  url={
                    kyc.gstDocumentUrl
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <DocumentLink
                  label="Registration document"
                  url={
                    kyc.registrationDocumentUrl
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <DocumentLink
                  label="Address document"
                  url={
                    kyc.addressDocumentUrl
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Review details
            </Typography>

            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Submitted"
                  value={formatDate(
                    kyc.submittedAt,
                  )}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Reviewed"
                  value={formatDate(
                    kyc.reviewedAt,
                  )}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Reviewed by"
                  value={
                    kyc.reviewedBy
                      ? `Admin #${kyc.reviewedBy}`
                      : "-"
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Field
                  label="Rejection reason"
                  value={
                    kyc.rejectionReason
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Created"
                  value={formatDate(
                    kyc.createdAt,
                  )}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Field
                  label="Updated"
                  value={formatDate(
                    kyc.updatedAt,
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {kyc.status !== "VERIFIED" ? (
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                Admin Decision
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 3,
                }}
              >
                Review all submitted
                information before
                changing the KYC status.
              </Typography>

              {action === null ? (
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1.5}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      setAction("approve")
                    }
                    aria-label="Approve this KYC submission"
                    sx={{ minHeight: 44 }}
                  >
                    Approve KYC
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      setAction("reject")
                    }
                    aria-label="Reject this KYC submission"
                    sx={{ minHeight: 44 }}
                  >
                    Reject KYC
                  </Button>
                </Stack>
              ) : null}

              {action === "approve" ? (
                <Stack spacing={2}>
                  <Alert severity="warning">
                    Confirm that you have
                    reviewed the submitted
                    KYC information and
                    documents.
                  </Alert>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1.5}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      disabled={mutating}
                      onClick={() =>
                        void handleApprove()
                      }
                      sx={{ minHeight: 44 }}
                    >
                      {mutating
                        ? "Approving..."
                        : "Confirm Approval"}
                    </Button>

                    <Button
                      variant="outlined"
                      disabled={mutating}
                      onClick={() =>
                        setAction(null)
                      }
                      sx={{ minHeight: 44 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {action === "reject" ? (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Rejection reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target.value,
                      )
                    }
slotProps={{
  htmlInput: {
    maxLength: 1000,
  },
}}
                    helperText={`${reason.length}/1000`}
                    disabled={mutating}
                  />

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1.5}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      disabled={
                        mutating ||
                        !reason.trim()
                      }
                      onClick={() =>
                        void handleReject()
                      }
                      sx={{ minHeight: 44 }}
                    >
                      {mutating
                        ? "Rejecting..."
                        : "Confirm Rejection"}
                    </Button>

                    <Button
                      variant="outlined"
                      disabled={mutating}
                      onClick={() => {
                        setAction(null);
                        setReason("");
                      }}
                      sx={{ minHeight: 44 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/admin/kyc")}
        sx={{ mt: 3, minHeight: 44 }}
      >
        Back to KYC
      </Button>
    </Box>
  );
}