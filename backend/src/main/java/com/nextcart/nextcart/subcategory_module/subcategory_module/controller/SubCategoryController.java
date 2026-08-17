package com.nextcart.nextcart.subcategory_module.controller;

import com.nextcart.nextcart.subcategory_module.dto.SubCategoryCreateRequest;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryResponse;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryUpdateRequest;
import com.nextcart.nextcart.subcategory_module.service.SubCategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subcategories")
@RequiredArgsConstructor
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    // CREATE
    @PostMapping
    public ResponseEntity<SubCategoryResponse> createSubCategory(
            @Valid @RequestBody SubCategoryCreateRequest request) {

        SubCategoryResponse response =
                subCategoryService.createSubCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryResponse> getSubCategoryById(
            @PathVariable Long id) {

        SubCategoryResponse response =
                subCategoryService.getSubCategoryById(id);

        return ResponseEntity.ok(response);
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<SubCategoryResponse>>
    getAllSubCategories() {

        List<SubCategoryResponse> response =
                subCategoryService.getAllSubCategories();

        return ResponseEntity.ok(response);
    }

    // GET BY CATEGORY ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategoryResponse>>
    getSubCategoriesByCategoryId(
            @PathVariable Long categoryId) {

        List<SubCategoryResponse> response =
                subCategoryService.getSubCategoriesByCategoryId(
                        categoryId
                );

        return ResponseEntity.ok(response);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<SubCategoryResponse> updateSubCategory(
            @PathVariable Long id,
            @Valid @RequestBody SubCategoryUpdateRequest request) {

        SubCategoryResponse response =
                subCategoryService.updateSubCategory(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubCategory(
            @PathVariable Long id) {

        subCategoryService.deleteSubCategory(id);

        return ResponseEntity.noContent().build();
    }
}