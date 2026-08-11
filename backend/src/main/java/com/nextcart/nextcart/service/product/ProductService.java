package com.nextcart.nextcart.service.product;

import com.nextcart.nextcart.dto.product.ProductRequestDTO;
import com.nextcart.nextcart.dto.product.ProductResponseDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponseDTO createProduct(ProductRequestDTO request);
    ProductResponseDTO getProductById(Long id);
    List<ProductResponseDTO> getAllProducts();
    ProductResponseDTO updateProduct(Long id, ProductRequestDTO request);
    void deleteProduct(Long id);

    // Get by slug
    ProductResponseDTO getProductBySlug(String slug);

    // Get by category
    List<ProductResponseDTO> getProductsByCategory(String category);

    // Get by brand
    List<ProductResponseDTO> getProductsByBrand(String brand);

    // Search
    List<ProductResponseDTO> searchProducts(String keyword);

    // Pagination + Sorting
    Page<ProductResponseDTO> getProductsWithPagination(
            int page,
            int size,
            String sortBy,
            String direction
    );

    // Filtering
    Page<ProductResponseDTO> filterProducts(
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    );
}