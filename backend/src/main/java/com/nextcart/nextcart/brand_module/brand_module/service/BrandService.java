package com.nextcart.nextcart.brand_module.service;

import com.nextcart.nextcart.brand_module.dto.*;

import java.util.List;

public interface BrandService {

    BrandResponse createBrand(
            BrandCreateRequest request
    );

    BrandResponse getBrandById(Long id);

    List<BrandResponse> getAllBrands();

    BrandResponse updateBrand(
            Long id,
            BrandUpdateRequest request
    );

    void deleteBrand(Long id);
}