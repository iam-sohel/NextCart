package com.nextcart.nextcart.product_module.productInformation;

import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationCreateRequest;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductInformationMapper {

    public ProductInformationEntity toEntity(
            ProductInformationCreateRequest request) {

        return ProductInformationEntity.builder()
                .shortDescription(
                        trimToNull(request.getShortDescription())
                )
                .longDescription(
                        trimToNull(request.getLongDescription())
                )
                .warranty(
                        trimToNull(request.getWarranty())
                )
                .manufacturer(
                        trimToNull(request.getManufacturer())
                )
                .build();
    }

    public ProductInformationResponse toResponse(
            ProductInformationEntity information) {

        return ProductInformationResponse.builder()
                .id(information.getId())
                .productId(information.getId())
                .shortDescription(information.getShortDescription())
                .longDescription(information.getLongDescription())
                .warranty(information.getWarranty())
                .manufacturer(information.getManufacturer())
                .build();
    }

    public void updateEntity(
            ProductInformationUpdateRequest request,
            ProductInformationEntity information) {

        information.setShortDescription(
                trimToNull(request.getShortDescription())
        );

        information.setLongDescription(
                trimToNull(request.getLongDescription())
        );

        information.setWarranty(
                trimToNull(request.getWarranty())
        );

        information.setManufacturer(
                trimToNull(request.getManufacturer())
        );
    }

    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}