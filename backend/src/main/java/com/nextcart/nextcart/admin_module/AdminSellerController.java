package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSellerController {

    private final AdminSellerService adminSellerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SellerResponse>>> getAllSellers(
            @PageableDefault(
                    size = 20,
                    sort = "id",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<SellerResponse> response =
                adminSellerService.getAllSellers(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Sellers fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/{sellerId}")
    public ResponseEntity<ApiResponse<SellerResponse>> getSellerById(
            @PathVariable Long sellerId) {

        SellerResponse response =
                adminSellerService.getSellerById(sellerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{sellerId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateSeller(
            @PathVariable Long sellerId) {

        adminSellerService.activateSeller(sellerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller activated successfully",
                        null
                )
        );
    }

    @PutMapping("/{sellerId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateSeller(
            @PathVariable Long sellerId) {

        adminSellerService.deactivateSeller(sellerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller deactivated successfully",
                        null
                )
        );
    }
}