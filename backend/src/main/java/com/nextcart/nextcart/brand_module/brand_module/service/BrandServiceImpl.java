package com.nextcart.nextcart.brand_module.service;

import com.nextcart.nextcart.brand_module.dto.*;
import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.exceptions.BrandAlreadyExistsException;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.brand_module.mapper.BrandMapper;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Override
    public BrandResponse createBrand(
            BrandCreateRequest request) {

        if (brandRepository.existsByNameIgnoreCase(
                request.getName())) {

            throw new BrandAlreadyExistsException(
                    "Brand already exists: "
                            + request.getName()
            );
        }

        Brand brand = brandMapper.toEntity(request);

        Brand savedBrand = brandRepository.save(brand);

        return brandMapper.toResponse(savedBrand);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBrandById(Long id) {

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        return brandMapper.toResponse(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {

        return brandRepository.findAll()
                .stream()
                .map(brandMapper::toResponse)
                .toList();
    }

    @Override
    public BrandResponse updateBrand(
            Long id,
            BrandUpdateRequest request) {

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        if (!brand.getName().equalsIgnoreCase(request.getName())
                && brandRepository.existsByNameIgnoreCase(
                        request.getName())) {

            throw new BrandAlreadyExistsException(
                    "Brand already exists: "
                            + request.getName()
            );
        }

        brandMapper.updateEntity(request, brand);

        Brand updatedBrand = brandRepository.save(brand);

        return brandMapper.toResponse(updatedBrand);
    }

    @Override
    public void deleteBrand(Long id) {

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        brandRepository.delete(brand);
    }
}