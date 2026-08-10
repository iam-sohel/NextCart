"use client";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function ProductOffers() {
  const offers = [
    "10% Instant Discount on HDFC Bank Cards",
    "₹2,000 Exchange Bonus",
    "No Cost EMI Available",
    "Free Delivery",
  ];

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        Available Offers
      </Typography>

      <Stack spacing={2}>
        {offers.map((offer) => (
          <Stack
            direction="row"
            spacing={2}
            key={offer}
          >
            <LocalOfferIcon
              color="success"
            />

            <Typography>
              {offer}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}