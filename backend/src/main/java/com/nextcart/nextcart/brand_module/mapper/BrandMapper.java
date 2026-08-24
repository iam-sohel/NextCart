package com.nextcart.nextcart.brand_module.mapper;

import com.nextcart.nextcart.brand_module.dto.BrandCreateRequest;
import com.nextcart.nextcart.brand_module.dto.BrandResponse;
import com.nextcart.nextcart.brand_module.dto.BrandUpdateRequest;
import com.nextcart.nextcart.brand_module.entity.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public Brand toEntity(BrandCreateRequest request) {

        Brand brand = new Brand();

        brand.setName(request.getName().trim());

        return brand;
    }

    public BrandResponse toResponse(Brand brand) {

        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .status(brand.getStatus())
                .build();
    }

    public void updateEntity(
            BrandUpdateRequest request,
            Brand brand) {

        brand.setName(request.getName().trim());
    }
}