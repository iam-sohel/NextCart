package com.nextcart.nextcart.wishlist_module.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nextcart.nextcart.wishlist_module.entity.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByUser_IdAndProductVariant_Id(
            Long userId,
            Long productVariantId
    );

    Optional<Wishlist> findByUser_IdAndProductVariant_Id(
            Long userId,
            Long productVariantId
    );

    void deleteByUser_IdAndProductVariant_Id(
            Long userId,
            Long productVariantId
    );

    void deleteByUser_Id(Long userId);
}