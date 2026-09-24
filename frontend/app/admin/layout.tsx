"use client";

import { useState } from "react";

import { Box, CircularProgress, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

import useRequireAdmin from "@/hooks/useRequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

/**
 * NEXTCART — Admin panel shell.
 *
 * Gates every `/admin/**` route behind `useRequireAdmin`, except the public
 * admin login page. This shell renders the admin sidebar, top bar, and
 * responsive content container for later module routes.
 */
const ADMIN_LOGIN_PATH = "/admin/login";

function AdminProtectedShell({
  children,
  returnPath,
}: {
  children: React.ReactNode;
  returnPath: string;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { checking, isAdmin } = useRequireAdmin(returnPath, {
    loginPath: ADMIN_LOGIN_PATH,
  });

  // Hold rendering until hydration decides the auth state. This prevents an
  // admin being misclassified as a guest (and bounced to login) on refresh.
  if (checking) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: "100dvh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress aria-hidden="true" />
        <Typography variant="body2" color="text.secondary">
          Loading admin console…
        </Typography>
      </Box>
    );
  }

  // Non-admins are being redirected by the guard.
  if (!isAdmin) {
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
      <AdminSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <AdminTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  // Admin login must remain reachable without an authenticated admin session.
  // It intentionally bypasses the protected shell; every other /admin/**
  // route still uses the existing admin guard.
  if (normalizedPathname === ADMIN_LOGIN_PATH) {
    return <>{children}</>;
  }

  return (
    <AdminProtectedShell returnPath={pathname || "/admin"}>
      {children}
    </AdminProtectedShell>
  );
}
