"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

/**
 * NEXTCART — Admin confirmation dialog.
 *
 * A reusable confirmation dialog for future destructive or state-changing
 * admin actions. The dialog performs no API calls: the consuming page owns
 * validation, mutation, loading state, and success/error handling.
 */

interface ConfirmActionDialogProps {
  id: string;
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirming?: boolean;
  disabled?: boolean;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmActionDialog({
  id,
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirming = false,
  disabled = false,
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  const handleClose = () => {
    if (confirming) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      <DialogTitle id={`${id}-title`}>{title}</DialogTitle>

      {description ? (
        <DialogContent>
          <DialogContentText id={`${id}-description`}>
            {description}
          </DialogContentText>
        </DialogContent>
      ) : null}

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={confirming || disabled}
          sx={{ minHeight: 44 }}
        >
          {cancelLabel}
        </Button>
        <Button
          color={tone === "danger" ? "error" : "primary"}
          variant="contained"
          onClick={() => void onConfirm()}
          disabled={confirming || disabled}
          sx={{ minHeight: 44 }}
        >
          {confirming ? "Working…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
