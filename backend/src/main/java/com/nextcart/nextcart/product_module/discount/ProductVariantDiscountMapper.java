package com.nextcart.nextcart.product_module.discount;

import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantDiscountMapper {

    public ProductVariantDiscountEntity toEntity(
            ProductVariantDiscountCreateRequest request) {

        return ProductVariantDiscountEntity.builder()
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .active(true)
                .build();
    }

    public void updateEntity(
            ProductVariantDiscountUpdateRequest request,
            ProductVariantDiscountEntity entity) {

        entity.setDiscountType(request.getDiscountType());
        entity.setDiscountValue(request.getDiscountValue());
        entity.setStartAt(request.getStartAt());
        entity.setEndAt(request.getEndAt());
        entity.setActive(request.getActive());
    }

    public ProductVariantDiscountResponse toResponse(
            ProductVariantDiscountEntity entity) {

        return ProductVariantDiscountResponse.builder()
                .id(entity.getId())
                .productVariantId(
                        entity.getProductVariant().getId()
                )
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .startAt(entity.getStartAt())
                .endAt(entity.getEndAt())
                .active(entity.isActive())
                .build();
    }
}