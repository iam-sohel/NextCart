        package com.nextcart.nextcart.user_module.security;

import com.nextcart.nextcart.user_module.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final String role;

    public CustomUserDetails(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        if (user.getId() == null) {
            throw new IllegalStateException(
                    "User ID is not configured"
            );
        }

        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new IllegalStateException(
                    "User email is not configured"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new IllegalStateException(
                    "User password is not configured"
            );
        }

        if (user.getRole() == null ||
                user.getRole().getName() == null ||
                user.getRole().getName().isBlank()) {

            throw new IllegalStateException(
                    "User role is not configured"
            );
        }

        this.userId = user.getId();

        this.email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        this.password =
                user.getPassword();

        this.enabled =
                user.isEnabled();

        String roleName =
                user.getRole()
                        .getName()
                        .trim()
                        .toUpperCase();

        if (roleName.startsWith("ROLE_")) {
            roleName =
                    roleName.substring(5);
        }

        this.role = roleName;
    }


    // =========================================================
    // AUTHORITIES
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(
                new SimpleGrantedAuthority(
                        "ROLE_" + role
                )
        );
    }


    // =========================================================
    // PASSWORD
    // =========================================================

    @Override
    public String getPassword() {
        return password;
    }


    // =========================================================
    // USERNAME
    // =========================================================

    @Override
    public String getUsername() {
        return email;
    }


    // =========================================================
    // ACCOUNT STATUS
    // =========================================================

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
