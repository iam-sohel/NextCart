        package com.nextcart.nextcart.auth_module.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;


    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf ->
                        csrf.disable()
                )


                // =================================================
                // SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // AUTHENTICATION PROVIDER
                // =================================================

                .authenticationProvider(
                        authenticationProvider()
                )


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -----------------------------------------
                        // PUBLIC AUTH APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh"
                        ).permitAll()


                        // -----------------------------------------
                        // SWAGGER / OPENAPI
                        // -----------------------------------------

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC PRODUCT APIs
                        // -----------------------------------------

                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/products/**"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC CATEGORY APIs
                        // -----------------------------------------

                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/categories/**"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC SUBCATEGORY APIs
                        // -----------------------------------------

                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/subcategories/**"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC BRAND APIs
                        // -----------------------------------------

                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/brands/**"
                        ).permitAll()


                        // =================================================
                        // CUSTOMER
                        // =================================================

                        .requestMatchers(
                                "/api/v1/customer/**"
                        ).hasRole("CUSTOMER")


                        // -----------------------------------------
                        // CART
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/v1/cart/**"
                        ).hasRole("CUSTOMER")


                        // -----------------------------------------
                        // WISHLIST
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/v1/wishlist/**"
                        ).hasRole("CUSTOMER")


                        // -----------------------------------------
                        // CUSTOMER ORDERS
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/v1/orders/**"
                        ).hasRole("CUSTOMER")


                        // =================================================
                        // SELLER
                        // =================================================

                        .requestMatchers(
                                "/api/v1/seller/**"
                        ).hasAnyRole(
                                "SELLER",
                                "ADMIN"
                        )


                        // =================================================
                        // ADMIN
                        // =================================================

                        .requestMatchers(
                                "/api/v1/admin/**"
                        ).hasRole("ADMIN")


                        // =================================================
                        // CURRENT USER
                        // =================================================

                        .requestMatchers(
                                "/api/v1/users/me"
                        ).authenticated()


                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )


                // =================================================
                // JWT FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder(12);
    }


    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
