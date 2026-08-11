package com.nextcart.nextcart.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   private String name;

   @Column(unique = true, nullable = false)
   private String slug;

   @Column(columnDefinition = "TEXT")
   private String description;

   private String brand;

   private BigDecimal price;

   private BigDecimal originalPrice;

   private Integer discount;

   private BigDecimal rating;

   private Integer reviewCount;

   private Integer stock;

   private String category;

   private String image;
}