package com.nextcart.nextcart.auth_module.util;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.auth_module.util.JwtUtil;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        // No Authorization header
        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7).trim();

        // Empty token
        if (token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String email = jwtUtil.extractEmail(token);

            if (email != null
                    && SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                User user = userRepository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

                if (user != null
                        && user.isEnabled()
                        && jwtUtil.isTokenValid(token, email)) {

                    CustomUserDetails userDetails =
                            new CustomUserDetails(user);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception ignored) {
            /*
             * Invalid/expired JWT should not break the filter chain.
             * Spring Security will handle the request as unauthenticated.
             */
        }

        filterChain.doFilter(request, response);
    }
}