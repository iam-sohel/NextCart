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

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";

import { getMySellerProfile, type SellerResponse } from "@/services/sellerService";
import { getMyKycStatus } from "@/services/sellerKycService";
import { getMyBankAccount, type SellerBankResponse } from "@/services/sellerBankService";
import { listWarehouses } from "@/services/sellerWarehouseService";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

export default function SellerSettingsPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [profile, setProfile] = useState<SellerResponse | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [bank, setBank] = useState<SellerBankResponse | null>(null);
  const [warehouseCount, setWarehouseCount] = useState<number | null>(null);

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
    setWarehouseCount(warehouseRes.ok ? warehouseRes.data.length : null);
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
    return <SellerPageSkeleton cards={2} />;
  }

  if (loadError || !profile) {
    return (
      <SellerErrorState
        message={loadError ?? "Could not load account settings."}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The status of your seller account.
      </Typography>

      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Account status
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <Row label="Business name">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {profile.businessName || "—"}
              </Typography>
            </Row>
            <Row label="Seller account">
              <StatusChip
                status={profile.active ? "ACTIVE" : "INACTIVE"}
                label={profile.active ? "Active" : "Inactive"}
              />
            </Row>
            <Row label="Seller verification">
              <StatusChip
                status={profile.verified ? "VERIFIED" : "PENDING"}
                label={profile.verified ? "Verified" : "Not verified"}
              />
            </Row>
            <Row label="KYC">
              <StatusChip
                status={kycStatus}
                label={kycStatus ? undefined : "Not submitted"}
              />
            </Row>
            <Row label="Bank account">
              <StatusChip
                status={bank ? bank.verificationStatus : null}
                label={bank ? undefined : "Not added"}
              />
            </Row>
            <Row label="Warehouses">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {warehouseCount ?? "—"}
              </Typography>
            </Row>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Manage
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  component={Link}
                  href="/seller/profile"
                  variant="outlined"
                  fullWidth
                >
                  Edit business profile
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  component={Link}
                  href="/seller/kyc"
                  variant="outlined"
                  fullWidth
                >
                  Manage KYC
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  component={Link}
                  href="/seller/bank"
                  variant="outlined"
                  fullWidth
                >
                  Manage bank account
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  component={Link}
                  href="/seller/warehouses"
                  variant="outlined"
                  fullWidth
                >
                  Manage warehouses
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
