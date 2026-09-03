package com.nextcart.nextcart.user_module.controller;

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

    /**
     * Get currently authenticated user's profile.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userService.getMyProfile(
                        authentication.getName()
                )
        );
    }

    /**
     * Update currently authenticated user's profile.
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request
    ) {

        return ResponseEntity.ok(
                userService.updateMyProfile(
                        authentication.getName(),
                        request
                )
        );
    }

    /**
     * Change currently authenticated user's password.
     */
    @PatchMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Deactivate currently authenticated user's account.
     */
    @PatchMapping("/me/deactivate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deactivateMyAccount(
            Authentication authentication
    ) {

        userService.deactivateMyAccount(
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}