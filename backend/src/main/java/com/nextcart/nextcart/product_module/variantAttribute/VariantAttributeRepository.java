package com.nextcart.nextcart.product_module.variantAttribute;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VariantAttributeRepository extends JpaRepository<VariantAttributeEntity, Long> {

    List<VariantAttributeEntity> findByVariantId(Long variantId);

    List<VariantAttributeEntity> findByVariantIdOrderByAttributeNameAsc(Long variantId);

    Optional<VariantAttributeEntity> findByVariantIdAndAttributeNameIgnoreCase(Long variantId, String attributeName);

    boolean existsByVariantIdAndAttributeNameIgnoreCase(Long variantId, String attributeName);

    boolean existsByVariantIdAndAttributeNameIgnoreCaseAndIdNot(Long variantId, String attributeName, Long id);

    void deleteByVariantId(Long variantId);
}