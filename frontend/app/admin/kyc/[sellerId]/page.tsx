"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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
        <MuiLink
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open document
        </MuiLink>
      ) : (
        <Typography color="text.secondary">
          Not provided
        </Typography>
      )}
    </Box>
  );
}

function Status({ status }: { status: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        px: 1.5,
        py: 0.5,
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        bgcolor:
          status === "VERIFIED"
            ? "success.light"
            : status === "REJECTED"
              ? "error.light"
              : status === "UNDER_REVIEW"
                ? "warning.light"
                : "action.selected",
        color:
          status === "VERIFIED"
            ? "success.dark"
            : status === "REJECTED"
              ? "error.dark"
              : status === "UNDER_REVIEW"
                ? "warning.dark"
                : "text.primary",
      }}
    >
      {status}
    </Box>
  );
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

  async function loadKyc() {
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
  }

  useEffect(() => {
    if (sellerId) {
      void loadKyc();
    }
  }, [sellerId]);

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
      <Box sx={{ py: 6 }}>
        <Typography>
          Loading seller KYC...
        </Typography>
      </Box>
    );
  }

  if (!kyc) {
    return (
      <Box>
        <Alert severity="error">
          {error ||
            "Seller KYC record not found."}
        </Alert>

        <Button
          sx={{ mt: 2 }}
          onClick={() =>
            router.push("/admin/kyc")
          }
        >
          Back to KYC
        </Button>
      </Box>
    );
  }

  return (
    <Box>
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
        <Box>
          <Button
            onClick={() =>
              router.push("/admin/kyc")
            }
            sx={{ mb: 1 }}
          >
            ← Back to KYC
          </Button>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            Seller KYC
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Seller #{kyc.sellerId}
            {" · "}
            {kyc.ownerName ||
              "Unknown owner"}
          </Typography>
        </Box>

        <Status status={kyc.status} />
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
        <Card
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
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

        <Card
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
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

        <Card
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
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

        <Card
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Review History
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
            </Grid>
          </CardContent>
        </Card>

        {kyc.status !== "VERIFIED" ? (
          <Card
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent>
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
                  >
                    Approve KYC
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      setAction("reject")
                    }
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
    </Box>
  );
}