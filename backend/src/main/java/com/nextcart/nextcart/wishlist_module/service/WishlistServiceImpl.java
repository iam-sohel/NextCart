package com.nextcart.nextcart.wishlist_module.service;

import com.nextcart.nextcart.product_module.productVariant.entity.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.repository.ProductVariantRepository;
import com.nextcart.nextcart.product_module.product_base.entity.ProductEntity;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;
import com.nextcart.nextcart.wishlist_module.entity.Wishlist;
import com.nextcart.nextcart.wishlist_module.exceptions.WishlistAlreadyExistsException;
import com.nextcart.nextcart.wishlist_module.exceptions.WishlistNotFoundException;
import com.nextcart.nextcart.wishlist_module.exceptions.WishlistProductNotFoundException;
import com.nextcart.nextcart.wishlist_module.exceptions.WishlistUserNotFoundException;
import com.nextcart.nextcart.wishlist_module.repository.WishlistRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new WishlistUserNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        List<ProductVariantEntity> variants =
                productVariantRepository.findByProductEntity_Id(productId);

        if (variants.isEmpty()) {
            throw new WishlistProductNotFoundException(
                    "No product variant found for product id: " + productId
            );
        }

        ProductVariantEntity variant = variants.get(0);

        if (wishlistRepository.existsByUser_IdAndProductVariant_Id(
                userId,
                variant.getId())) {

            throw new WishlistAlreadyExistsException(
                    "Product is already in the wishlist"
            );
        }

        Wishlist wishlist = new Wishlist(user, variant);

        Wishlist savedWishlist = wishlistRepository.save(wishlist);

        return mapToDTO(savedWishlist);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponseDTO> getUserWishlist(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new WishlistUserNotFoundException(
                    "User not found with id: " + userId
            );
        }

        return wishlistRepository
                .findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void removeFromWishlist(
            Long userId,
            Long productId) {

        List<ProductVariantEntity> variants =
                productVariantRepository.findByProductEntity_Id(productId);

        if (variants.isEmpty()) {
            throw new WishlistProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        ProductVariantEntity variant = variants.get(0);

        if (!wishlistRepository.existsByUser_IdAndProductVariant_Id(
                userId,
                variant.getId())) {

            throw new WishlistNotFoundException(
                    "Product is not present in wishlist"
            );
        }

        wishlistRepository.deleteByUser_IdAndProductVariant_Id(
                userId,
                variant.getId()
        );
    }

    @Override
    public void clearWishlist(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new WishlistUserNotFoundException(
                    "User not found with id: " + userId
            );
        }

        wishlistRepository.deleteByUser_Id(userId);
    }

    private WishlistResponseDTO mapToDTO(Wishlist wishlist) {

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