package com.nextcart.nextcart.auth_module.security;

import com.nextcart.nextcart.user_module.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (user.getRole() == null || user.getRole().getName() == null) {
            return List.of();
        }

        String role = user.getRole()
                .getName()
                .trim()
                .toUpperCase();

        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

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
        return user.isEnabled();
    }

    public Long getUserId() {
        return user.getId();
    }

    public User getUser() {
        return user;
    }
}