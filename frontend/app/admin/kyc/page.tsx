"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

import AdminStatusChip, {
  type AdminStatusTone,
} from "@/components/admin/AdminStatusChip";

import {
  AdminSellerKyc,
  listAdminKyc,
} from "@/services/adminKycService";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function statusTone(
  status: AdminSellerKyc["status"],
): AdminStatusTone {
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

export default function AdminKycPage() {
  const [items, setItems] = useState<
    AdminSellerKyc[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [pendingOnly, setPendingOnly] =
    useState(true);

  const [page, setPage] = useState(0);

  const [size] = useState(20);

  const [totalPages, setTotalPages] =
    useState(0);

  const loadKyc = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listAdminKyc({
        pendingOnly,
        page,
        size,
      });

      setItems(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load seller KYC.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pendingOnly, size]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadKyc();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadKyc]);

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
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
            Seller KYC
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Review seller KYC submissions. Approving KYC records an
            admin decision — it does not activate the seller account.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}
        >
          <Button
            variant={
              pendingOnly
                ? "contained"
                : "outlined"
            }
            onClick={() => {
              setPendingOnly(true);
              setPage(0);
            }}
            aria-pressed={pendingOnly}
            sx={{ minHeight: 44 }}
          >
            Pending
          </Button>

          <Button
            variant={
              !pendingOnly
                ? "contained"
                : "outlined"
            }
            onClick={() => {
              setPendingOnly(false);
              setPage(0);
            }}
            aria-pressed={!pendingOnly}
            sx={{ minHeight: 44 }}
          >
            All KYC
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              void loadKyc();
            }}
            disabled={loading}
            aria-label="Refresh KYC list"
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
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void loadKyc();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardContent
          sx={{
            p: 0,
          }}
        >
          <Box
            sx={{
              overflowX: "auto",
            }}
          >
            <Table
              sx={{ minWidth: 1080 }}
              aria-label="Seller KYC records"
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    Seller
                  </TableCell>

                  <TableCell>
                    Owner
                  </TableCell>

                  <TableCell>
                    Business
                  </TableCell>

                  <TableCell>
                    PAN
                  </TableCell>

                  <TableCell>
                    GST
                  </TableCell>

                  <TableCell>
                    Location
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>

                  <TableCell>
                    Submitted
                  </TableCell>

                  <TableCell
                    align="right"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <>
                    {Array.from({ length: 5 }).map(
                      (_, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Array.from({ length: 9 }).map(
                            (_, cellIndex) => (
                              <TableCell key={cellIndex}>
                                <Skeleton
                                  variant="text"
                                  width="80%"
                                />
                              </TableCell>
                            ),
                          )}
                        </TableRow>
                      ),
                    )}
                  </>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {pendingOnly
                          ? "No pending KYC records found."
                          : "No KYC records found."}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {pendingOnly
                          ? "There are currently no seller KYC submissions awaiting review."
                          : "The backend returned no KYC records for the current filter."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((kyc) => (
                    <TableRow
                      key={kyc.id}
                      hover
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          #{kyc.sellerId}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {kyc.ownerName || "-"}
                      </TableCell>

                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {kyc.businessType
                          ? kyc.businessType.replace(
                              /_/g,
                              " ",
                            )
                          : "-"}
                      </TableCell>

                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {kyc.panNumber || "-"}
                      </TableCell>

                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {kyc.gstNumber || "-"}
                      </TableCell>

                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {[
                          kyc.city,
                          kyc.state,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        <AdminStatusChip
                          status={kyc.status}
                          label={kyc.status}
                          tone={statusTone(kyc.status)}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(
                          kyc.submittedAt,
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/admin/kyc/${kyc.sellerId}`}
                          variant="outlined"
                          size="small"
                          aria-label={`Review KYC for seller #${kyc.sellerId}`}
                          sx={{ minHeight: 44 }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              p: 2,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent:
                "flex-end",
            }}
          >
            <Button
              disabled={
                loading || page <= 0
              }
              onClick={() => {
                setPage((current) =>
                  Math.max(0, current - 1),
                );
              }}
              sx={{ minHeight: 44 }}
            >
              Previous
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              role="status"
              sx={{ textAlign: "center" }}
            >
              Page {page + 1}
              {totalPages > 0
                ? ` of ${totalPages}`
                : ""}
            </Typography>

            <Button
              disabled={
                loading ||
                totalPages === 0 ||
                page + 1 >= totalPages
              }
              onClick={() => {
                setPage((current) =>
                  current + 1,
                );
              }}
              sx={{ minHeight: 44 }}
            >
              Next
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}