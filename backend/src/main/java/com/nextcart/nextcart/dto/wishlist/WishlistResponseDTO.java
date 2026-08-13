package com.nextcart.nextcart.dto.wishlist;

import java.time.LocalDateTime;

public class WishlistResponseDTO {

    private Long wishlistId;
    private Long productId;
    private String productName;
    private String productDescription;
    private Double price;
    private String imageUrl;
    private LocalDateTime addedAt;

    public WishlistResponseDTO() {
    }

    public WishlistResponseDTO(Long wishlistId, Long productId, String productName, String productDescription, Double price, String imageUrl, LocalDateTime addedAt) {
        this.wishlistId = wishlistId;
        this.productId = productId;
        this.productName = productName;
        this.productDescription = productDescription;
        this.price = price;
        this.imageUrl = imageUrl;
        this.addedAt = addedAt;
    }

    public Long getWishlistId() {
        return wishlistId;
    }

    public void setWishlistId(Long wishlistId) {
        this.wishlistId = wishlistId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}