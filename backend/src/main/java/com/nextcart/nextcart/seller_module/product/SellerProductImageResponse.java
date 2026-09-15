package com.nextcart.nextcart.seller_module.product;

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