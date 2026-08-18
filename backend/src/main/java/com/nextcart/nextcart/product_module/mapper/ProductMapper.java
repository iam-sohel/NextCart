package com.nextcart.nextcart.product_module.mapper;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.brand_module.entity.Brand;

import com.nextcart.nextcart.product_module.dto.product.ProductCreateRequest;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;

import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(
            ProductCreateRequest request,
            Category category,
            SubCategory subCategory,
            Brand brand) {

        Product product = new Product();

        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setBrand(brand);

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());


        return product;
    }

    public ProductResponse toResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());

        response.setCategoryId(
                product.getCategory().getId()
        );

        response.setCategoryName(
                product.getCategory().getName()
        );

        response.setSubCategoryId(
                product.getSubCategory().getId()
        );

        response.setSubCategoryName(
                product.getSubCategory().getName()
        );

        response.setBrandId(
                product.getBrand().getId()
        );

        response.setBrandName(
                product.getBrand().getName()
        );

        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());


        return response;
    }

    public void updateEntity(
            ProductUpdateRequest request,
            Category category,
            SubCategory subCategory,
            Brand brand,
            Product product) {

        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setBrand(brand);

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());

    }
}