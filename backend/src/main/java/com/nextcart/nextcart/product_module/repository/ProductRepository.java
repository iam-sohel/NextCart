package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
