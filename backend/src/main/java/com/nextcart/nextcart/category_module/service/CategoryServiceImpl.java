package com.nextcart.nextcart.category_module.service;

import com.nextcart.nextcart.category_module.dto.CategoryCreateRequest;
import com.nextcart.nextcart.category_module.dto.CategoryResponse;
import com.nextcart.nextcart.category_module.dto.CategoryUpdateRequest;
import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.exceptions.CategoryAlreadyExistsException;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.category_module.mapper.CategoryMapper;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {

        String name = normalizeName(request.getName());

        if (categoryRepository.existsByName(name)) {
            throw new CategoryAlreadyExistsException(
                    "Category already exists: " + name
            );
        }

        Category category = categoryMapper.toEntity(request);

        category.setName(name);
        category.setStatus(CategoryStatus.ACTIVE);

        try {
            Category savedCategory =
                    categoryRepository.saveAndFlush(category);

            return categoryMapper.toResponse(savedCategory);

        } catch (DataIntegrityViolationException ex) {
            throw new CategoryAlreadyExistsException(
                    "Category already exists: " + name
            );
        }
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository
                .findByIdAndStatus(id, CategoryStatus.ACTIVE)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        return categoryMapper.toResponse(category);
    }

    @Override
    public Page<CategoryResponse> getAllCategories(
            Pageable pageable) {

        return categoryRepository
                .findAllByStatus(
                        CategoryStatus.ACTIVE,
                        pageable
                )
                .map(categoryMapper::toResponse);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryUpdateRequest request) {

        Category category = categoryRepository
                .findByIdAndStatus(id, CategoryStatus.ACTIVE)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        String name = normalizeName(request.getName());

        if (!category.getName().equals(name)
                && categoryRepository.existsByNameAndIdNot(name, id)) {

            throw new CategoryAlreadyExistsException(
                    "Category already exists: " + name
            );
        }

        category.setName(name);

        try {
            Category updatedCategory =
                    categoryRepository.saveAndFlush(category);

            return categoryMapper.toResponse(updatedCategory);

        } catch (DataIntegrityViolationException ex) {
            throw new CategoryAlreadyExistsException(
                    "Category already exists: " + name
            );
        }
    }

    @Override
    @Transactional
    public void deactivateCategory(Long id) {

        Category category = categoryRepository
                .findByIdAndStatus(id, CategoryStatus.ACTIVE)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        category.setStatus(CategoryStatus.INACTIVE);

        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public CategoryResponse restoreCategory(Long id) {

        Category category = categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id
                        )
                );

        if (category.getStatus() == CategoryStatus.ACTIVE) {
            return categoryMapper.toResponse(category);
        }

        if (categoryRepository.existsByNameAndIdNot(
                category.getName(),
                id)) {

            throw new CategoryAlreadyExistsException(
                    "Another category already uses the name: "
                            + category.getName()
            );
        }

        category.setStatus(CategoryStatus.ACTIVE);

        Category restoredCategory =
                categoryRepository.save(category);

        return categoryMapper.toResponse(restoredCategory);
    }

    private String normalizeName(String name) {

        return name
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }
}