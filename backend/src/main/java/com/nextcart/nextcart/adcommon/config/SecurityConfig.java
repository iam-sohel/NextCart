package com.nextcart.nextcart.adcommon.config;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nextcart.nextcart.auth_module.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                                .requestMatchers(
                                        "/api/auth/**",
                                        "/api/v1/auth/**",

                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",

                                        // Product
                                        "/api/products/**",
                                        "/api/v1/products/**",

                                        // Category
                                        "/api/categories/**",
                                        "/api/v1/categories/**",

                                        // SubCategory
                                        "/api/subcategories/**",
                                        "/api/v1/subcategories/**",

                                        // Brand
                                        "/api/brands/**",
                                        "/api/v1/brands/**",

                                        // Product Variant
                                        "/api/product-variants/**",
                                        "/api/v1/product-variants/**",

                                        // Variant Attributes
                                        "/api/variant-attributes/**",
                                        "/api/v1/variant-attributes/**",

                                        // Product Information
                                        "/api/product-information/**",
                                        "/api/v1/product-information/**",

                                        // Product Specifications
                                        "/api/product-specifications/**",
                                        "/api/v1/product-specifications/**",

                                        // Product Images
                                        "/api/product-images/**",
                                        "/api/v1/product-images/**",

                                        // Product Videos
                                        "/api/product-videos/**",
                                        "/api/v1/product-videos/**",

                                        // Product Information
                                        "/api/product-information/**",
                                        "/api/v1/product-information/**",

                                        // Razorpay webhook
                                        "/api/v1/payments/webhook/razorpay"
                                ).permitAll()
                                .requestMatchers(
                                        "/api/v1/orders/**",
                                        "/api/v1/cart/**",
                                        "/api/v1/addresses/**",
                                        "/api/v1/wishlist/**",
                                        "/api/v1/payments/**"
                                ).authenticated()

                                .anyRequest().authenticated()
                        ).addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
