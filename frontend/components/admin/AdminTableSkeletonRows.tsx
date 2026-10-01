"use client";

import { Skeleton, TableCell, TableRow } from "@mui/material";

/**
 * HAVLOOK — Admin table skeleton rows.
 *
 * Layout-preserving loading placeholder for admin data tables: five text
 * skeleton rows matching the table's column count. Rendered inside
 * `<TableBody>` while the page request is in flight so the table
 * structure does not jump when real data arrives. Skeletons are
 * decorative only and never carry business data.
 */
export default function AdminTableSkeletonRows({
  rows = 5,
  columns,
}: {
  rows?: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
