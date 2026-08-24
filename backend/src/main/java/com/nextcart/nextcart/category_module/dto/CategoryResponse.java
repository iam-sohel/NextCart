package com.nextcart.nextcart.category_module.dto;

import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;

    private String name;

    private CategoryStatus status;

    private Instant createdAt;

    private Instant updatedAt;
}