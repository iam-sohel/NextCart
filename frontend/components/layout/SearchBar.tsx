"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 650 }}>
      <TextField
        fullWidth
        placeholder="Search for Products, Brands and More..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}