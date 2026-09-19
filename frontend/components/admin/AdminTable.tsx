"use client";

import type { ReactNode } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { AdminEmptyState } from "@/components/admin/AdminStates";

/**
 * NEXTCART — Generic admin table.
 *
 * A reusable MUI table abstraction for future admin list pages. It renders
 * only caller-supplied columns and rows, supports responsive column hiding,
 * and delegates pagination, sorting, filtering, and row actions to consuming
 * pages. It never assumes backend pagination behavior.
 */

export interface AdminTableColumn<TRow> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  minWidth?: number | string;
  hideOnMobile?: boolean;
  renderCell: (row: TRow, rowIndex: number) => ReactNode;
}

interface AdminTableProps<TRow> {
  ariaLabel: string;
  columns: AdminTableColumn<TRow>[];
  rows: TRow[];
  getRowId: (row: TRow, rowIndex: number) => string | number;
  getRowLabel?: (row: TRow, rowIndex: number) => string;
  loading?: boolean;
  loadingRowCount?: number;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  minWidth?: number | string;
  onRowClick?: (row: TRow, rowIndex: number) => void;
  renderRowActions?: (row: TRow, rowIndex: number) => ReactNode;
}

function responsiveCellDisplay(hideOnMobile?: boolean) {
  if (!hideOnMobile) return undefined;
  return { xs: "none", md: "table-cell" };
}

export default function AdminTable<TRow>({
  ariaLabel,
  columns,
  rows,
  getRowId,
  getRowLabel,
  loading = false,
  loadingRowCount = 5,
  emptyTitle,
  emptyDescription,
  emptyAction,
  toolbar,
  footer,
  minWidth = 720,
  onRowClick,
  renderRowActions,
}: AdminTableProps<TRow>) {
  const actionColumnVisible = Boolean(renderRowActions);
  const columnCount = columns.length + (actionColumnVisible ? 1 : 0);

  if (loading) {
    return (
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table aria-label={ariaLabel} aria-busy="true" sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    component="th"
                    scope="col"
                    align={column.align ?? "left"}
                    sx={{ display: responsiveCellDisplay(column.hideOnMobile) }}
                  >
                    {column.header}
                  </TableCell>
                ))}
                {actionColumnVisible ? (
                  <TableCell component="th" scope="col" align="right">
                    Actions
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: loadingRowCount }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={Math.max(columnCount, 1)}>
                    <Typography variant="body2" color="text.secondary">
                      Loading row {index + 1}…
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (rows.length === 0) {
    return (
      <>
        {toolbar}
        <AdminEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
        {footer}
      </>
    );
  }

  return (
    <>
      {toolbar}
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table aria-label={ariaLabel} sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    component="th"
                    scope="col"
                    align={column.align ?? "left"}
                    sx={{
                      width: column.width,
                      minWidth: column.minWidth,
                      display: responsiveCellDisplay(column.hideOnMobile),
                    }}
                  >
                    {column.header}
                  </TableCell>
                ))}
                {actionColumnVisible ? (
                  <TableCell component="th" scope="col" align="right">
                    Actions
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow
                  key={getRowId(row, rowIndex)}
                  hover={Boolean(onRowClick)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row, rowIndex);
                          }
                        }
                      : undefined
                  }
                  aria-label={
                    onRowClick
                      ? (getRowLabel?.(row, rowIndex) ?? `Row ${rowIndex + 1}`)
                      : undefined
                  }
                  sx={
                    onRowClick
                      ? {
                          cursor: "pointer",
                          "&:focus-visible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: -2,
                          },
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align ?? "left"}
                      sx={{
                        width: column.width,
                        minWidth: column.minWidth,
                        display: responsiveCellDisplay(column.hideOnMobile),
                      }}
                    >
                      {column.renderCell(row, rowIndex)}
                    </TableCell>
                  ))}
                  {renderRowActions ? (
                    <TableCell align="right">
                      {renderRowActions(row, rowIndex)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {footer}
    </>
  );
}
