package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.VariantAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VariantAttributeRepository
        extends JpaRepository<VariantAttribute, Long> {

    List<VariantAttribute> findByVariantId(Long variantId);

    boolean existsByVariantIdAndAttributeNameIgnoreCase(
            Long variantId,
            String attributeName
    );
}