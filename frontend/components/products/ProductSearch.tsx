"use client";

import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function ProductSearch() {
  return (
    <TextField
      fullWidth
      placeholder="Search for products, brands and categories..."
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        mb: 4,
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />
  );
}