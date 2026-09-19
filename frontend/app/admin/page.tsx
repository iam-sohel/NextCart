import type { Metadata } from "next";

import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export const metadata: Metadata = {
  title: "Admin Console • NextCart",
  description: "NextCart administration landing page.",
};

const PLANNED_MODULES = [
  "Sellers",
  "KYC",
  "Customers",
  "Orders",
  "Catalog",
  "Products",
];

/**
 * NEXTCART — Temporary admin dashboard landing page.
 *
 * This is intentionally data-free. It establishes the dashboard route and
 * layout without inventing KPIs, revenue, charts, or API calls. Module pages
 * will connect to audited backend APIs in later phases.
 */
export default function AdminDashboardPage() {
  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Admin Console
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This workspace is ready for backend-connected administration. No
        business metrics are shown until their modules are implemented.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Planned modules
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These areas will display real backend data as each module is
                connected. Nothing here is a placeholder metric.
              </Typography>

              <List disablePadding>
                {PLANNED_MODULES.map((module) => (
                  <ListItem key={module} disableGutters sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={module}
                      slotProps={{
                        primary: { sx: { fontWeight: 600 } },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Data status
              </Typography>

              <Typography variant="body2" color="text.secondary">
                No customer, seller, order, catalog, payment, report, or audit
                data has been loaded on this page.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
