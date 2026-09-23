"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import BarChartIcon from "@mui/icons-material/BarChart";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SettingsIcon from "@mui/icons-material/Settings";

/**
 * NEXTCART — Seller panel sidebar.
 *
 * Seller-specific navigation shell. Deliberately separate from the
 * customer `components/layout/Navbar.tsx`.
 *
 * Only routes backed by real backend capabilities are listed.
 * Renders a permanent drawer on desktop and a temporary drawer (controlled by
 * the layout) on mobile.
 */

export const SELLER_SIDEBAR_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ fontSize?: "inherit" | "small" | "medium" | "large" }>;
  exact: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Operate",
    items: [
      { label: "Dashboard", href: "/seller", icon: DashboardIcon, exact: true },
      { label: "Orders", href: "/seller/orders", icon: ShoppingBagIcon, exact: false },
      { label: "Products", href: "/seller/products", icon: Inventory2Icon, exact: false },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/seller/analytics", icon: BarChartIcon, exact: false },
      { label: "Earnings", href: "/seller/earnings", icon: PaymentsIcon, exact: false },
    ],
  },
  {
    label: "Setup",
    items: [
      { label: "Warehouses", href: "/seller/warehouses", icon: WarehouseIcon, exact: false },
      { label: "KYC / Verification", href: "/seller/kyc", icon: VerifiedUserIcon, exact: false },
      { label: "Bank Account", href: "/seller/bank", icon: AccountBalanceIcon, exact: false },
      { label: "Profile", href: "/seller/profile", icon: StorefrontIcon, exact: false },
      { label: "Settings", href: "/seller/settings", icon: SettingsIcon, exact: false },
    ],
  },
];

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SellerBrand() {
  return (
    <Box sx={{ px: 2.5, py: 2.25 }}>
      <Typography
        sx={{
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "secondary.main",
        }}
      >
        Next
        <Box component="span" sx={{ color: "primary.main" }}>
          Cart
        </Box>
      </Typography>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.25,
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Seller Panel
      </Typography>
    </Box>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SellerBrand />
      <Divider />

      <List
        component="nav"
        aria-label="Seller navigation"
        sx={{ px: 1.5, py: 1, overflowY: "auto" }}
      >
        {NAV_SECTIONS.map((section) => (
          <Box component="li" key={section.label} sx={{ listStyle: "none" }}>
            <Typography
              variant="caption"
              component="div"
              sx={{
                px: 1.5,
                pt: 1.5,
                pb: 0.5,
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.6875rem",
              }}
            >
              {section.label}
            </Typography>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href, item.exact);

              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={onNavigate}
                  selected={active}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: 1.5,
                    mb: 0.25,
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      "&:hover": { bgcolor: "action.selected" },
                      "& .MuiListItemText-primary": {
                        color: "primary.dark",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: active ? "primary.main" : "text.secondary",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.875rem",
                          fontWeight: active ? 700 : 500,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>
    </Box>
  );
}

interface SellerSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function SellerSidebar({
  mobileOpen,
  onClose,
}: SellerSidebarProps) {
  return (
    <>
      {/* Desktop — permanent drawer */}
      <Box
        sx={{
          width: { md: SELLER_SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: SELLER_SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* Mobile — temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SELLER_SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>
    </>
  );
}
