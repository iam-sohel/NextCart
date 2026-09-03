package com.nextcart.nextcart.seller_module.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerKycRequest {

    @Pattern(
            regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            message = "Invalid PAN number"
    )
    private String panNumber;

    @Pattern(
            regexp = "^[0-9]{12}$",
            message = "Invalid Aadhaar number"
    )
    private String aadhaarNumber;

    @Size(
            max = 30,
            message = "GST number must not exceed 30 characters"
    )
    private String gstNumber;

    private MultipartFile panDocument;

    private MultipartFile aadhaarDocument;

    private MultipartFile gstDocument;
}