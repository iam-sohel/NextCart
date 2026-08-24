package com.nextcart.nextcart.product_module.productSpecification;

import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_specifications", uniqueConstraints = {@UniqueConstraint(name = "uk_product_specification_name", columnNames = {"product_id", "specification_name"})}, indexes = {@Index(name = "idx_product_specifications_product_id", columnList = "product_id"), @Index(name = "idx_product_specifications_name_value", columnList = "specification_name, specification_value")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity productEntity;

    @Column(name = "specification_name", nullable = false, length = 100)
    private String specificationName;

    @Column(name = "specification_value", nullable = false, length = 500)
    private String specificationValue;
}