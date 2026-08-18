package com.nextcart.nextcart.wishlist_module.service;

import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductVariant;
import com.nextcart.nextcart.product_module.repository.ProductRepository;
import com.nextcart.nextcart.product_module.repository.ProductVariantRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;
import com.nextcart.nextcart.wishlist_module.entity.Wishlist;
import com.nextcart.nextcart.wishlist_module.repository.WishlistRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository) {

        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Override
    @Transactional
    public WishlistResponseDTO addToWishlist(
            Long userId,
            Long productId) {

        if (wishlistRepository.existsByUserIdAndProductId(
                userId, productId)) {

            throw new RuntimeException(
                    "Product is already in the wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + productId));

        Wishlist wishlist = new Wishlist(user, product);

        Wishlist savedWishlist =
                wishlistRepository.save(wishlist);

        return mapToDTO(savedWishlist);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponseDTO> getUserWishlist(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User not found with id: " + userId);
        }

        List<Wishlist> wishlists =
                wishlistRepository
                        .findByUserIdOrderByCreatedAtDesc(userId);

        return wishlists.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeFromWishlist(
            Long userId,
            Long productId) {

        if (!wishlistRepository.existsByUserIdAndProductId(
                userId, productId)) {

            throw new RuntimeException(
                    "Product not found in wishlist");
        }

        wishlistRepository.deleteByUserIdAndProductId(
                userId, productId);
    }

    @Override
    @Transactional
    public void clearWishlist(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User not found with id: " + userId);
        }

        wishlistRepository.deleteByUserId(userId);
    }

    private WishlistResponseDTO mapToDTO(
            Wishlist wishlist) {

        Product product = wishlist.getProduct();

        List<ProductVariant> variants =
                productVariantRepository
                        .findByProductId(product.getId());

        Double priceValue = null;

        if (!variants.isEmpty()
                && variants.get(0).getPrice() != null) {

            priceValue = variants.get(0)
                    .getPrice()
                    .doubleValue();
        }

        return new WishlistResponseDTO(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                priceValue,
                null,
                wishlist.getCreatedAt()
        );
    }
}