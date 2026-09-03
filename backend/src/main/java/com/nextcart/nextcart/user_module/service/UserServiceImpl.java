package com.nextcart.nextcart.user_module.service;


import com.nextcart.nextcart.user_module.dto.ChangePasswordRequest;
import com.nextcart.nextcart.user_module.dto.UserResponse;
import com.nextcart.nextcart.user_module.dto.UserUpdateRequest;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.exception.DuplicateResourceException;
import com.nextcart.nextcart.user_module.exception.InvalidPasswordException;
import com.nextcart.nextcart.user_module.exception.PasswordMismatchException;
import com.nextcart.nextcart.user_module.exception.UserNotFoundException;
import com.nextcart.nextcart.user_module.mapper.UserMapper;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile(String email) {

        User user = getUserByEmail(email);

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateMyProfile(
            String email,
            UserUpdateRequest request
    ) {

        User user = getUserByEmail(email);

        String newPhone = request.getPhone().trim();

        if (!newPhone.equals(user.getPhone())
                && userRepository.existsByPhone(newPhone)) {

            throw new DuplicateResourceException(
                    "Phone number is already registered"
            );
        }

        request.setPhone(newPhone);

        userMapper.updateEntity(user, request);

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Override
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {

            throw new InvalidPasswordException(
                    "Current password is incorrect"
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new PasswordMismatchException(
                    "New password and confirm password do not match"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {

            throw new InvalidPasswordException(
                    "New password must be different from current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

    @Override
    public void deactivateMyAccount(String email) {

        User user = getUserByEmail(email);

        user.setEnabled(false);

        userRepository.save(user);
    }

    private User getUserByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new UserNotFoundException(
                    "User email is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        )
                );
    }
}