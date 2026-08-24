package com.nextcart.nextcart.subcategory_module.controller;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryCreateRequest;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryResponse;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryUpdateRequest;
import com.nextcart.nextcart.subcategory_module.service.SubCategoryService;
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
@RequestMapping("/api/v1/subcategories")
@RequiredArgsConstructor
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> createSubCategory(
            @Valid @RequestBody SubCategoryCreateRequest request) {

        SubCategoryResponse response =
                subCategoryService.createSubCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "SubCategory created successfully",
                                response
                        )
                );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> getSubCategoryById(
            @PathVariable Long id) {

        SubCategoryResponse response =
                subCategoryService.getSubCategoryById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "SubCategory fetched successfully",
                        response
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SubCategoryResponse>>>
    getAllSubCategories(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SubCategoryResponse> response =
                subCategoryService.getAllSubCategories(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "SubCategories fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<SubCategoryResponse>>>
    getSubCategoriesByCategoryId(
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
                new ApiResponse<>(
                        true,
                        "SubCategories fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> updateSubCategory(
            @PathVariable Long id,
            @Valid @RequestBody SubCategoryUpdateRequest request) {

        SubCategoryResponse response =
                subCategoryService.updateSubCategory(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "SubCategory updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateSubCategory(
            @PathVariable Long id) {

        subCategoryService.deactivateSubCategory(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "SubCategory deactivated successfully",
                        null
                )
        );
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> restoreSubCategory(
            @PathVariable Long id) {

        SubCategoryResponse response =
                subCategoryService.restoreSubCategory(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "SubCategory restored successfully",
                        response
                )
        );
    }
}