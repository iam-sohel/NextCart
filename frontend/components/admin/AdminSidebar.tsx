"use client";

import type { ComponentType } from "react";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TuneIcon from "@mui/icons-material/Tune";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * NEXTCART — Admin panel sidebar.
 *
 * Admin-specific navigation shell. It follows the seller shell’s responsive
 * pattern without importing seller-branded components.
 *
 * Only routes with audited backend capabilities—or routes explicitly planned
 * for an upcoming implementation phase—are listed.
 */

export const ADMIN_SIDEBAR_WIDTH = 272;

interface AdminNavChild {
  label: string;
  href: string;
  icon: ComponentType<{ fontSize?: "inherit" | "small" | "medium" | "large" }>;
}

interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ fontSize?: "inherit" | "small" | "medium" | "large" }>;
  exact?: boolean;
  children?: AdminNavChild[];
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon, exact: true },
  { label: "Sellers", href: "/admin/sellers", icon: StorefrontIcon },
  { label: "KYC", href: "/admin/kyc", icon: VerifiedUserIcon },
  { label: "Customers", href: "/admin/customers", icon: PeopleIcon },
  { label: "Orders", href: "/admin/orders", icon: ReceiptLongIcon },
  {
    label: "Catalog",
    href: "/admin/catalog",
    icon: CategoryIcon,
    children: [
      {
        label: "Categories",
        href: "/admin/catalog/categories",
        icon: CategoryIcon,
      },
      {
        label: "Brands",
        href: "/admin/catalog/brands",
        icon: LocalOfferIcon,
      },
      {
        label: "Subcategories",
        href: "/admin/catalog/subcategories",
        icon: TuneIcon,
      },
    ],
  },
  { label: "Products", href: "/admin/products", icon: Inventory2Icon },
];

function isActive(pathname: string | null, href: string, exact?: boolean): boolean {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminBrand() {
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
        Admin Console
      </Typography>
    </Box>
  );
}

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const catalogActive = NAV_ITEMS.some(
    (item) =>
      item.children?.some((child) => isActive(pathname, child.href)) ??
      false,
  );
  const [catalogManuallyOpen, setCatalogManuallyOpen] = useState(false);
  const catalogOpen = catalogManuallyOpen || catalogActive;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AdminBrand />
      <Divider />

      <List
        component="nav"
        aria-label="Admin navigation"
        sx={{ px: 1.5, py: 1, overflowY: "auto" }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (!item.children) {
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
                  minHeight: 48,
                  px: 1.5,
                  mb: 0.5,
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
          }

          return (
            <Box key={item.href}>
              <ListItemButton
                onClick={() => setCatalogManuallyOpen(!catalogOpen)}
                selected={catalogActive}
                aria-expanded={catalogOpen}
                aria-controls="admin-catalog-navigation"
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  px: 1.5,
                  mb: 0.5,
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
                    color: catalogActive ? "primary.main" : "text.secondary",
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
                        fontWeight: catalogActive ? 700 : 500,
                      },
                    },
                  }}
                />

                {catalogOpen ? (
                  <ExpandLessIcon fontSize="small" color="action" />
                ) : (
                  <ExpandMoreIcon fontSize="small" color="action" />
                )}
              </ListItemButton>

              <Collapse in={catalogOpen} timeout="auto" unmountOnExit>
                <List
                  component="nav"
                  id="admin-catalog-navigation"
                  aria-label="Catalog navigation"
                  disablePadding
                  sx={{ pl: 2.5 }}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const active = isActive(pathname, child.href);

                    return (
                      <ListItemButton
                        key={child.href}
                        component={Link}
                        href={child.href}
                        onClick={onNavigate}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        sx={{
                          borderRadius: 2,
                          minHeight: 46,
                          px: 1.5,
                          mb: 0.5,
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
                          <ChildIcon fontSize="small" />
                        </ListItemIcon>

                        <ListItemText
                          primary={child.label}
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
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop — permanent drawer */}
      <Box
        sx={{
          width: { md: ADMIN_SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: ADMIN_SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          <AdminSidebarContent />
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
            width: ADMIN_SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <AdminSidebarContent onNavigate={onClose} />
      </Drawer>
    </>
  );
}
