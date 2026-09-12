package com.nextcart.nextcart.seller_module.inventory_module.repository;

import com.nextcart.nextcart.seller_module.inventory_module.entity.Inventory;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.Warehouse;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByWarehouse(Warehouse warehouse);

    Optional<Inventory> findByWarehouseId(Long warehouseId);

    boolean existsByWarehouseId(Long warehouseId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.id = :id
            """)
    Optional<Inventory> findByIdForUpdate(
            @Param("id") Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.warehouse.id = :warehouseId
            """)
    Optional<Inventory> findByWarehouseIdForUpdate(
            @Param("warehouseId") Long warehouseId
    );
}