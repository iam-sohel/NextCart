package com.nextcart.nextcart.adcommon.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Password hashing for users, OTPs, etc.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration for the NextCart frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:3000")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Main Spring Security configuration.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // REST API - CSRF is not required for stateless JWT APIs
                .csrf(csrf -> csrf.disable())

                // Enable CORS through Spring Security
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                // JWT authentication will be stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================================
                        // CORS PREFLIGHT
                        // =========================================
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // =========================================
                        // PUBLIC AUTH APIs
                        // =========================================
                        .requestMatchers(
                                "/api/v1/auth/**"
                        ).permitAll()

                        // =========================================
                        // PUBLIC CATALOGUE APIs - READ ONLY
                        // =========================================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/products/**",
                                "/api/v1/categories/**",
                                "/api/v1/subcategories/**"
                        ).permitAll()

                        // =========================================
                        // SWAGGER / OPENAPI
                        // =========================================
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =========================================
                        // ALL OTHER APIs
                        // =========================================
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}