package com.nextcart.nextcart.auth_module.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextcart.nextcart.auth_module.util.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // -------------------------------------------------
                // CSRF
                // -------------------------------------------------
                .csrf(csrf -> csrf.disable())

                // -------------------------------------------------
                // SESSION MANAGEMENT
                // -------------------------------------------------
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // -------------------------------------------------
                // AUTHORIZATION
                // -------------------------------------------------
                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // SWAGGER / OPEN API
                        // =================================================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // =================================================
                        // PUBLIC AUTHENTICATION APIs
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/customer/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/admin/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/register"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/register/seller"
                        ).permitAll()

                        // =================================================
                        // SELLER SIGNUP OTP APIs
                        // =================================================
                        // New seller does not have JWT yet.
                        // ONLY these two endpoints are public.
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/verify-seller-email-otp",
                                "/api/v1/auth/verify-seller-phone-otp"
                        ).permitAll()

                        // =================================================
                        // REFRESH TOKEN
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/refresh"
                        ).permitAll()

                        // =================================================
                        // PASSWORD RESET
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password"
                        ).permitAll()

                        // =================================================
                        // PUBLIC PRODUCT / CATALOG APIs
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/products/**",
                                "/api/v1/categories/**",
                                "/api/v1/subcategories/**",
                                "/api/v1/brands/**"
                        ).permitAll()

                        // =================================================
                        // ADMIN APIs
                        // =================================================

                        .requestMatchers(
                                "/api/v1/admin/**"
                        ).hasRole("ADMIN")

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // -------------------------------------------------
                // JWT FILTER
                // -------------------------------------------------

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =============================================================
    // PASSWORD ENCODER
    // =============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =============================================================
    // REST TEMPLATE
    // =============================================================

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // =============================================================
    // OBJECT MAPPER
    // =============================================================

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}