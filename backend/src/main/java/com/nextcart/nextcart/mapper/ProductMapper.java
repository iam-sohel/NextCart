package com.nextcart.nextcart.mapper;



import com.nextcart.nextcart.dto.product.ProductResponseDTO;
import com.nextcart.nextcart.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponseDTO toResponse(Product product) {

        ProductResponseDTO response = new ProductResponseDTO();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setBrand(product.getBrand());
        response.setPrice(product.getPrice());
        response.setOriginalPrice(product.getOriginalPrice());
        response.setDiscount(product.getDiscount());
        response.setRating(product.getRating());
        response.setReviewCount(product.getReviewCount());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setImage(product.getImage());

        return response;
    }
}