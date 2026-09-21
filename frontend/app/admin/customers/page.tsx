"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  activateAdminCustomer,
  deactivateAdminCustomer,
  listAdminCustomers,
  type AdminCustomer,
} from "@/services/adminCustomerService";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listAdminCustomers(page, rowsPerPage);

      setCustomers(result.content);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setError(
        err?.message || "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleToggleStatus = async (customer: AdminCustomer) => {
    try {
      setActionLoading(customer.customerId);
      setError("");

      if (customer.active) {
        await deactivateAdminCustomer(customer.customerId);
      } else {
        await activateAdminCustomer(customer.customerId);
      }

      await loadCustomers();
    } catch (err: any) {
      console.error("Failed to update customer status:", err);
      setError(
        err?.message || "Unable to update customer status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const fullName =
      `${customer.firstName} ${customer.lastName}`.trim();

    return (
      fullName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      String(customer.customerId).includes(query) ||
      String(customer.userId).includes(query)
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
<Box
  sx={{
    mb: 3,
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    justifyContent: "space-between",
    alignItems: { xs: "flex-start", md: "center" },
    gap: 2,
  }}
>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Customers
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage registered NextCart customers and account status.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadCustomers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email, phone, customer ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              },
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Customer
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Customer ID
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  User ID
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Email
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Phone
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      sx={{
                        py: 7,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 7, textAlign: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600 }}
                      >
                        No customers found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try changing your search or refresh the list.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const fullName =
                    `${customer.firstName} ${customer.lastName}`.trim() ||
                    "Unnamed Customer";

                  const isActionLoading =
                    actionLoading === customer.customerId;

                  return (
                    <TableRow
                      key={customer.customerId}
                      hover
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          {fullName}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        #{customer.customerId}
                      </TableCell>

                      <TableCell>
                        #{customer.userId}
                      </TableCell>

                      <TableCell>
                        {customer.email || "—"}
                      </TableCell>

                      <TableCell>
                        {customer.phone || "—"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            customer.active
                              ? "Active"
                              : "Inactive"
                          }
                          color={
                            customer.active
                              ? "success"
                              : "default"
                          }
                          icon={
                            customer.active ? (
                              <CheckCircleIcon />
                            ) : (
                              <BlockIcon />
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          color={
                            customer.active
                              ? "error"
                              : "success"
                          }
                          startIcon={
                            isActionLoading ? (
                              <CircularProgress size={16} />
                            ) : customer.active ? (
                              <BlockIcon />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          disabled={isActionLoading}
                          onClick={() =>
                            handleToggleStatus(customer)
                          }
                        >
                          {isActionLoading
                            ? "Updating..."
                            : customer.active
                              ? "Deactivate"
                              : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, nextPage) => {
            setPage(nextPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Box>
  );
}