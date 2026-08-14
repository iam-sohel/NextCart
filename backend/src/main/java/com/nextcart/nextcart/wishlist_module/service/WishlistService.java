package com.nextcart.nextcart.wishlist_module.service;

import java.util.List;

import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;

public interface WishlistService {

    WishlistResponseDTO addToWishlist(Long userId, Long productId);

    List<WishlistResponseDTO> getUserWishlist(Long userId);

    void removeFromWishlist(Long userId, Long productId);

    void clearWishlist(Long userId);
}