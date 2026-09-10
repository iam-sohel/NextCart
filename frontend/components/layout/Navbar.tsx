"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonOutlineIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import useAddressStore from "@/store/addressStore";

/**
 * NEXTCART — Header / Navbar.
 *
 * Presentation layer only. All business logic is unchanged: cart/wishlist/auth
 * stores, search navigation, logout flow, link targets, and the mobile
 * hamburger drawer behave exactly as before.
 *
 * Desktop hierarchy: Logo → Search → Login/Account → Wishlist → Cart → Sign out.
 * Mobile keeps the hamburger drawer with search stacked below the top row.
 */

/** Brand wordmark used in the app bar and the mobile drawer. */
const BrandMark = ({ fontSize = "1.5rem" }: { fontSize?: string }) => (
  <Typography
    sx={{
      fontSize,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      color: "secondary.main",
      whiteSpace: "nowrap",
    }}
  >
    Next
    <Box component="span" sx={{ color: "primary.main" }}>
      Cart
    </Box>
  </Typography>
);

/** Outlined icon-button treatment shared by the wishlist / cart / account icons. */
const iconLinkSx = {
  width: 42,
  height: 42,
  color: "text.primary",
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  "&:hover": {
    borderColor: "primary.main",
    bgcolor: "action.hover",
    color: "primary.dark",
  },
} as const;

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const resetAddresses = useAddressStore((s) => s.reset);
  const clearCart = useCartStore((s) => s.clearCart);

  // Gate auth-dependent UI on hydration so the server render
  // matches the first client paint.
  const isAuthenticated = hasHydrated && Boolean(user);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const wishlistCount = wishlistItems.length;

  const navigateToSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSearchKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      navigateToSearch();
    }
  };

  const handleLogout = () => {
    logout();
    resetAddresses();
    clearCart();

    setMobileMenuOpen(false);

    // Drop the user back on the home page.
    router.push("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* ------------------------------------------------------------------
   * Shared search-field styling — one coherent search treatment for
   * desktop and mobile: a light grey field that clarifies to white with
   * an orange focus ring, plus an orange search action button.
   * ------------------------------------------------------------------ */
  const searchFieldSx = {
    bgcolor: "grey.100",
    borderRadius: 2,
    "& .MuiOutlinedInput-root": {
      color: "text.primary",
      "& fieldset": {
        borderColor: "transparent",
      },
      "&:hover": {
        bgcolor: "grey.200",
      },
      "&:hover fieldset": {
        borderColor: "grey.300",
      },
      "&.Mui-focused": {
        bgcolor: "background.paper",
      },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main",
      },
    },
    "& .MuiInputBase-input": {
      py: { xs: 1.2, md: 1.5 },
      fontSize: { xs: "0.875rem", md: "0.9375rem" },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "text.secondary",
      opacity: 1,
    },
  } as const;

  /* Orange action inside the search field — the header's primary affordance. */
  const searchAdornment = (
    <InputAdornment position="end" sx={{ pr: 0.75 }}>
      <IconButton
        onClick={navigateToSearch}
        edge="end"
        aria-label="Search"
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        <SearchIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </InputAdornment>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: 1,
      }}
    >
      {/* ============================================================
          DESKTOP NAVBAR
          Preserves the existing desktop layout.
          ============================================================ */}
      <Toolbar
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          px: { md: 3 },
          minHeight: { md: 72 },
          alignItems: "center",
          gap: 2.5,
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <BrandMark />
        </Link>

        {/* Search — the primary interaction of the header */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: 760,
            mx: "auto",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search for Products, Brands and More"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKey}
            sx={searchFieldSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment,
              },
            }}
          />
        </Box>

        {/* Account / Login */}
        <Button
          component={Link}
          href={
            isAuthenticated
              ? "/account/addresses"
              : "/login"
          }
          variant="contained"
          disableElevation
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 700,
            borderRadius: 2,
            minHeight: 42,
            px: 2.5,
            flexShrink: 0,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: "none",
            },
          }}
        >
          {isAuthenticated ? "Account" : "Login"}
        </Button>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          style={{
            color: "inherit",
            flexShrink: 0,
          }}
        >
          <IconButton sx={iconLinkSx} aria-label="Wishlist">
            <Badge
              badgeContent={wishlistCount}
              color="primary"
            >
              <FavoriteBorderIcon />
            </Badge>
          </IconButton>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          style={{
            color: "inherit",
            flexShrink: 0,
          }}
        >
          <IconButton sx={iconLinkSx} aria-label="Cart">
            <Badge
              badgeContent={cartCount}
              color="primary"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Link>

        {/* Sign Out / Account icon */}
        {isAuthenticated ? (
          <Button
            onClick={handleLogout}
            variant="text"
            startIcon={<LogoutIcon />}
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              minHeight: 42,
              px: 1.5,
              borderRadius: 2,
              flexShrink: 0,
              "&:hover": {
                color: "error.main",
                bgcolor: "error.light",
              },
            }}
            aria-label="Sign out"
          >
            Sign Out
          </Button>
        ) : (
          <IconButton
            component={Link}
            href="/login"
            sx={{
              ...iconLinkSx,
              flexShrink: 0,
            }}
            aria-label="Account"
          >
            <PersonOutlineIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* ============================================================
          MOBILE NAVBAR
          ============================================================ */}
      <Box
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          width: "100%",
        }}
      >
        {/* Mobile top row */}
        <Toolbar
          disableGutters
          sx={{
            minHeight: 60,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {/* Hamburger */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            sx={{
              color: "text.primary",
              width: 44,
              height: 44,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              flex: 1,
              minWidth: 0,
            }}
          >
            <BrandMark fontSize="1.25rem" />
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            style={{
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <IconButton sx={iconLinkSx} aria-label="Wishlist">
              <Badge
                badgeContent={wishlistCount}
                color="primary"
              >
                <FavoriteBorderIcon />
              </Badge>
            </IconButton>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            style={{
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <IconButton sx={iconLinkSx} aria-label="Cart">
              <Badge
                badgeContent={cartCount}
                color="primary"
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Link>
        </Toolbar>

        {/* Mobile Search */}
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search products, brands and more"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            onKeyPress={handleSearchKey}
            sx={searchFieldSx}
            slotProps={{
              input: {
                endAdornment: searchAdornment,
              },
            }}
          />
        </Box>
      </Box>

      {/* ============================================================
          MOBILE DRAWER
          ============================================================ */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        ModalProps={{
          keepMounted: true,
        }}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "84vw",
                sm: 320,
              },
              maxWidth: 320,
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            minHeight: 64,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Link
            href="/"
            onClick={closeMobileMenu}
            style={{
              textDecoration: "none",
            }}
          >
            <BrandMark fontSize="1.25rem" />
          </Link>

          <IconButton
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation */}
        <List
          sx={{
            px: 1.5,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {/* Account / Login */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href={
                isAuthenticated
                  ? "/account/addresses"
                  : "/login"
              }
              onClick={closeMobileMenu}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: 1.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: "text.primary",
                }}
              >
                <PersonOutlineIcon />
              </ListItemIcon>

              <ListItemText
                primary={
                  isAuthenticated
                    ? "My Account"
                    : "Login"
                }
              />
            </ListItemButton>
          </ListItem>

          {/* Wishlist */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/wishlist"
              onClick={closeMobileMenu}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: 1.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: "text.primary",
                }}
              >
                <Badge
                  badgeContent={wishlistCount}
                  color="error"
                >
                  <FavoriteBorderIcon />
                </Badge>
              </ListItemIcon>

              <ListItemText
                primary="Wishlist"
              />
            </ListItemButton>
          </ListItem>

          {/* Cart */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/cart"
              onClick={closeMobileMenu}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: 1.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: "text.primary",
                }}
              >
                <Badge
                  badgeContent={cartCount}
                  color="error"
                >
                  <ShoppingCartIcon />
                </Badge>
              </ListItemIcon>

              <ListItemText
                primary="Cart"
              />
            </ListItemButton>
          </ListItem>

          {/* Account-specific links */}
          {isAuthenticated && (
            <>
              <Divider sx={{ my: 1 }} />

              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/account/orders"
                  onClick={closeMobileMenu}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: 1.5,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color: "text.secondary",
                    }}
                  >
                    <ShoppingBagIcon />
                  </ListItemIcon>

                  <ListItemText
                    primary="My Orders"
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/account/addresses"
                  onClick={closeMobileMenu}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: 1.5,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color: "text.secondary",
                    }}
                  >
                    <LocationOnIcon />
                  </ListItemIcon>

                  <ListItemText
                    primary="My Addresses"
                  />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              {/* Sign Out */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: 1.5,
                    "&:hover": {
                      bgcolor: "error.light",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color: "error.main",
                    }}
                  >
                    <LogoutIcon />
                  </ListItemIcon>

                  <ListItemText
                    primary="Sign Out"
                    slotProps={{
                      primary: {
                        sx: {
                          color: "error.main",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}