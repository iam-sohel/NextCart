package com.nextcart.nextcart.product_module.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "short_description")
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Column(name = "warranty")
    private String warranty;

    @Column(name = "manufacturer")
    private String manufacturer;
}