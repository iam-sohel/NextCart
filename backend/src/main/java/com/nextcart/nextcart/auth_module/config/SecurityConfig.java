package com.nextcart.nextcart.auth_module.config;

import com.nextcart.nextcart.auth_module.util.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        /*
         * Frontend origin
         */
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        /*
         * Allowed HTTP methods
         */
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        /*
         * Allowed request headers
         */
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));

        /*
         * Required when using credentials.
         */
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }


    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                /*
                 * Application uses stateless JWT authentication.
                 */.csrf(csrf -> csrf.disable())


                // =================================================
                // CORS
                // =================================================

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))


                // =================================================
                // SESSION MANAGEMENT
                // =================================================

                /*
                 * Do not create or maintain HTTP sessions.
                 */.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))


                // =================================================
                // DISABLE DEFAULT AUTHENTICATION MECHANISMS
                // =================================================

                /*
                 * Authentication is handled using JWT.
                 */.formLogin(form -> form.disable()).httpBasic(basic -> basic.disable())


                // =================================================
                // JWT AUTHENTICATION FILTER
                // =================================================

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // CORS PREFLIGHT
                        // -------------------------------------------------

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()


                        // -------------------------------------------------
                        // PUBLIC AUTH APIs
                        // -------------------------------------------------

                        .requestMatchers(HttpMethod.POST,

                                "/api/v1/auth/register", "/api/v1/auth/register/complete", "/api/v1/auth/register/seller",

                                "/api/v1/auth/login", "/api/v1/auth/refresh",

                                "/api/v1/auth/email/send-otp", "/api/v1/auth/email/verify-otp",

                                "/api/v1/auth/phone/verify-widget",

                                "/api/v1/auth/forgot-password", "/api/v1/auth/forgot-password/verify-otp", "/api/v1/auth/reset-password").permitAll()


                        // -------------------------------------------------
                        // LOGOUT
                        // -------------------------------------------------

                        /*
                         * Logout requires a valid authenticated user
                         * because it revokes that user's sessions.
                         */.requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()


                        // -------------------------------------------------
                        // PUBLIC PRODUCT APIs - GET ONLY
                        // -------------------------------------------------

                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()


                        // -------------------------------------------------
                        // PUBLIC CATEGORY APIs - GET ONLY
                        // -------------------------------------------------

                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()


                        // -------------------------------------------------
                        // PUBLIC SUBCATEGORY APIs - GET ONLY
                        // -------------------------------------------------

                        .requestMatchers(HttpMethod.GET, "/api/v1/subcategories/**").permitAll()


                        // -------------------------------------------------
                        // SWAGGER UI
                        // -------------------------------------------------

                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()


                        // -------------------------------------------------
                        // ALL OTHER REQUESTS
                        // -------------------------------------------------

                        .anyRequest().authenticated());

        return http.build();
    }
}