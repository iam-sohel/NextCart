package com.nextcart.nextcart.inventory_module;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<InventoryEntity,Long> {

    Optional<InventoryEntity> findByProductVariantId(Long productVariantId);

    boolean existsByProductVariantId(Long productVariantId);
}