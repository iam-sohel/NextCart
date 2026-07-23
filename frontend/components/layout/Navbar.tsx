"use client";

// import Link from "next/link"; // unused - removed
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
// '@mui/icons-material/PersonOutline' may not be available in some installs — use 'Person' instead
import PersonOutlineIcon from "@mui/icons-material/Person";

export default function Navbar() {
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

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#fff",
          }}
        >
          NextCart
        </Typography>

        {/* Search */}

        <Box
          sx={{
            flex: 1,
          }}
        >
          <TextField
            variant="outlined"
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

        <IconButton color="inherit">
          <Badge badgeContent={0} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        {/* Profile */}

        <IconButton color="inherit">
          <PersonOutlineIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}