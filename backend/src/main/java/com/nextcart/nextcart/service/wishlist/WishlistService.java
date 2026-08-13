package com.nextcart.nextcart.service.wishlist;

import java.util.List;

import com.nextcart.nextcart.dto.wishlist.WishlistResponseDTO;

public interface WishlistService {

    WishlistResponseDTO addToWishlist(Long userId, Long productId);

    List<WishlistResponseDTO> getUserWishlist(Long userId);

    void removeFromWishlist(Long userId, Long productId);

    void clearWishlist(Long userId);
}