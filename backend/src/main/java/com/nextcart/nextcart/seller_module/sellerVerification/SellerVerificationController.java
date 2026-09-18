package com.nextcart.nextcart.seller_module.sellerVerification;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/verification")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerVerificationController {

    private final SellerVerificationService sellerVerificationService;
    private final SellerRepository sellerRepository;


    // =========================================================
    // RUN SELLER VERIFICATION
    // =========================================================
    @PostMapping
    public ResponseEntity<ApiResponse<SellerVerification>> verifySeller(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        Seller seller = getAuthenticatedSeller(userId);

        SellerVerification verification =
                sellerVerificationService.verifySeller(
                        seller.getId()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller verification completed",
                        verification
                )
        );
    }


    // =========================================================
    // GET MY VERIFICATION STATUS
    // =========================================================
    @GetMapping
    public ResponseEntity<ApiResponse<SellerVerification>> getVerification(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        Seller seller = getAuthenticatedSeller(userId);

        SellerVerification verification =
                sellerVerificationService.getVerification(
                        seller.getId()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller verification status fetched successfully",
                        verification
                )
        );
    }


    // =========================================================
    // GET USER ID FROM JWT
    // =========================================================
    private Long getUserId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            return userDetails.getUserId();
        }

        /*
         * Fallback:
         * In case Authentication#getName() contains userId.
         */
        try {

            return Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new IllegalStateException(
                    "Unable to determine authenticated user"
            );
        }
    }


    // =========================================================
    // GET AUTHENTICATED SELLER
    // =========================================================
    private Seller getAuthenticatedSeller(Long userId) {

        Seller seller = sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );

        if (!seller.isActive()) {

            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        return seller;
    }
}