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
 * NEXTCART — Seller panel top bar.
 *
 * Seller-specific header. Deliberately separate from the customer
 * `components/layout/Navbar.tsx`. Provides the mobile navigation trigger,
 * a page title derived from the current route, and the seller account menu.
 */

function getInitials(firstName?: string, lastName?: string): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return initials || "S";
}

interface SellerTopBarProps {
  onOpenMobileNav: () => void;
}

export default function SellerTopBar({ onOpenMobileNav }: SellerTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  const displayName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Seller";

  const pageTitle = pathname.startsWith("/seller/profile")
    ? "Profile"
    : "Dashboard";

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogout = () => {
    setMenuAnchor(null);
    logout();
    router.push("/login");
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
          aria-label="Open seller navigation"
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

        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {pageTitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Seller account">
          <IconButton
            onClick={handleOpenMenu}
            aria-label="Seller account menu"
            aria-controls={menuOpen ? "seller-account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            sx={{ p: 0.5 }}
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
          id="seller-account-menu"
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1, maxWidth: 240 }}>
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
