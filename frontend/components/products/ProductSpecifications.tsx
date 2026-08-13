"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

interface SpecificationRow {
  key: string;
  value: string;
}

interface ProductSpecificationsProps {
  /**
   * Specification map. Rendered in iteration order — callers that need a
   * specific sequence should pass an ordered array of {key, value} tuples
   * via `rows` instead.
   */
  specifications?: Record<string, string>;
  /**
   * Optional explicit row order. When provided, takes precedence over the
   * record. Lets the product page enforce a canonical ordering even
   * when the backend returns the data as an object.
   */
  rows?: SpecificationRow[];
}

const BACKEND_PREFERRED_ORDER = [
  "Brand",
  "Model",
  "Category",
  "Color",
  "Material",
  "Display",
  "Screen Size",
  "Processor",
  "RAM",
  "Storage",
  "Camera",
  "Battery",
  "OS",
  "Connectivity",
  "Warranty",
  "In the Box",
];

/**
 * NEXTCART — ProductSpecifications
 *
 * Renders a clean key/value table for product attributes.
 *
 * Behaviour:
 *   - Sources rows from `rows` (preferred, ordered), else from the
 *     `specifications` record (sorted by a backend-aware key order, then
 *     any remaining entries alphabetically).
 *   - When no specs are supplied the entire block renders nothing — we
 *     don't want a "Specifications" heading on top of an empty table.
 */
export default function ProductSpecifications({
  specifications,
  rows,
}: ProductSpecificationsProps) {
  const orderedRows = computeRowOrder(rows, specifications);

  if (orderedRows.length === 0) return null;

  return (
    <Card
      sx={{ mt: 4, borderRadius: 2 }}
      aria-labelledby="product-specifications-heading"
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography
          id="product-specifications-heading"
          variant="h5"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Specifications
        </Typography>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableBody>
              {orderedRows.map((row, idx) => (
                <TableRow
                  key={row.key}
                  sx={{
                    bgcolor:
                      idx % 2 === 0 ? "background.paper" : "action.hover",
                  }}
                >
                  <TableCell
                    sx={{
                      width: { xs: "40%", md: "30%" },
                      fontWeight: 700,
                      color: "text.primary",
                      borderColor: "divider",
                      verticalAlign: "top",
                      py: 1.5,
                    }}
                  >
                    {row.key}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderColor: "divider",
                      py: 1.5,
                    }}
                  >
                    {row.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}

function computeRowOrder(
  rows: SpecificationRow[] | undefined,
  record: Record<string, string> | undefined,
): SpecificationRow[] {
  if (rows && rows.length > 0) {
    return rows.filter((r) => r && r.key && r.value !== undefined);
  }
  if (!record) return [];

  const providedKeys = Object.keys(record);
  const preferredFirst = BACKEND_PREFERRED_ORDER.filter((k) =>
    providedKeys.includes(k),
  );
  const remaining = providedKeys
    .filter((k) => !preferredFirst.includes(k))
    .sort((a, b) => a.localeCompare(b));

  const ordered = [...preferredFirst, ...remaining];
  return ordered.map((key) => ({ key, value: record[key] }));
}
