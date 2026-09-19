"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — Admin panel top bar.
 *
 * Admin-specific header. It follows the seller header pattern without
 * importing seller-branded components. It shows the current admin context,
 * the authenticated administrator identity already stored by `authStore`,
 * and the existing logout action. Tokens and credentials are never shown.
 */

function getInitials(firstName?: string, lastName?: string): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return initials || "A";
}

const ADMIN_PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin/catalog/categories", title: "Categories" },
  { prefix: "/admin/catalog/brands", title: "Brands" },
  { prefix: "/admin/catalog/subcategories", title: "Subcategories" },
  { prefix: "/admin/catalog", title: "Catalog" },
  { prefix: "/admin/sellers", title: "Sellers" },
  { prefix: "/admin/kyc", title: "KYC" },
  { prefix: "/admin/customers", title: "Customers" },
  { prefix: "/admin/orders", title: "Orders" },
  { prefix: "/admin/products", title: "Products" },
];

function titleForPath(pathname: string | null): string {
  const match = ADMIN_PAGE_TITLES.find((entry) =>
    pathname?.startsWith(entry.prefix),
  );
  return match?.title ?? "Admin Console";
}

interface AdminTopBarProps {
  onOpenMobileNav: () => void;
}

export default function AdminTopBar({ onOpenMobileNav }: AdminTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "Administrator";

  const pageTitle = titleForPath(pathname);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogout = () => {
    setMenuAnchor(null);
    logout();
    router.push("/admin/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          gap: 1.5,
          minHeight: { xs: 60, md: 72 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <IconButton
          onClick={onOpenMobileNav}
          aria-label="Open admin navigation"
          edge="start"
          sx={{
            display: { md: "none" },
            color: "text.primary",
            width: 44,
            height: 44,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h4"
          component="h1"
          noWrap
          sx={{ fontWeight: 700, minWidth: 0 }}
        >
          {pageTitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Administrator account">
          <IconButton
            onClick={handleOpenMenu}
            aria-label="Administrator account menu"
            aria-controls={menuOpen ? "admin-account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            sx={{ p: 0.5, width: 44, height: 44 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          id="admin-account-menu"
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, wordBreak: "break-word" }}
            >
              {displayName}
            </Typography>

            {user?.email ? (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", wordBreak: "break-word" }}
              >
                {user.email}
              </Typography>
            ) : null}
          </Box>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
