        package com.nextcart.nextcart.auth_module.security;

import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import com.nextcart.nextcart.user_module.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER =
            "Authorization";

    private static final String BEARER_PREFIX =
            "Bearer ";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;


    // =========================================================
    // FILTER
    // =========================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri =
                request.getRequestURI();

        String token =
                extractToken(request);

        /*
         * No Authorization header.
         */
        if (token == null) {

            log.info(
                    "JWT: No Bearer token. method={}, uri={}",
                    request.getMethod(),
                    requestUri
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            // =================================================
            // EXTRACT EMAIL
            // =================================================

            String email =
                    jwtUtil.extractEmail(token);

            if (!StringUtils.hasText(email)) {

                log.warn(
                        "JWT rejected: email missing. uri={}",
                        requestUri
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // CHECK EXISTING AUTHENTICATION
            // =================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() != null) {

                log.info(
                        "JWT: SecurityContext already authenticated. uri={}",
                        requestUri
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // LOAD USER
            // =================================================

            User user =
                    userRepository
                            .findByEmailIgnoreCase(
                                    email.trim()
                            )
                            .orElse(null);

            if (user == null) {

                log.warn(
                        "JWT rejected: user not found. email={}, uri={}",
                        email,
                        requestUri
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // CHECK USER STATUS
            // =================================================

            if (!user.isEnabled()) {

                log.warn(
                        "JWT rejected: user disabled. userId={}, email={}",
                        user.getId(),
                        user.getEmail()
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // VALIDATE JWT
            // =================================================

            if (!jwtUtil.validateToken(
                    token,
                    email
            )) {

                log.warn(
                        "JWT rejected: validation failed. email={}, uri={}",
                        email,
                        requestUri
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // CREATE USER DETAILS
            // =================================================

            UserDetails userDetails =
                    new CustomUserDetails(user);


            // =================================================
            // CREATE AUTHENTICATION
            // =================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );


            // =================================================
            // REQUEST DETAILS
            // =================================================

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );


            // =================================================
            // SET SECURITY CONTEXT
            // =================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


            // =================================================
            // AUTHENTICATION TRACE
            // =================================================

            log.info(
                    "JWT authentication successful. " +
                            "userId={}, email={}, role={}, authorities={}, uri={}",
                    user.getId(),
                    user.getEmail(),
                    user.getRole().getName(),
                    userDetails.getAuthorities(),
                    requestUri
            );

        } catch (Exception exception) {

            /*
             * Never allow an invalid JWT to authenticate.
             *
             * We clear the context and continue so Spring Security
             * can reject protected resources with 401/403.
             */

            SecurityContextHolder
                    .clearContext();

            log.error(
                    "JWT authentication failed. method={}, uri={}, error={}",
                    request.getMethod(),
                    requestUri,
                    exception.getMessage(),
                    exception
            );
        }

        filterChain.doFilter(
                request,
                response
        );
    }


    // =========================================================
    // EXTRACT BEARER TOKEN
    // =========================================================

    private String extractToken(
            HttpServletRequest request) {

        String authorizationHeader =
                request.getHeader(
                        AUTHORIZATION_HEADER
                );

        if (!StringUtils.hasText(
                authorizationHeader
        )) {

            return null;
        }

        if (!authorizationHeader
                .regionMatches(
                        true,
                        0,
                        BEARER_PREFIX,
                        0,
                        BEARER_PREFIX.length()
                )) {

            log.warn(
                    "JWT rejected: Authorization header is not Bearer"
            );

            return null;
        }

        String token =
                authorizationHeader
                        .substring(
                                BEARER_PREFIX.length()
                        )
                        .trim();

        if (!StringUtils.hasText(token)) {
            return null;
        }

        return token;
    }
}
