"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerEmptyState,
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";
import {
  getSellerEarning,
  getSellerEarningsSummary,
  listSellerEarnings,
  type SellerEarning,
  type SellerEarningPage,
  type SellerEarningSort,
  type SellerEarningSummary,
} from "@/services/sellerEarningService";
import { formatAmount, formatCount, formatDateTime } from "@/utils/formatAmount";

const PAGE_SIZES = [10, 20, 50];

const SORTS: Array<{ value: SellerEarningSort; label: string }> = [
  { value: "createdAt,desc", label: "Newest first" },
  { value: "createdAt,asc", label: "Oldest first" },
];

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Grid>
  );
}

function EarningDetailDialog({
  earningId,
  onClose,
}: {
  earningId: number | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earning, setEarning] = useState<SellerEarning | null>(null);

  const load = useCallback(async () => {
    if (earningId === null) return;

    setLoading(true);
    setError(null);

    const result = await getSellerEarning(earningId);

    if (!result.ok) {
      setEarning(null);
      setLoading(false);
      setError(result.message);
      return;
    }

    setEarning(result.data);
    setLoading(false);
  }, [earningId]);

  useEffect(() => {
    if (earningId === null) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await load();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [earningId, load]);

  return (
    <Dialog
      open={earningId !== null}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="seller-earning-title"
    >
      <DialogTitle id="seller-earning-title">Earning details</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading earning…
          </Typography>
        ) : null}

        {!loading && error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void load()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        {!loading && !error && earning ? (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Earning #{earning.id}
              </Typography>
              <StatusChip status={earning.status} />
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Gross
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatAmount(earning.grossAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Commission
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatAmount(earning.commissionAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Net
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatAmount(earning.netAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {formatCount(earning.quantity)}
                </Typography>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary">
              {earning.productName || "Product"}
              {earning.sku ? ` · ${earning.sku}` : ""} · Order{" "}
              {earning.orderNumber || `#${earning.orderId ?? "—"}`}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Created {formatDateTime(earning.createdAt)} · Updated{" "}
              {formatDateTime(earning.updatedAt)}
            </Typography>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {earning?.orderId ? (
          <Button
            component={Link}
            href={`/seller/orders/${earning.orderId}`}
            onClick={onClose}
          >
            View order
          </Button>
        ) : null}
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SellerEarningsPage() {
  const token = useAuthStore((s) => s.token);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState<SellerEarningSort>("createdAt,desc");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SellerEarningSummary | null>(null);
  const [earningsPage, setEarningsPage] = useState<SellerEarningPage | null>(
    null,
  );
  const [selectedEarningId, setSelectedEarningId] = useState<number | null>(
    null,
  );

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setPageError(null);
    setSummaryError(null);

    const [summaryResult, listResult] = await Promise.all([
      getSellerEarningsSummary(signal),
      listSellerEarnings({ page, size, sort }, signal),
    ]);

    if (signal?.aborted) return;

    setSummary(summaryResult.ok ? summaryResult.data : null);
    if (!summaryResult.ok && summaryResult.status !== 0) {
      setSummaryError(summaryResult.message);
    } else if (!summaryResult.ok) {
      setSummaryError(summaryResult.message);
    }

    if (!listResult.ok) {
      setEarningsPage(null);
      setLoading(false);
      setPageError(listResult.message);
      return;
    }

    setEarningsPage(listResult.data);
    setLoading(false);
  }, [page, size, sort]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const controller = new AbortController();

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

  if (loading) {
    return <SellerPageSkeleton cards={4} />;
  }

  if (pageError || !earningsPage) {
    return (
      <SellerErrorState
        message={pageError ?? "Could not load earnings."}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Earnings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Backend-calculated gross, commission and net earnings. Payout actions
        are not available in the current backend.
      </Typography>

      <Stack spacing={3}>
        {summaryError ? (
          <Alert severity="warning">
            The earnings summary is unavailable: {summaryError}
          </Alert>
        ) : null}

        {summary ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
                Summary
              </Typography>

              <Grid container spacing={3}>
                <SummaryStat
                  label="Net earnings"
                  value={formatAmount(summary.totalNetAmount)}
                />
                <SummaryStat
                  label="Available"
                  value={formatAmount(summary.availableAmount)}
                />
                <SummaryStat
                  label="Pending"
                  value={formatAmount(summary.pendingAmount)}
                />
                <SummaryStat
                  label="Paid"
                  value={formatAmount(summary.paidAmount)}
                />
                <SummaryStat
                  label="Gross"
                  value={formatAmount(summary.totalGrossAmount)}
                />
                <SummaryStat
                  label="Commission"
                  value={formatAmount(summary.totalCommissionAmount)}
                />
                <SummaryStat
                  label="Refunded"
                  value={formatAmount(summary.refundedAmount)}
                />
                <SummaryStat
                  label="Records"
                  value={formatCount(summary.totalEarningRecords)}
                />
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SellerEarningSort);
                    setPage(0);
                  }}
                >
                  {SORTS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Records per page"
                  value={String(size)}
                  onChange={(event) => {
                    setSize(Number(event.target.value));
                    setPage(0);
                  }}
                >
                  {PAGE_SIZES.map((value) => (
                    <MenuItem key={value} value={String(value)}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {earningsPage.content.length === 0 ? (
          <SellerEmptyState
            title="No earnings found"
            description="No earning records exist for your account yet. Earnings appear after qualifying order activity."
          />
        ) : (
          <Stack spacing={2}>
            {earningsPage.content.map((earning) => (
              <Card key={earning.id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {earning.productName || "Product"}
                      {earning.sku ? ` · ${earning.sku}` : ""}
                    </Typography>
                    <StatusChip status={earning.status} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Earning #{earning.id} · Order{" "}
                    {earning.orderNumber || `#${earning.orderId ?? "—"}`} · Qty{" "}
                    {formatCount(earning.quantity)} ·{" "}
                    {formatDateTime(earning.createdAt)}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Net {formatAmount(earning.netAmount)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      Gross {formatAmount(earning.grossAmount)} · Commission{" "}
                      {formatAmount(earning.commissionAmount)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {earning.orderId ? (
                        <Button
                          component={Link}
                          href={`/seller/orders/${earning.orderId}`}
                          size="small"
                          variant="text"
                        >
                          View order
                        </Button>
                      ) : null}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedEarningId(earning.id)}
                      >
                        View details
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Button
                variant="outlined"
                disabled={page <= 0 || earningsPage.first}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                role="status"
                sx={{ flexGrow: 1, textAlign: "center" }}
              >
                Page {earningsPage.number + 1} of{" "}
                {Math.max(earningsPage.totalPages, 1)} ·{" "}
                {earningsPage.totalElements} record
                {earningsPage.totalElements === 1 ? "" : "s"}
              </Typography>
              <Button
                variant="outlined"
                disabled={earningsPage.last}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      <EarningDetailDialog
        earningId={selectedEarningId}
        onClose={() => setSelectedEarningId(null)}
      />
    </div>
  );
}
