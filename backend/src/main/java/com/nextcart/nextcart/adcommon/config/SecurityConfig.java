package com.nextcart.nextcart.adcommon.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

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
     * Main Spring Security configuration.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // REST API - CSRF is not required for stateless JWT APIs
                .csrf(csrf -> csrf.disable())

                // JWT authentication will be stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================================
                        // PUBLIC AUTH APIs
                        // =========================================
                        .requestMatchers(
                                "/api/v1/auth/**"
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