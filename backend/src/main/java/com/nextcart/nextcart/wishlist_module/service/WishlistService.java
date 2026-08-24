package com.nextcart.nextcart.wishlist_module.service;

import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {

    WishlistResponseDTO addToWishlist(Long userId, Long productId);

    List<WishlistResponseDTO> getUserWishlist(Long userId);

    void removeFromWishlist(Long userId, Long productId);

    void clearWishlist(Long userId);
}