package com.gesmio.havlook.auth_module.security;

import com.gesmio.havlook.user_module.entity.User;
import com.gesmio.havlook.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        if (username == null || username.isBlank()) {
            throw new UsernameNotFoundException(
                    "Username is required"
            );
        }

        final Long userId;

        try {
            userId = Long.valueOf(username.trim());
        } catch (NumberFormatException ex) {
            throw new UsernameNotFoundException(
                    "Invalid user identifier"
            );
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found"
                        )
                );

        return new CustomUserDetails(user);
    }
}