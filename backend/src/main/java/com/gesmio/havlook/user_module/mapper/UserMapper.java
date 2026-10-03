package com.gesmio.havlook.user_module.mapper;

import com.gesmio.havlook.user_module.dto.UserResponse;
import com.gesmio.havlook.user_module.dto.UserUpdateRequest;
import com.gesmio.havlook.user_module.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {

        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null
                        ? user.getRole().getName()
                        : null)
                .enabled(user.isEnabled())
                .build();
    }

    public void updateEntity(
            User user,
            UserUpdateRequest request
    ) {

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
    }
}