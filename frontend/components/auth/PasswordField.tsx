"use client";

import { useState } from "react";

import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

/**
 * NEXTCART — Password input with visibility toggle
 *
 * Wraps the theme's `MuiTextField` so we get the orange focus ring,
 * cream canvas, and small size for free. The toggle button is an
 * `endAdornment` so it lines up with standard MUI inputs and stays
 * accessible (it has an aria-label).
 *
 * Reused by both login + signup + forgot-password so we don't duplicate
 * the visibility-toggle plumbing.
 */
interface PasswordFieldProps
  extends Omit<TextFieldProps, "type" | "slotProps"> {
  name: string;
  label: string;
  autoComplete?: string;
}

export default function PasswordField(props: PasswordFieldProps) {
  const { name, label, autoComplete, sx, ...rest } = props;
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      name={name}
      label={label}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      fullWidth
      size="small"
      sx={sx}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                onClick={() => setVisible((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                tabIndex={-1}
              >
                {visible ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
}
