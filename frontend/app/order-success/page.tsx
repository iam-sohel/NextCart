import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrderSuccessClient from "./OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <>
      <Header />

      <Suspense
        fallback={
          <Box
            sx={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <OrderSuccessClient />
      </Suspense>

      <Footer />
    </>
  );
}