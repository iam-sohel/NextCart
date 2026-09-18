"use client";

import { useState } from "react";

import { Box, CircularProgress } from "@mui/material";
import { usePathname } from "next/navigation";

import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerTopBar from "@/components/seller/SellerTopBar";
import useRequireSeller from "@/hooks/useRequireSeller";

/**
 * NEXTCART — Seller panel shell.
 *
 * Gates every `/seller/**` route behind `useRequireSeller` and provides the
 * seller-only navigation (desktop sidebar + mobile drawer) and top bar.
 */
const SELLER_AUTH_PATHS = new Set(["/seller/login", "/seller/signup"]);

function SellerProtectedShell({
  children,
  returnPath,
}: {
  children: React.ReactNode;
  returnPath: string;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { checking, isSeller } = useRequireSeller(returnPath, {
    loginPath: "/seller/login",
  });

  // Hold rendering until hydration decides the auth state. This prevents a
  // seller being misclassified as a guest (and bounced to login) on refresh.
  if (checking) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Non-sellers (customers/admins) are being redirected by the guard.
  if (!isSeller) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <SellerSidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <SellerTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 1400,
            mx: "auto",
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/seller";

  // Seller login and signup must remain reachable without an authenticated
  // seller session. They intentionally bypass the protected shell; every
  // other /seller/** route still uses the existing seller guard.
  if (SELLER_AUTH_PATHS.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <SellerProtectedShell returnPath={pathname}>
      {children}
    </SellerProtectedShell>
  );
}
