package com.nextcart.nextcart.inventory_module.repository;

import com.nextcart.nextcart.inventory_module.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    boolean existsByVariantId(Long variantId);
}

