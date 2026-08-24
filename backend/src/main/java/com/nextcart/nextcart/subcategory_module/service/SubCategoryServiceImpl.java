package com.nextcart.nextcart.subcategory_module.service;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryCreateRequest;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryResponse;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryUpdateRequest;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryAlreadyExistsException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.subcategory_module.mapper.SubCategoryMapper;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubCategoryServiceImpl implements SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryMapper subCategoryMapper;

    @Override
    @Transactional
    public SubCategoryResponse createSubCategory(
            SubCategoryCreateRequest request) {

        Category category = getActiveCategory(
                request.getCategoryId()
        );

        String name = request.getName().trim();

        if (subCategoryRepository
                .existsByCategoryIdAndNameIgnoreCase(
                        category.getId(),
                        name
                )) {

            throw new SubCategoryAlreadyExistsException(
                    "SubCategory already exists in this category"
            );
        }

        SubCategory subCategory =
                subCategoryMapper.toEntity(
                        request,
                        category
                );

        SubCategory savedSubCategory =
                subCategoryRepository.save(subCategory);

        return subCategoryMapper.toResponse(
                savedSubCategory
        );
    }

    @Override
    public SubCategoryResponse getSubCategoryById(Long id) {

        SubCategory subCategory =
                subCategoryRepository
                        .findByIdAndStatus(
                                id,
                                SubCategoryStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new SubCategoryNotFoundException(
                                        "Active SubCategory not found with id: "
                                                + id
                                )
                        );

        return subCategoryMapper.toResponse(
                subCategory
        );
    }

    @Override
    public Page<SubCategoryResponse> getAllSubCategories(
            Pageable pageable) {

        return subCategoryRepository
                .findAllByStatus(
                        SubCategoryStatus.ACTIVE,
                        pageable
                )
                .map(subCategoryMapper::toResponse);
    }

    @Override
    public Page<SubCategoryResponse> getSubCategoriesByCategoryId(
            Long categoryId,
            Pageable pageable) {

        getActiveCategory(categoryId);

        return subCategoryRepository
                .findAllByCategoryIdAndStatus(
                        categoryId,
                        SubCategoryStatus.ACTIVE,
                        pageable
                )
                .map(subCategoryMapper::toResponse);
    }

    @Override
    @Transactional
    public SubCategoryResponse updateSubCategory(
            Long id,
            SubCategoryUpdateRequest request) {

        SubCategory subCategory =
                getSubCategoryForAdmin(id);

        Category category =
                getActiveCategory(
                        request.getCategoryId()
                );

        String name = request.getName().trim();

        if (subCategoryRepository
                .existsByCategoryIdAndNameIgnoreCaseAndIdNot(
                        category.getId(),
                        name,
                        id
                )) {

            throw new SubCategoryAlreadyExistsException(
                    "SubCategory already exists in this category"
            );
        }

        subCategoryMapper.updateEntity(
                request,
                category,
                subCategory
        );

        SubCategory updatedSubCategory =
                subCategoryRepository.save(subCategory);

        return subCategoryMapper.toResponse(
                updatedSubCategory
        );
    }

    @Override
    @Transactional
    public void deactivateSubCategory(Long id) {

        SubCategory subCategory =
                getSubCategoryForAdmin(id);

        if (subCategory.getStatus()
                == SubCategoryStatus.INACTIVE) {
            return;
        }

        subCategory.setStatus(
                SubCategoryStatus.INACTIVE
        );

        subCategoryRepository.save(subCategory);
    }

    @Override
    @Transactional
    public SubCategoryResponse restoreSubCategory(Long id) {

        SubCategory subCategory =
                subCategoryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new SubCategoryNotFoundException(
                                        "SubCategory not found with id: "
                                                + id
                                )
                        );

        if (subCategory.getStatus()
                == SubCategoryStatus.ACTIVE) {

            return subCategoryMapper.toResponse(
                    subCategory
            );
        }

        Category category =
                subCategory.getCategory();

        if (category.getStatus()
                != CategoryStatus.ACTIVE) {

            throw new CategoryNotFoundException(
                    "Cannot restore SubCategory because its category is inactive"
            );
        }

        if (subCategoryRepository
                .existsByCategoryIdAndNameIgnoreCaseAndIdNot(
                        category.getId(),
                        subCategory.getName(),
                        id
                )) {

            throw new SubCategoryAlreadyExistsException(
                    "An active SubCategory with the same name already exists in this category"
            );
        }

        subCategory.setStatus(
                SubCategoryStatus.ACTIVE
        );

        SubCategory restoredSubCategory =
                subCategoryRepository.save(subCategory);

        return subCategoryMapper.toResponse(
                restoredSubCategory
        );
    }

    private Category getActiveCategory(Long categoryId) {

        return categoryRepository
                .findByIdAndStatus(
                        categoryId,
                        CategoryStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Active Category not found with id: "
                                        + categoryId
                        )
                );
    }

    private SubCategory getSubCategoryForAdmin(Long id) {

        return subCategoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new SubCategoryNotFoundException(
                                "SubCategory not found with id: "
                                        + id
                        )
                );
    }
}