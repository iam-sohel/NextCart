"use client";

import { useCallback, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

import {
  isValidIndianPincode,
  type PincodeCheckResult,
} from "@/types/delivery";
import { checkPincodeServiceability } from "@/services/productService";

interface DeliveryCheckerProps {
  productId: string | number;
  /**
   * Optional pre-seeded service to call. When provided, the DeliveryChecker
   * uses this instead of the default product service. This keeps the UI
   * agnostic to the eventual backend integration point.
   */
  checkService?: (
    pincode: string,
    productId: string | number,
    signal?: AbortSignal,
  ) => Promise<PincodeCheckResult | null>;
}

type CheckStatus = "idle" | "loading" | "success" | "error";

interface CheckState {
  status: CheckStatus;
  message: string;
  result?: PincodeCheckResult;
}

/**
 * NEXTCART — DeliveryChecker
 *
 * Lets the user enter a pincode and learn whether this product can be
 * delivered to that pincode. Designed to be pluggable: the actual
 * serviceability call is injected via `checkService` so unit tests and
 * future backend swaps stay isolated from the UI.
 *
 * State machine:
 *   idle    →  user typing
 *   loading →  service call in flight
 *   success →  service responded positively
 *   error   →  invalid pincode OR backend said no OR network failed
 *
 * UI rules:
 *   - No made-up delivery promises. Success copies the backend message
 *     verbatim (falling back to a generic "Available" line only when the
 *     backend omits one).
 *   - Failure paths never leak API errors to the user.
 */
export default function DeliveryChecker({
  productId,
  checkService,
}: DeliveryCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<CheckState>({
    status: "idle",
    message: "",
  });

  const validate = useCallback(
    (value: string): string | null => {
      if (!value.trim()) return "Enter a 6-digit pincode.";
      if (!isValidIndianPincode(value)) {
        return "Use a valid 6-digit Indian pincode.";
      }
      return null;
    },
    [],
  );

  const handleCheck = async () => {
    const validationError = validate(pincode);
    if (validationError) {
      setState({ status: "error", message: validationError });
      return;
    }

    setState({ status: "loading", message: "Checking serviceability…" });

    const trimmed = pincode.trim();
    try {
      const service = checkService ?? defaultCheckService;
      const result = await service(trimmed, productId);

      if (!result) {
        setState({
          status: "error",
          message: "We couldn't check delivery for this pincode. Try again later.",
        });
        return;
      }

      if (result.status === "serviceable") {
        setState({
          status: "success",
          message:
            result.message ??
            (result.estimatedDelivery
              ? `Delivered by ${result.estimatedDelivery}`
              : "Delivery available to this pincode."),
          result,
        });
      } else {
        setState({
          status: "error",
          message:
            result.message ??
            "Sorry, this pincode is not currently serviceable.",
          result,
        });
      }
    } catch {
      setState({
        status: "error",
        message: "Network error. Please retry in a moment.",
      });
    }
  };

  const handleReset = () => {
    setPincode("");
    setState({ status: "idle", message: "" });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        mt: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1 }}
        id="delivery-heading"
      >
        Delivery options
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your pincode to check delivery availability.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", sm: "stretch" } }}
      >
        <TextField
          fullWidth
          value={pincode}
          onChange={(event) => {
            const next = event.target.value.replace(/[^0-9]/g, "").slice(0, 6);
            setPincode(next);
            if (state.status !== "idle") {
              setState({ status: "idle", message: "" });
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCheck();
            }
          }}
          placeholder="6-digit pincode"
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              pattern: "[0-9]{6}",
              "aria-labelledby": "delivery-heading",
              "aria-describedby": state.message
                ? "delivery-status"
                : undefined,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: pincode ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear pincode"
                    onClick={handleReset}
                    edge="end"
                    size="small"
                  >
                    ×
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          disabled={state.status === "loading"}
          aria-invalid={state.status === "error"}
        />

        <Button
          variant="contained"
          onClick={() => void handleCheck()}
          disabled={state.status === "loading"}
          sx={{
            minWidth: 120,
            alignSelf: { xs: "stretch", sm: "auto" },
          }}
          startIcon={
            state.status === "loading" ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {state.status === "loading" ? "Checking" : "Check"}
        </Button>
      </Stack>

      {state.message && (
        <Box id="delivery-status" role="status" aria-live="polite" sx={{ mt: 2 }}>
          {state.status === "success" ? (
            <Alert
              severity="success"
              icon={<CheckCircleIcon fontSize="inherit" />}
              sx={{ alignItems: "center" }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {state.message}
              </Typography>
              {state.result?.freeDelivery && (
                <Typography variant="caption" color="text.secondary">
                  Free delivery for this pincode.
                </Typography>
              )}
            </Alert>
          ) : state.status === "error" ? (
            <Alert
              severity="error"
              icon={<ErrorOutlinedIcon fontSize="inherit" />}
              sx={{ alignItems: "center" }}
            >
              <Typography variant="body2">{state.message}</Typography>
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {state.message}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

async function defaultCheckService(
  pincode: string,
  productId: string | number,
): Promise<PincodeCheckResult | null> {
  const result = await checkPincodeServiceability(pincode, productId);
  if (result.ok) return result.data;
  return null;
}
