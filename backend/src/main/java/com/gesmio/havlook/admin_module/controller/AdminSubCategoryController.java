package com.gesmio.havlook.admin_module.controller;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.subcategory_module.dto.SubCategoryCreateRequest;
import com.gesmio.havlook.subcategory_module.dto.SubCategoryResponse;
import com.gesmio.havlook.subcategory_module.dto.SubCategoryUpdateRequest;
import com.gesmio.havlook.subcategory_module.service.SubCategoryService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

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
@RequestMapping("/api/v1/admin/subcategories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminSubCategoryController {

    private final SubCategoryService subCategoryService;

    // =========================================================
    // CREATE SUBCATEGORY
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<SubCategoryResponse>>
    createSubCategory(
            @Valid @RequestBody SubCategoryCreateRequest request) {

        SubCategoryResponse response =
                subCategoryService.createSubCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "SubCategory created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET ALL SUBCATEGORIES
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<SubCategoryResponse>>
            >
    getAllSubCategories(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SubCategoryResponse> response =
                subCategoryService.getAllSubCategories(
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategories fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET SUBCATEGORY BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<
            CommonResponseDto<SubCategoryResponse>
            >
    getSubCategoryById(
            @PathVariable Long id) {

        SubCategoryResponse response =
                subCategoryService.getSubCategoryById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategory fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET SUBCATEGORIES BY CATEGORY
    // =========================================================

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<
            CommonResponseDto<Page<SubCategoryResponse>>
            >
    getSubCategoriesByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SubCategoryResponse> response =
                subCategoryService.getSubCategoriesByCategoryId(
                        categoryId,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategories fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE SUBCATEGORY
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<
            CommonResponseDto<SubCategoryResponse>
            >
    updateSubCategory(
            @PathVariable Long id,
            @Valid @RequestBody SubCategoryUpdateRequest request) {

        SubCategoryResponse response =
                subCategoryService.updateSubCategory(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategory updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE SUBCATEGORY
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateSubCategory(
            @PathVariable Long id) {

        subCategoryService.deactivateSubCategory(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategory deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE SUBCATEGORY
    // =========================================================

    @PatchMapping("/{id}/restore")
    public ResponseEntity<
            CommonResponseDto<SubCategoryResponse>
            >
    restoreSubCategory(
            @PathVariable Long id) {

        SubCategoryResponse response =
                subCategoryService.restoreSubCategory(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "SubCategory restored successfully",
                        response
                )
        );
    }
}