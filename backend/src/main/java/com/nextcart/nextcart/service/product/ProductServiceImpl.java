package com.nextcart.nextcart.service.product;

import com.nextcart.nextcart.dto.product.ProductRequestDTO;
import com.nextcart.nextcart.dto.product.ProductResponseDTO;
import com.nextcart.nextcart.entity.Product;
import com.nextcart.nextcart.exception.product.ProductAlreadyExistsException;
import com.nextcart.nextcart.exception.product.ProductNotFoundException;
import com.nextcart.nextcart.mapper.ProductMapper;
import com.nextcart.nextcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO request) {

        if (productRepository.existsBySlug(request.getSlug())) {
            throw new ProductAlreadyExistsException(
                    "Product with slug already exists: " + request.getSlug()
            );
        }

        Product product = new Product();

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscount(request.getDiscount());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImage(request.getImage());

        product.setRating(BigDecimal.ZERO);
        product.setReviewCount(0);

        Product savedProduct = productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponseDTO updateProduct(
            Long id,
            ProductRequestDTO request
    ) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        if (!product.getSlug().equals(request.getSlug())
                && productRepository.existsBySlug(request.getSlug())) {

            throw new ProductAlreadyExistsException(
                    "Product with slug already exists: " + request.getSlug()
            );
        }

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscount(request.getDiscount());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImage(request.getImage());

        Product updatedProduct = productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + id
            );
        }

        productRepository.deleteById(id);
    }

    @Override
    public ProductResponseDTO getProductBySlug(String slug) {

        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with slug: " + slug
                        )
                );

        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponseDTO> getProductsByCategory(String category) {

        return productRepository.findByCategory(category)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponseDTO> getProductsByBrand(String brand) {

        return productRepository.findByBrand(brand)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponseDTO> searchProducts(String keyword) {

        return productRepository
                .findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(
                        keyword,
                        keyword
                )
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public Page<ProductResponseDTO> getProductsWithPagination(
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        Sort sort;

        if ("desc".equalsIgnoreCase(direction)) {
            sort = Sort.by(sortBy).descending();
        } else {
            sort = Sort.by(sortBy).ascending();
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                sort
        );

        return productRepository
                .findAll(pageable)
                .map(productMapper::toResponse);
    }

    @Override
    public Page<ProductResponseDTO> filterProducts(
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size
        );

        return productRepository
                .findProductsWithFilters(
                        category,
                        brand,
                        minPrice,
                        maxPrice,
                        pageable
                )
                .map(productMapper::toResponse);
    }
}