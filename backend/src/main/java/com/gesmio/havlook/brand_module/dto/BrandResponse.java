package com.gesmio.havlook.brand_module.dto;

import com.gesmio.havlook.brand_module.entity.BrandStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandResponse {

    private Long id;

    private String name;

    private BrandStatus status;
}