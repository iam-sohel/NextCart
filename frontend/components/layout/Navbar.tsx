"use client";

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

export default function Navbar() {
  const items = useCartStore((state) => state.items);

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "#2874F0",
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
        {/* Logo */}

        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#fff",
            }}
          >
            NextCart
          </Typography>
        </Link>

        {/* Search */}

        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search for Products, Brands and More"
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Login */}

        <Button
          variant="contained"
          sx={{
            bgcolor: "#fff",
            color: "#2874F0",
            fontWeight: 700,
          }}
        >
          Login
        </Button>

        {/* Wishlist */}

        <IconButton color="inherit">
          <Badge badgeContent={0} color="error">
            <FavoriteBorderIcon />
          </Badge>
        </IconButton>

        {/* Cart */}

        <Link
          href="/cart"
          style={{
            color: "inherit",
          }}
        >
          <IconButton color="inherit">
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Link>

        {/* Profile */}

        <IconButton color="inherit">
          <PersonOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}