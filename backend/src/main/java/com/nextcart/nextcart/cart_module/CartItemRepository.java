package com.nextcart.nextcart.cart_module;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductVariantId(
            Long cartId,
            Long productVariantId
    );

    boolean existsByCartIdAndProductVariantId(
            Long cartId,
            Long productVariantId
    );

    Optional<CartItem> findByIdAndCartId(
            Long itemId,
            Long cartId
    );

    @Modifying
    @Query("""
        DELETE FROM CartItem ci
        WHERE ci.cart.id = :cartId
    """)
    void deleteByCartId(
            @Param("cartId") Long cartId
    );
}