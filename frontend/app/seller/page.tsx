"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";

import { getMySellerProfile, type SellerResponse } from "@/services/sellerService";
import { getMyKycStatus } from "@/services/sellerKycService";
import { getMyBankAccount, type SellerBankResponse } from "@/services/sellerBankService";
import {
  listWarehouses,
  type WarehouseResponse,
} from "@/services/sellerWarehouseService";

/**
 * NEXTCART — Seller dashboard.
 *
 * Composed strictly from the seller endpoints the backend actually exposes:
 * profile, KYC status, bank account and warehouses. The backend has no
 * dashboard / analytics / order / payment seller endpoint, so no sales,
 * order, product or earnings figures are shown.
 */
export default function SellerDashboardPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [profile, setProfile] = useState<SellerResponse | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [bank, setBank] = useState<SellerBankResponse | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const [profileRes, kycRes, bankRes, warehouseRes] = await Promise.all([
      getMySellerProfile(),
      getMyKycStatus(),
      getMyBankAccount(),
      listWarehouses(),
    ]);

    if (!profileRes.ok) {
      setLoading(false);
      setLoadError(profileRes.message);
      return;
    }

    setProfile(profileRes.data);
    setKycStatus(kycRes.ok ? kycRes.data.status : null);
    setBank(bankRes.ok ? bankRes.data : null);
    setWarehouses(warehouseRes.ok ? warehouseRes.data : []);
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

  if (loading) {
    return <SellerPageSkeleton cards={3} />;
  }

  if (loadError || !profile) {
    return (
      <SellerErrorState
        message={loadError ?? "Could not load your seller account."}
        onRetry={() => void load()}
      />
    );
  }

  const activeWarehouses = warehouses.filter(
    (w) => w.status === "ACTIVE",
  ).length;
  const inactiveWarehouses = warehouses.length - activeWarehouses;

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Seller Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your NextCart seller account.
      </Typography>

      <Stack spacing={3}>
        {/* ── Business overview ─────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Business
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                  Business name
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  {profile.businessName || "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
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
                  Verified
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip
                    status={profile.verified ? "VERIFIED" : "PENDING"}
                    label={profile.verified ? "Verified" : "Not verified"}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
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
                  Account
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip
                    status={profile.active ? "ACTIVE" : "INACTIVE"}
                    label={profile.active ? "Active" : "Inactive"}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Verification ──────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Verification
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <VerifiedUserIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      KYC
                    </Typography>
                  </Stack>
                  <StatusChip
                    status={kycStatus}
                    label={kycStatus ? undefined : "Not submitted"}
                  />
                </Stack>

                <Button
                  component={Link}
                  href="/seller/kyc"
                  size="small"
                  variant="outlined"
                >
                  {kycStatus ? "Manage KYC" : "Submit KYC"}
                </Button>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <AccountBalanceIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Bank account
                    </Typography>
                  </Stack>
                  <StatusChip
                    status={bank ? bank.verificationStatus : null}
                    label={bank ? undefined : "Not added"}
                  />
                </Stack>

                <Button
                  component={Link}
                  href="/seller/bank"
                  size="small"
                  variant="outlined"
                >
                  {bank ? "Manage bank account" : "Add bank account"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Warehouses ────────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <AddBusinessIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Warehouses
              </Typography>
            </Stack>

            {warehouses.length === 0 ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  You have no warehouses yet. Add one to start fulfilling
                  orders.
                </Typography>
                <Button
                  component={Link}
                  href="/seller/warehouses"
                  variant="contained"
                >
                  Add warehouse
                </Button>
              </>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {warehouses.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {activeWarehouses}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {inactiveWarehouses}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Inactive
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  component={Link}
                  href="/seller/warehouses"
                  variant="outlined"
                >
                  Manage warehouses
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Quick actions
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <Button
                component={Link}
                href="/seller/products/new"
                variant="contained"
                startIcon={<Inventory2Icon />}
              >
                Add product
              </Button>
              <Button
                component={Link}
                href="/seller/profile"
                variant="outlined"
              >
                Edit profile
              </Button>
              <Button
                component={Link}
                href="/seller/settings"
                variant="outlined"
              >
                Account settings
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
