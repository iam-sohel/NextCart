package com.nextcart.nextcart.brand_module.service;

import com.nextcart.nextcart.brand_module.dto.BrandCreateRequest;
import com.nextcart.nextcart.brand_module.dto.BrandResponse;
import com.nextcart.nextcart.brand_module.dto.BrandUpdateRequest;
import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.entity.BrandStatus;
import com.nextcart.nextcart.brand_module.exceptions.BrandAlreadyExistsException;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.brand_module.mapper.BrandMapper;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Override
    @Transactional
    public BrandResponse createBrand(
            BrandCreateRequest request) {

        String name = request.getName().trim();

        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new BrandAlreadyExistsException(
                    "Brand already exists: " + name
            );
        }

        Brand brand = brandMapper.toEntity(request);

        Brand savedBrand = brandRepository.save(brand);

        return brandMapper.toResponse(savedBrand);
    }

    @Override
    public BrandResponse getBrandById(Long id) {

        Brand brand = brandRepository
                .findByIdAndStatus(
                        id,
                        BrandStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Active Brand not found with id: " + id
                        )
                );

        return brandMapper.toResponse(brand);
    }

    @Override
    public Page<BrandResponse> getAllBrands(
            Pageable pageable) {

        return brandRepository
                .findAllByStatus(
                        BrandStatus.ACTIVE,
                        pageable
                )
                .map(brandMapper::toResponse);
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(
            Long id,
            BrandUpdateRequest request) {

        Brand brand = brandRepository
                .findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        String name = request.getName().trim();

        if (brandRepository
                .existsByNameIgnoreCaseAndIdNot(
                        name,
                        id
                )) {

            throw new BrandAlreadyExistsException(
                    "Brand already exists: " + name
            );
        }

        brandMapper.updateEntity(
                request,
                brand
        );

        Brand updatedBrand =
                brandRepository.save(brand);

        return brandMapper.toResponse(
                updatedBrand
        );
    }

    @Override
    @Transactional
    public void deactivateBrand(Long id) {

        Brand brand = brandRepository
                .findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        if (brand.getStatus() == BrandStatus.INACTIVE) {
            return;
        }

        brand.setStatus(BrandStatus.INACTIVE);

        brandRepository.save(brand);
    }

    @Override
    @Transactional
    public BrandResponse restoreBrand(Long id) {

        Brand brand = brandRepository
                .findById(id)
                .orElseThrow(() ->
                        new BrandNotFoundException(
                                "Brand not found with id: " + id
                        )
                );

        if (brand.getStatus() == BrandStatus.ACTIVE) {
            return brandMapper.toResponse(brand);
        }

        if (brandRepository
                .existsByNameIgnoreCaseAndIdNot(
                        brand.getName(),
                        id
                )) {

            throw new BrandAlreadyExistsException(
                    "An active Brand with the same name already exists: "
                            + brand.getName()
            );
        }

        brand.setStatus(BrandStatus.ACTIVE);

        Brand restoredBrand =
                brandRepository.save(brand);

        return brandMapper.toResponse(
                restoredBrand
        );
    }
}