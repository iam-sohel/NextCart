package com.nextcart.nextcart.wishlist_module.service;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.product_base.ProductEntity;
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
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductVariantRepository productVariantRepository) {

        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Override
    public WishlistResponseDTO addToWishlist(
            Long userId,
            Long productId) {

        if (wishlistRepository.existsByUserIdAndProductId(
                userId,
                productId)) {

            throw new RuntimeException(
                    "Product is already in the wishlist"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId
                        )
                );

        List<ProductVariantEntity> variants =
                productVariantRepository
                        .findByProductId(productId);

        if (variants.isEmpty()) {
            throw new RuntimeException(
                    "No product variant found for product id: "
                            + productId
            );
        }

        ProductVariantEntity variant =
                variants.get(0);

        Wishlist wishlist =
                new Wishlist(user, variant);

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
                    "User not found with id: " + userId
            );
        }

        List<Wishlist> wishlists =
                wishlistRepository
                        .findByUserIdOrderByCreatedAtDesc(userId);

        return wishlists.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void removeFromWishlist(
            Long userId,
            Long productId) {

        if (!wishlistRepository.existsByUserIdAndProductId(
                userId,
                productId)) {

            throw new RuntimeException(
                    "Product not found in wishlist"
            );
        }

        wishlistRepository.deleteByUserIdAndProductId(
                userId,
                productId
        );
    }

    @Override
    public void clearWishlist(Long userId) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found with id: " + userId
            );
        }

        wishlistRepository.deleteByUserId(userId);
    }

    private WishlistResponseDTO mapToDTO(
            Wishlist wishlist) {

        ProductVariantEntity variant =
                wishlist.getProductVariant();

        ProductEntity product =
                variant.getProductEntity();

        return new WishlistResponseDTO(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                null,
                null,
                wishlist.getCreatedAt()
        );
    }
}