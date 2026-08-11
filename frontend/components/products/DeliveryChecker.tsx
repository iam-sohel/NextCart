"use client";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function DeliveryChecker() {
  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Delivery
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <TextField
          fullWidth
          placeholder="Enter Pincode"
          slotProps={{
            input: {
              startAdornment: (
                <LocationOnIcon
                  sx={{ mr: 1, color: "text.secondary" }}
                />
              ),
            },
          }}
        />

        <Button
          variant="contained"
          size="large"
        >
          Check
        </Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography
          color="success.main"
          sx={{ fontWeight: 600 }}
        >
          Delivery by Tomorrow
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Free Delivery on eligible orders.
        </Typography>
      </Box>
    </Paper>
  );
}