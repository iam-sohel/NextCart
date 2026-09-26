package com.nextcart.nextcart.category_module.controller;

import com.nextcart.nextcart.category_module.dto.CategoryCreateRequest;
import com.nextcart.nextcart.category_module.dto.CategoryResponse;
import com.nextcart.nextcart.category_module.dto.CategoryUpdateRequest;
import com.nextcart.nextcart.category_module.service.CategoryService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // =========================================================
    // CREATE CATEGORY
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {

        CategoryResponse response =
                categoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Category created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET CATEGORY BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<CategoryResponse>> getCategoryById(
            @PathVariable Long id) {

        CategoryResponse response =
                categoryService.getCategoryById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Category fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ALL CATEGORIES
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<Page<CategoryResponse>>>
    getAllCategories(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<CategoryResponse> response =
                categoryService.getAllCategories(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Categories fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE CATEGORY
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {

        CategoryResponse response =
                categoryService.updateCategory(id, request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Category updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE CATEGORY
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<Void>> deactivateCategory(
            @PathVariable Long id) {

        categoryService.deactivateCategory(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Category deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE CATEGORY
    // =========================================================

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<CategoryResponse>> restoreCategory(
            @PathVariable Long id) {

        CategoryResponse response =
                categoryService.restoreCategory(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Category restored successfully",
                        response
                )
        );
    }
}