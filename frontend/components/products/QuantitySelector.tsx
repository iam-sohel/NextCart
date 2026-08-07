"use client";

import { useState } from "react";

import {
  Button,
  Stack,
  Typography,
} from "@mui/material";

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      mt={4}
    >
      <Typography fontWeight={600}>
        Quantity
      </Typography>

      <Button
        variant="outlined"
        onClick={() =>
          qty > 1 && setQty(qty - 1)
        }
      >
        -
      </Button>

      <Typography>{qty}</Typography>

      <Button
        variant="outlined"
        onClick={() =>
          setQty(qty + 1)
        }
      >
        +
      </Button>
    </Stack>
  );
}