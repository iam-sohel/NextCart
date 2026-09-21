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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

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

function statusColor(
  status: AdminSellerKyc["status"],
) {
  switch (status) {
    case "VERIFIED":
      return "success";

    case "REJECTED":
      return "error";

    case "UNDER_REVIEW":
      return "warning";

    default:
      return "default";
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
    void loadKyc();
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
          justifyContent:
            "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
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
            Review and approve seller KYC
            submissions.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
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
          >
            All KYC
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

      <Card
        sx={{
          borderRadius: 3,
        }}
      >
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
            <Table>
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
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      Loading seller KYC...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography
                        color="text.secondary"
                      >
                        No KYC records found.
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
  }}
>
  #{kyc.sellerId}
</Typography>
                      </TableCell>

                      <TableCell>
                        {kyc.ownerName || "-"}
                      </TableCell>

                      <TableCell>
                        {kyc.businessType
                          ? kyc.businessType.replace(
                              /_/g,
                              " ",
                            )
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {kyc.panNumber || "-"}
                      </TableCell>

                      <TableCell>
                        {kyc.gstNumber || "-"}
                      </TableCell>

                      <TableCell>
                        {[
                          kyc.city,
                          kyc.state,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={kyc.status}
                          color={
                            statusColor(
                              kyc.status,
                            ) as
                              | "success"
                              | "error"
                              | "warning"
                              | "default"
                          }
                        />
                      </TableCell>

                      <TableCell>
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
            direction="row"
            spacing={2}
            sx={{
              p: 2,
              alignItems: "center",
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
            >
              Previous
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
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
            >
              Next
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}