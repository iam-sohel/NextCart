package com.gesmio.havlook.brand_module.service;

import com.gesmio.havlook.brand_module.dto.BrandCreateRequest;
import com.gesmio.havlook.brand_module.dto.BrandResponse;
import com.gesmio.havlook.brand_module.dto.BrandUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BrandService {

    BrandResponse createBrand(BrandCreateRequest request);

    BrandResponse getBrandById(Long id);

    Page<BrandResponse> getAllBrands(Pageable pageable);

    BrandResponse updateBrand(Long id, BrandUpdateRequest request);

    void deactivateBrand(Long id);

    BrandResponse restoreBrand(Long id);
}