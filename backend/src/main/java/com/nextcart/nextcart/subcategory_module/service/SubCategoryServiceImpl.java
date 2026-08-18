package com.nextcart.nextcart.subcategory_module.service;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;
import com.nextcart.nextcart.subcategory_module.dto.*;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryAlreadyExistsException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.subcategory_module.mapper.SubCategoryMapper;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubCategoryServiceImpl implements SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryMapper subCategoryMapper;

    @Override
    public SubCategoryResponse createSubCategory(
            SubCategoryCreateRequest request) {

        Category category = categoryRepository.findById(
                request.getCategoryId()
        ).orElseThrow(() ->
                new CategoryNotFoundException(
                        "Category not found with id: "
                                + request.getCategoryId()
                )
        );

        if (subCategoryRepository
                .existsByCategoryIdAndNameIgnoreCase(
                        request.getCategoryId(),
                        request.getName())) {

            throw new SubCategoryAlreadyExistsException(
                    "SubCategory already exists: "
                            + request.getName()
            );
        }

        SubCategory subCategory =
                subCategoryMapper.toEntity(request, category);

        SubCategory savedSubCategory =
                subCategoryRepository.save(subCategory);

        return subCategoryMapper.toResponse(savedSubCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public SubCategoryResponse getSubCategoryById(Long id) {

        SubCategory subCategory =
                subCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new SubCategoryNotFoundException(
                                        "SubCategory not found with id: " + id
                                )
                        );

        return subCategoryMapper.toResponse(subCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryResponse> getAllSubCategories() {

        return subCategoryRepository.findAll()
                .stream()
                .map(subCategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryResponse> getSubCategoriesByCategoryId(
            Long categoryId) {

        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException(
                    "Category not found with id: " + categoryId
            );
        }

        return subCategoryRepository
                .findByCategoryId(categoryId)
                .stream()
                .map(subCategoryMapper::toResponse)
                .toList();
    }

    @Override
    public SubCategoryResponse updateSubCategory(
            Long id,
            SubCategoryUpdateRequest request) {

        SubCategory subCategory =
                subCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new SubCategoryNotFoundException(
                                        "SubCategory not found with id: " + id
                                )
                        );

        Category category =
                categoryRepository.findById(
                        request.getCategoryId()
                ).orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        if (subCategoryRepository
                .existsByCategoryIdAndNameIgnoreCase(
                        request.getCategoryId(),
                        request.getName())
                && (
                    !subCategory.getName()
                            .equalsIgnoreCase(request.getName())
                    || !subCategory.getCategory().getId()
                            .equals(request.getCategoryId())
                )) {

            throw new SubCategoryAlreadyExistsException(
                    "SubCategory already exists: "
                            + request.getName()
            );
        }

        subCategoryMapper.updateEntity(
                request,
                category,
                subCategory
        );

        SubCategory updatedSubCategory =
                subCategoryRepository.save(subCategory);

        return subCategoryMapper.toResponse(updatedSubCategory);
    }

    @Override
    public void deleteSubCategory(Long id) {

        SubCategory subCategory =
                subCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new SubCategoryNotFoundException(
                                        "SubCategory not found with id: " + id
                                )
                        );

        subCategoryRepository.delete(subCategory);
    }
}