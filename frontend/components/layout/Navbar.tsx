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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonOutlineIcon from "@mui/icons-material/Person";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import useAddressStore from "@/store/addressStore";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const resetAddresses = useAddressStore((s) => s.reset);
  const resetCart = useCartStore((s) => s.reset);

  // Gate auth-dependent UI on hydration so the server render (always guest)
  // matches the first client paint; the Account / Sign Out controls appear
  // only after the persisted session has been restored from localStorage.
  // This prevents both a hydration mismatch and a logged-in user briefly
  // flashing as a guest on a hard refresh.
  const isAuthenticated = hasHydrated && Boolean(user);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navigateToSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") navigateToSearch();
  };

  const handleLogout = () => {
    logout();
    resetAddresses();
    resetCart();
    // Drop the user back on the home page. Wishlist stays local so a
    // logged-out session can resume; the cart and address book are reset
    // because they're now backend-driven and a fresh login will refetch.
    router.push("/");
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
      <Toolbar
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          display: "flex",
          gap: 2,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
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

        <Box sx={{ flex: 1 }}>
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
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "divider" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
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
                    <IconButton size="small" onClick={navigateToSearch} edge="end">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Button
          component={Link}
          href={isAuthenticated ? "/account/addresses" : "/login"}
          variant="contained"
          sx={{
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 700,
            "&:hover": { bgcolor: "secondary.dark" },
          }}
        >
          {isAuthenticated ? "Account" : "Login"}
        </Button>

        <Link href="/wishlist" style={{ color: "inherit" }}>
          <IconButton sx={{ color: "text.primary" }} aria-label="Wishlist">
            <Badge badgeContent={wishlistCount} color="error">
              <FavoriteBorderIcon />
            </Badge>
          </IconButton>
        </Link>

        <Link href="/cart" style={{ color: "inherit" }}>
          <IconButton sx={{ color: "text.primary" }} aria-label="Cart">
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Link>

        {isAuthenticated ? (
          <Button
            onClick={handleLogout}
            variant="text"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              minHeight: 36,
              px: 1.25,
            }}
            aria-label="Sign out"
          >
            Sign Out
          </Button>
        ) : (
          <IconButton
            component={Link}
            href="/login"
            sx={{ color: "text.primary" }}
            aria-label="Account"
          >
            <PersonOutlineIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}