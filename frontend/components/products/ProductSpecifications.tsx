"use client";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@mui/material";

import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export default function ProductSpecifications({
  product,
}: Props) {
  return (
    <Card
      sx={{
        mt: 5,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Specifications
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Table>
          <TableBody>
            <TableRow>
              <TableCell><b>Brand</b></TableCell>
              <TableCell>{product.brand}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><b>Category</b></TableCell>
              <TableCell>{product.category}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><b>Color</b></TableCell>
              <TableCell>{product.color}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><b>Warranty</b></TableCell>
              <TableCell>{product.warranty}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><b>Stock</b></TableCell>
              <TableCell>{product.stock}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell><b>Delivery</b></TableCell>
              <TableCell>{product.delivery}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}