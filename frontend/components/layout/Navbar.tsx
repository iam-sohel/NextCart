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

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import useAddressStore from "@/store/addressStore";

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
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
          display: {
            xs: "none",
            md: "flex",
          },
          gap: 2,
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "secondary.main",
            }}
          >
            NextCart
          </Typography>
        </Link>

        {/* Search */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search for Products, Brands and More"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKey}
            sx={{
              bgcolor: "#1B2440",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "divider",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 1,
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={navigateToSearch}
                      edge="end"
                      aria-label="Search"
                    >
                      <SearchIcon
                        sx={{
                          color: "text.secondary",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
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
          sx={{
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 700,
            flexShrink: 0,
            "&:hover": {
              bgcolor: "secondary.dark",
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
          <IconButton
            sx={{
              color: "text.primary",
            }}
            aria-label="Wishlist"
          >
            <Badge
              badgeContent={wishlistCount}
              color="error"
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
          <IconButton
            sx={{
              color: "text.primary",
            }}
            aria-label="Cart"
          >
            <Badge
              badgeContent={cartCount}
              color="error"
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
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              minHeight: 36,
              px: 1.25,
              flexShrink: 0,
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
              color: "text.primary",
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
            gap: 0.5,
          }}
        >
          {/* Hamburger */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            sx={{
              color: "text.primary",
              flexShrink: 0,
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "secondary.main",
                whiteSpace: "nowrap",
              }}
            >
              NextCart
            </Typography>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            style={{
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <IconButton
              aria-label="Wishlist"
              sx={{
                color: "text.primary",
              }}
            >
              <Badge
                badgeContent={wishlistCount}
                color="error"
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
            <IconButton
              aria-label="Cart"
              sx={{
                color: "text.primary",
              }}
            >
              <Badge
                badgeContent={cartCount}
                color="error"
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
            sx={{
              bgcolor: "#1B2440",
              borderRadius: 1,

              "& .MuiOutlinedInput-root": {
                color: "text.primary",

                "& fieldset": {
                  borderColor: "transparent",
                },

                "&:hover fieldset": {
                  borderColor: "divider",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },

              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 1,
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={navigateToSearch}
                      edge="end"
                      aria-label="Search"
                    >
                      <SearchIcon
                        sx={{
                          color: "text.secondary",
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
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
        xs: "82vw",
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
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            onClick={closeMobileMenu}
            style={{
              textDecoration: "none",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "secondary.main",
              }}
            >
              NextCart
            </Typography>
          </Link>

          <IconButton
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Navigation */}
        <List
          sx={{
            px: 1,
            py: 1,
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
                borderRadius: 1,
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
                borderRadius: 1,
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
                borderRadius: 1,
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
                    borderRadius: 1,
                  }}
                >
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
                    borderRadius: 1,
                  }}
                >
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
                    borderRadius: 1,
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