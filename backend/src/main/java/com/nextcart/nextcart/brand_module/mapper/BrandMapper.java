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

        brand.setName(request.getName());

        return brand;
    }

    public BrandResponse toResponse(Brand brand) {

        BrandResponse response = new BrandResponse();

        response.setId(brand.getId());
        response.setName(brand.getName());

        return response;
    }

    public void updateEntity(
            BrandUpdateRequest request,
            Brand brand) {

        brand.setName(request.getName());
    }
}