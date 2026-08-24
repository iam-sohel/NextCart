package com.nextcart.nextcart.product_module.discount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductVariantDiscountRepository
        extends JpaRepository<ProductVariantDiscountEntity, Long> {

    List<ProductVariantDiscountEntity>
    findByProductVariantIdOrderByStartAtDesc(
            Long productVariantId
    );

    List<ProductVariantDiscountEntity>
    findByProductVariantIdAndActiveTrueOrderByStartAtDesc(
            Long productVariantId
    );

    @Query("""
            SELECT d
            FROM ProductVariantDiscountEntity d
            WHERE d.productVariant.id = :productVariantId
              AND d.active = true
              AND d.startAt <= :now
              AND (
                    d.endAt IS NULL
                    OR d.endAt >= :now
                  )
            ORDER BY d.startAt DESC
            """)
    Optional<ProductVariantDiscountEntity> findCurrentDiscount(
            @Param("productVariantId") Long productVariantId,
            @Param("now") LocalDateTime now
    );
}