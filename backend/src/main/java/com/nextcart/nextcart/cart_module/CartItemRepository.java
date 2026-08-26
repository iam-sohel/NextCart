package com.nextcart.nextcart.cart_module;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

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

    void deleteByCartId(Long cartId);
}