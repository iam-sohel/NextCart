package com.nextcart.nextcart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import com.nextcart.nextcart.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    @Modifying
    void deleteByCartIdAndProductId(Long cartId, Long productId);

    @Modifying
    void deleteByCartId(Long cartId);
}