package com.nextcart.nextcart.inventory_module;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {

    Optional<InventoryEntity> findByProductVariantId(Long productVariantId);

    List<InventoryEntity> findByProductVariantIdIn(List<Long> productVariantIds);

    boolean existsByProductVariantId(Long productVariantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM InventoryEntity i
            WHERE i.productVariant.id = :productVariantId
            """)
    Optional<InventoryEntity> findByProductVariantIdForUpdate(@Param("productVariantId") Long productVariantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM InventoryEntity i
            WHERE i.id = :id
            """)
    Optional<InventoryEntity> findByIdForUpdate(@Param("id") Long id);
}