package com.nextcart.nextcart.seller_module.warehouse_module.repository;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.Warehouse;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findBySellerOrderByCreatedAtDesc(Seller seller);

    List<Warehouse> findBySellerAndStatusOrderByCreatedAtDesc(
            Seller seller,
            WarehouseStatus status
    );

    Optional<Warehouse> findByIdAndSeller(
            Long id,
            Seller seller
    );

    boolean existsByIdAndSeller(
            Long id,
            Seller seller
    );
}