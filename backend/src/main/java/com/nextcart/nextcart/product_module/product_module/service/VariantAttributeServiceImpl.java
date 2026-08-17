package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeUpdateRequest;
import com.nextcart.nextcart.product_module.entity.ProductVariant;
import com.nextcart.nextcart.product_module.entity.VariantAttribute;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeNotFoundException;
import com.nextcart.nextcart.product_module.mapper.VariantAttributeMapper;
import com.nextcart.nextcart.product_module.repository.ProductVariantRepository;
import com.nextcart.nextcart.product_module.repository.VariantAttributeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VariantAttributeServiceImpl
        implements VariantAttributeService {

    private final VariantAttributeRepository variantAttributeRepository;

    private final ProductVariantRepository productVariantRepository;

    private final VariantAttributeMapper variantAttributeMapper;


    // =========================
    // CREATE ATTRIBUTE
    // =========================

    @Override
    public VariantAttributeResponse createAttribute(
            VariantAttributeCreateRequest request) {

        ProductVariant variant =
                productVariantRepository.findById(
                        request.getVariantId()
                ).orElseThrow(() ->
                        new ProductVariantNotFoundException(
                                "Product variant not found with id: "
                                        + request.getVariantId()
                        )
                );

        if (variantAttributeRepository
                .existsByVariantIdAndAttributeNameIgnoreCase(
                        request.getVariantId(),
                        request.getAttributeName()
                )) {

            throw new VariantAttributeAlreadyExistsException(
                    "Attribute already exists for variant: "
                            + request.getAttributeName()
            );
        }

        VariantAttribute attribute =
                variantAttributeMapper.toEntity(
                        request,
                        variant
                );

        VariantAttribute savedAttribute =
                variantAttributeRepository.save(
                        attribute
                );

        return variantAttributeMapper.toResponse(
                savedAttribute
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public VariantAttributeResponse getAttributeById(
            Long id) {

        VariantAttribute attribute =
                variantAttributeRepository.findById(id)
                        .orElseThrow(() ->
                                new VariantAttributeNotFoundException(
                                        "Variant attribute not found with id: "
                                                + id
                                )
                        );

        return variantAttributeMapper.toResponse(
                attribute
        );
    }


    // =========================
    // GET ALL
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<VariantAttributeResponse>
    getAllAttributes() {

        return variantAttributeRepository.findAll()
                .stream()
                .map(variantAttributeMapper::toResponse)
                .toList();
    }


    // =========================
    // GET BY VARIANT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<VariantAttributeResponse>
    getAttributesByVariantId(Long variantId) {

        productVariantRepository.findById(variantId)
                .orElseThrow(() ->
                        new ProductVariantNotFoundException(
                                "Product variant not found with id: "
                                        + variantId
                        )
                );

        return variantAttributeRepository
                .findByVariantId(variantId)
                .stream()
                .map(variantAttributeMapper::toResponse)
                .toList();
    }


    // =========================
    // UPDATE
    // =========================

    @Override
    public VariantAttributeResponse updateAttribute(
            Long id,
            VariantAttributeUpdateRequest request) {

        VariantAttribute attribute =
                variantAttributeRepository.findById(id)
                        .orElseThrow(() ->
                                new VariantAttributeNotFoundException(
                                        "Variant attribute not found with id: "
                                                + id
                                )
                        );

        if (!attribute.getAttributeName()
                .equalsIgnoreCase(request.getAttributeName())
                && variantAttributeRepository
                .existsByVariantIdAndAttributeNameIgnoreCase(
                        attribute.getVariant().getId(),
                        request.getAttributeName()
                )) {

            throw new VariantAttributeAlreadyExistsException(
                    "Attribute already exists for variant: "
                            + request.getAttributeName()
            );
        }

        variantAttributeMapper.updateEntity(
                request,
                attribute
        );

        VariantAttribute updatedAttribute =
                variantAttributeRepository.save(
                        attribute
                );

        return variantAttributeMapper.toResponse(
                updatedAttribute
        );
    }


    // =========================
    // DELETE
    // =========================

    @Override
    public void deleteAttribute(Long id) {

        VariantAttribute attribute =
                variantAttributeRepository.findById(id)
                        .orElseThrow(() ->
                                new VariantAttributeNotFoundException(
                                        "Variant attribute not found with id: "
                                                + id
                                )
                        );

        variantAttributeRepository.delete(attribute);
    }
}