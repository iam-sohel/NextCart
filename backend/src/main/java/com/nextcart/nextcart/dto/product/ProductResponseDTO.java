package com.nextcart.nextcart.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

    private Long id;

    private String name;

    private String slug;

    private String description;

    private String brand;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer discount;

    private BigDecimal rating;

    private Integer reviewCount;

    private Integer stock;

    private String category;

    private String image;
}