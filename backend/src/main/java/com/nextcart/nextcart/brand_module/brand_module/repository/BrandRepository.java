package com.nextcart.nextcart.brand_module.repository;

import com.nextcart.nextcart.brand_module.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    boolean existsByNameIgnoreCase(String name);
}