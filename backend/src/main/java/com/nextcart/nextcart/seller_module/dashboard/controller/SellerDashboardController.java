package com.nextcart.nextcart.seller_module.dashboard.controller;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.dashboard.dto.SellerDashboardResponse;
import com.nextcart.nextcart.seller_module.dashboard.service.SellerDashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sellers/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
@SecurityRequirement(name = "bearerAuth")
public class SellerDashboardController {

    private final SellerDashboardService sellerDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<SellerDashboardResponse>> getMyDashboard(
            Authentication authentication
    ) {
        Long userId = Long.valueOf(authentication.getName());

        SellerDashboardResponse response =
                sellerDashboardService.getMyDashboard(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller dashboard retrieved successfully",
                        response
                )
        );
    }
}
