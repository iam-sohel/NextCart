package com.nextcart.nextcart.product_module.variantAttribute;

import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeUpdateRequest;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeNotFoundException;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
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

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public VariantAttributeResponse createAttribute(
            Long variantId,
            VariantAttributeCreateRequest request) {

        ProductVariantEntity variant =
                productVariantRepository.findById(variantId)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + variantId
                                )
                        );

        String attributeName =
                request.getAttributeName().trim();

        String attributeValue =
                request.getAttributeValue().trim();

        if (variantAttributeRepository
                .existsByVariantIdAndAttributeNameIgnoreCase(
                        variantId,
                        attributeName)) {

            throw new VariantAttributeAlreadyExistsException(
                    "Attribute already exists for this variant: "
                            + attributeName
            );
        }

        VariantAttributeEntity attribute =
                variantAttributeMapper.toEntity(request);

        attribute.setVariant(variant);

        VariantAttributeEntity savedAttribute =
                variantAttributeRepository.save(attribute);

        return variantAttributeMapper.toResponse(
                savedAttribute
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public VariantAttributeResponse getAttributeById(
            Long id) {

        VariantAttributeEntity attribute =
                variantAttributeRepository.findById(id)
                        .orElseThrow(() ->
                                new VariantAttributeNotFoundException(
                                        "Variant attribute not found with id: "
                                                + id
                                )
                        );

        return variantAttributeMapper.toResponse(attribute);
    }

    // =========================================================
    // GET BY VARIANT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<VariantAttributeResponse> getAttributesByVariant(
            Long variantId) {

        if (!productVariantRepository.existsById(variantId)) {
            throw new ProductVariantNotFoundException(
                    "Product variant not found with id: "
                            + variantId
            );
        }

        return variantAttributeRepository
                .findByVariantIdOrderByAttributeNameAsc(variantId)
                .stream()
                .map(variantAttributeMapper::toResponse)
                .toList();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public VariantAttributeResponse updateAttribute(
            Long id,
            VariantAttributeUpdateRequest request) {

        VariantAttributeEntity attribute =
                variantAttributeRepository.findById(id)
                        .orElseThrow(() ->
                                new VariantAttributeNotFoundException(
                                        "Variant attribute not found with id: "
                                                + id
                                )
                        );

        Long variantId =
                attribute.getVariant().getId();

        String attributeName =
                request.getAttributeName().trim();

        if (variantAttributeRepository
                .existsByVariantIdAndAttributeNameIgnoreCaseAndIdNot(
                        variantId,
                        attributeName,
                        id)) {

            throw new VariantAttributeAlreadyExistsException(
                    "Attribute already exists for this variant: "
                            + attributeName
            );
        }

        variantAttributeMapper.updateEntity(
                request,
                attribute
        );

        VariantAttributeEntity updatedAttribute =
                variantAttributeRepository.save(attribute);

        return variantAttributeMapper.toResponse(
                updatedAttribute
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteAttribute(Long id) {

        VariantAttributeEntity attribute =
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