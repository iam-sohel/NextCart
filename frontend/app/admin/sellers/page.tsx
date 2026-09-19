"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AdminTable, { type AdminTableColumn } from "@/components/admin/AdminTable";
import AdminStatusChip from "@/components/admin/AdminStatusChip";
import { AdminErrorState } from "@/components/admin/AdminStates";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import useAuthStore from "@/store/authStore";
import {
  activateAdminSeller,
  deactivateAdminSeller,
  listAdminSellers,
  type AdminSeller,
  type AdminSellerPage,
} from "@/services/adminSellerService";

const PAGE_SIZES = [10, 20, 50];

interface StatusChange {
  seller: AdminSeller;
  action: "activate" | "deactivate";
}

function sellerDisplayName(seller: AdminSeller): string {
  const name = `${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim();
  return name || `Seller #${seller.sellerId}`;
}

export default function AdminSellersPage() {
  const token = useAuthStore((s) => s.token);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sellersPage, setSellersPage] = useState<AdminSellerPage | null>(null);

  const [confirm, setConfirm] = useState<StatusChange | null>(null);
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setLoadError(null);

      const result = await listAdminSellers({ page, size }, signal);
      if (signal?.aborted) return;

      if (!result.ok) {
        setSellersPage(null);
        setLoading(false);
        setLoadError(result.message);
        return;
      }

      setSellersPage(result.data);
      setLoading(false);
    },
    [page, size],
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

  const startStatusChange = (seller: AdminSeller, action: StatusChange["action"]) => {
    setMutationError(null);
    setSuccess(null);
    setConfirm({ seller, action });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirm || mutating) return;

    setMutating(true);
    setMutationError(null);
    setSuccess(null);

    const result =
      confirm.action === "activate"
        ? await activateAdminSeller(confirm.seller.sellerId)
        : await deactivateAdminSeller(confirm.seller.sellerId);

    if (!result.ok) {
      setMutating(false);
      setMutationError(result.message);
      return;
    }

    const changedName = sellerDisplayName(confirm.seller);
    setConfirm(null);
    setMutating(false);
    setSuccess(
      confirm.action === "activate"
        ? `${changedName} was activated.`
        : `${changedName} was deactivated.`,
    );
    await load();
  };

  if (loading && !sellersPage) {
    return (
      <AdminTable
        ariaLabel="Sellers"
        columns={[]}
        rows={[]}
        getRowId={(_, index) => index}
        loading
        emptyTitle="No sellers found"
      />
    );
  }

  if (loadError || !sellersPage) {
    return (
      <AdminErrorState
        message={loadError ?? "Could not load sellers."}
        onRetry={() => void load()}
      />
    );
  }

  const columns: AdminTableColumn<AdminSeller>[] = [
    {
      key: "seller",
      header: "Seller",
      minWidth: 130,
      renderCell: (seller) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            #{seller.sellerId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            User #{seller.userId}
          </Typography>
        </Box>
      ),
    },
    {
      key: "name",
      header: "Name",
      minWidth: 170,
      hideOnMobile: true,
      renderCell: (seller) => (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {sellerDisplayName(seller)}
        </Typography>
      ),
    },
    {
      key: "business",
      header: "Business",
      minWidth: 190,
      renderCell: (seller) => (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {seller.businessName || "—"}
        </Typography>
      ),
    },
    {
      key: "email",
      header: "Email",
      minWidth: 200,
      hideOnMobile: true,
      renderCell: (seller) => (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {seller.email || "—"}
        </Typography>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      minWidth: 130,
      hideOnMobile: true,
      renderCell: (seller) => (
        <Typography variant="body2">{seller.phone || "—"}</Typography>
      ),
    },
    {
      key: "gst",
      header: "GST",
      minWidth: 150,
      hideOnMobile: true,
      renderCell: (seller) => (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {seller.gstNumber || "—"}
        </Typography>
      ),
    },
    {
      key: "verified",
      header: "Verified",
      renderCell: (seller) => (
        <AdminStatusChip
          status={seller.verified ? "VERIFIED" : "PENDING"}
          label={seller.verified ? "Verified" : "Unverified"}
          tone={seller.verified ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "active",
      header: "Active",
      renderCell: (seller) => (
        <AdminStatusChip
          status={seller.active ? "ACTIVE" : "INACTIVE"}
          label={seller.active ? "Active" : "Inactive"}
          tone={seller.active ? "success" : "error"}
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Sellers
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review seller accounts and change activation state. Verification
        reviews remain separate from direct seller activation.
      </Typography>

      {mutationError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMutationError(null)}>
          {mutationError}
        </Alert>
      ) : null}

      {success ? (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Sellers per page"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary" role="status">
                Page {sellersPage.number + 1} of{" "}
                {Math.max(sellersPage.totalPages, 1)} ·{" "}
                {sellersPage.totalElements} seller
                {sellersPage.totalElements === 1 ? "" : "s"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AdminTable
        ariaLabel="Admin sellers"
        columns={columns}
        rows={sellersPage.content}
        getRowId={(seller) => seller.sellerId}
        getRowLabel={(seller) => `${sellerDisplayName(seller)} (#${seller.sellerId})`}
        loading={loading}
        emptyTitle="No sellers found"
        emptyDescription="No seller accounts match the current backend page."
        minWidth={1120}
        renderRowActions={(seller) => (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              component={Link}
              href={`/admin/sellers/${seller.sellerId}`}
              variant="outlined"
              size="small"
              aria-label={`View ${sellerDisplayName(seller)}`}
            >
              View
            </Button>
            {seller.active ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                aria-label={`Deactivate ${sellerDisplayName(seller)}`}
                onClick={() => startStatusChange(seller, "deactivate")}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                aria-label={`Activate ${sellerDisplayName(seller)}`}
                onClick={() => startStatusChange(seller, "activate")}
              >
                Activate
              </Button>
            )}
          </Stack>
        )}
        footer={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 2, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              variant="outlined"
              disabled={page <= 0 || sellersPage.first || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={sellersPage.last || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </Stack>
        }
      />

      <ConfirmActionDialog
        id="admin-seller-status-change"
        open={confirm !== null}
        title={
          confirm?.action === "activate"
            ? "Activate seller account?"
            : "Deactivate seller account?"
        }
        description={
          confirm
            ? `${confirm.action === "activate" ? "Activate" : "Deactivate"} ${
                sellerDisplayName(confirm.seller)
              } (Seller #${confirm.seller.sellerId}). This changes whether the seller can operate on NextCart.`
            : undefined
        }
        confirmLabel={
          confirm?.action === "activate" ? "Activate seller" : "Deactivate seller"
        }
        confirming={mutating}
        tone={confirm?.action === "activate" ? "primary" : "danger"}
        onConfirm={() => void handleConfirmStatusChange()}
        onClose={() => {
          if (!mutating) setConfirm(null);
        }}
      />
    </Box>
  );
}
