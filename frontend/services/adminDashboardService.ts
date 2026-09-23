import { listAdminSellers } from "@/services/adminSellerService";
import { listAdminCustomers } from "@/services/adminCustomerService";
import { listAdminOrders } from "@/services/adminOrderService";
import { listAdminKyc } from "@/services/adminKycService";

export interface AdminDashboardSummary {
  totalSellers: number;
  totalCustomers: number;
  totalOrders: number;
  pendingKyc: number;
}

/**
 * Failure contract: every underlying call either resolves with real data
 * or throws. `listAdminCustomers`, `listAdminOrders` and `listAdminKyc`
 * throw on transport/API failure (they never resolve failure as empty
 * data), and the seller call is checked below — so a rejection here always
 * means "could not load", never "zero". Callers must treat a throw as an
 * error state, not an empty dashboard.
 */
export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [
    sellersResult,
    customersResult,
    ordersResult,
    kycResult,
  ] = await Promise.all([
    listAdminSellers({ page: 0, size: 1 }),
    listAdminCustomers(0, 1),
    listAdminOrders(0, 1),
    listAdminKyc({
      pendingOnly: true,
      page: 0,
      size: 1,
    }),
  ]);

  if (!sellersResult.ok) {
    throw new Error(
      sellersResult.message ||
        "Unable to load seller count.",
    );
  }

  return {
    totalSellers:
      sellersResult.data.totalElements,

    totalCustomers:
      customersResult.totalElements,

    totalOrders:
      ordersResult.totalElements,

    pendingKyc:
      kycResult.totalElements,
  };
}

export async function getAdminDashboardRecentOrders() {
  const result = await listAdminOrders(0, 5);

  return result.content;
}