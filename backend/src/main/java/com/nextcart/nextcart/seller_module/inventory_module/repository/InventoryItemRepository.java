package com.nextcart.nextcart.seller_module.inventory_module.repository;

import com.nextcart.nextcart.seller_module.inventory_module.entity.InventoryItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository
        extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByInventoryIdAndProductVariantId(
            Long inventoryId,
            Long productVariantId
    );

    boolean existsByInventoryIdAndProductVariantId(
            Long inventoryId,
            Long productVariantId
    );

    List<InventoryItem> findByInventoryId(Long inventoryId);

    List<InventoryItem> findByProductVariantId(Long productVariantId);

    // ============================
    // Seller Dashboard
    // ============================

    @Query("""
            SELECT COUNT(i)
            FROM InventoryItem i
            WHERE i.productVariant.productEntity.seller.id = :sellerId
            """)
    long countBySellerId(
            @Param("sellerId") Long sellerId
    );

    @Query("""
            SELECT COUNT(i)
            FROM InventoryItem i
            WHERE i.productVariant.productEntity.seller.id = :sellerId
            AND i.availableStock <= :stock
            """)
    long countBySellerIdAndAvailableStockLessThanEqual(
            @Param("sellerId") Long sellerId,
            @Param("stock") Integer stock
    );

    @Query("""
            SELECT COALESCE(SUM(i.availableStock), 0)
            FROM InventoryItem i
            WHERE i.productVariant.productEntity.seller.id = :sellerId
            """)
    long sumAvailableStockBySellerId(
            @Param("sellerId") Long sellerId
    );

    @Query("""
            SELECT COALESCE(SUM(i.reservedStock), 0)
            FROM InventoryItem i
            WHERE i.productVariant.productEntity.seller.id = :sellerId
            """)
    long sumReservedStockBySellerId(
            @Param("sellerId") Long sellerId
    );

    // ============================
    // Existing Lock Queries
    // ============================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM InventoryItem i
            WHERE i.id = :id
            """)
    Optional<InventoryItem> findByIdForUpdate(
            @Param("id") Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM InventoryItem i
            WHERE i.inventory.id = :inventoryId
            AND i.productVariant.id = :productVariantId
            """)
    Optional<InventoryItem> findByInventoryIdAndProductVariantIdForUpdate(
            @Param("inventoryId") Long inventoryId,
            @Param("productVariantId") Long productVariantId
    );
}