package com.gesmio.havlook.seller_module.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductImageResponse {

    private Long id;

    private String imageUrl;

    private Boolean isPrimary;

    private Integer displayOrder;
}