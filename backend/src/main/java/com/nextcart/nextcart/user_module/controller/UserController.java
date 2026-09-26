package com.nextcart.nextcart.user_module.controller;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.user_module.dto.ChangePasswordRequest;
import com.nextcart.nextcart.user_module.dto.UserResponse;
import com.nextcart.nextcart.user_module.dto.UserUpdateRequest;
import com.nextcart.nextcart.user_module.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ============================================================
    // GET MY PROFILE
    // ============================================================

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommonResponseDto<UserResponse>> getMyProfile(
            Authentication authentication
    ) {

        UserResponse response =
                userService.getMyProfile(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "User profile fetched successfully",
                        response
                )
        );
    }

    // ============================================================
    // UPDATE MY PROFILE
    // ============================================================

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommonResponseDto<UserResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request
    ) {

        UserResponse response =
                userService.updateMyProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "User profile updated successfully",
                        response
                )
        );
    }

    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    @PatchMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommonResponseDto<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Password changed successfully",
                        null
                )
        );
    }

    // ============================================================
    // DEACTIVATE ACCOUNT
    // ============================================================

    @PatchMapping("/me/deactivate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommonResponseDto<Void>> deactivateMyAccount(
            Authentication authentication
    ) {

        userService.deactivateMyAccount(
                authentication.getName()
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "User account deactivated successfully",
                        null
                )
        );
    }
}