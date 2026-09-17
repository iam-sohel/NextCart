package com.nextcart.nextcart.seller_module.dashboard.service;

import com.nextcart.nextcart.order_module.OrderItemRepository;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;
import com.nextcart.nextcart.product_module.product_base.ProductStatus;
import com.nextcart.nextcart.seller_module.dashboard.dto.SellerDashboardResponse;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryItemRepository;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.sellerBank.repository.SellerBankRepository;
import com.nextcart.nextcart.seller_module.sellerKyc.repository.SellerKycRepository;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.WarehouseStatus;
import com.nextcart.nextcart.seller_module.warehouse_module.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerDashboardServiceImpl implements SellerDashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final SellerKycRepository sellerKycRepository;
    private final SellerBankRepository sellerBankRepository;

    @Override
    public SellerDashboardResponse getMyDashboard(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user id");
        }

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Seller profile not found"));

        Long sellerId = seller.getId();

        long totalProducts = productRepository.countBySellerId(sellerId);
        long activeProducts = productRepository.countBySellerIdAndStatus(sellerId, ProductStatus.ACTIVE);

        long totalOrders = orderItemRepository.countDistinctOrdersBySellerId(sellerId);

        SellerDashboardResponse.OrderSummary orders =
                SellerDashboardResponse.OrderSummary.builder()
                        .total(totalOrders)
                        .pending(countOrders(sellerId, OrderStatus.PENDING))
                        .confirmed(countOrders(sellerId, OrderStatus.CONFIRMED))
                        .processing(countOrders(sellerId, OrderStatus.PROCESSING))
                        .shipped(countOrders(sellerId, OrderStatus.SHIPPED))
                        .delivered(countOrders(sellerId, OrderStatus.DELIVERED))
                        .cancelled(countOrders(sellerId, OrderStatus.CANCELLED))
                        .returnRequested(countOrders(sellerId, OrderStatus.RETURN_REQUESTED))
                        .returnApproved(countOrders(sellerId, OrderStatus.RETURN_APPROVED))
                        .returned(countOrders(sellerId, OrderStatus.RETURNED))
                        .refunded(countOrders(sellerId, OrderStatus.REFUNDED))
                        .build();

        long totalInventoryItems = inventoryItemRepository.countBySellerId(sellerId);
        long lowStockItems = inventoryItemRepository.countBySellerIdAndAvailableStockLessThanEqual(
                sellerId,
                LOW_STOCK_THRESHOLD
        );
        long outOfStockItems = inventoryItemRepository.countBySellerIdAndAvailableStockLessThanEqual(
                sellerId,
                0
        );

        long availableStock = inventoryItemRepository.sumAvailableStockBySellerId(sellerId);
        long reservedStock = inventoryItemRepository.sumReservedStockBySellerId(sellerId);

        var warehouses = warehouseRepository.findBySellerOrderByCreatedAtDesc(seller);
        long activeWarehouses = warehouses.stream()
                .filter(w -> w.getStatus() == WarehouseStatus.ACTIVE)
                .count();

        String kycStatus = sellerKycRepository.findBySellerId(sellerId)
                .map(kyc -> kyc.getStatus() == null ? null : kyc.getStatus().name())
                .orElse(null);

        String bankStatus = sellerBankRepository.findBySellerId(sellerId)
                .map(bank -> bank.getVerificationStatus() == null
                        ? null
                        : bank.getVerificationStatus().name())
                .orElse(null);

        return SellerDashboardResponse.builder()
                .seller(SellerDashboardResponse.SellerSummary.builder()
                        .sellerId(sellerId)
                        .businessName(seller.getBusinessName())
                        .verified(seller.isVerified())
                        .active(seller.isActive())
                        .build())
                .products(SellerDashboardResponse.ProductSummary.builder()
                        .total(totalProducts)
                        .active(activeProducts)
                        .inactive(totalProducts - activeProducts)
                        .build())
                .orders(orders)
                .inventory(SellerDashboardResponse.InventorySummary.builder()
                        .totalItems(totalInventoryItems)
                        .lowStockItems(lowStockItems)
                        .outOfStockItems(outOfStockItems)
                        .availableStock(availableStock)
                        .reservedStock(reservedStock)
                        .lowStockThreshold(LOW_STOCK_THRESHOLD)
                        .build())
                .sales(SellerDashboardResponse.SalesSummary.builder()
                        .totalSalesAmount(defaultAmount(orderItemRepository.sumSalesBySellerId(sellerId)))
                        .deliveredSalesAmount(defaultAmount(orderItemRepository.sumSalesBySellerIdAndOrderStatus(sellerId, OrderStatus.DELIVERED)))
                        .refundedSalesAmount(defaultAmount(orderItemRepository.sumSalesBySellerIdAndOrderStatus(sellerId, OrderStatus.REFUNDED)))
                        .build())
                .warehouses(SellerDashboardResponse.WarehouseSummary.builder()
                        .total(warehouses.size())
                        .active(activeWarehouses)
                        .inactive(warehouses.size() - activeWarehouses)
                        .build())
                .verification(SellerDashboardResponse.VerificationSummary.builder()
                        .kycStatus(kycStatus)
                        .bankStatus(bankStatus)
                        .build())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private long countOrders(Long sellerId, OrderStatus status) {
        return orderItemRepository.countDistinctOrdersBySellerIdAndOrderStatus(sellerId, status);
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}
