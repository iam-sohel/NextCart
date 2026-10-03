package com.gesmio.havlook.user_module.service;

import com.gesmio.havlook.user_module.dto.ChangePasswordRequest;
import com.gesmio.havlook.user_module.dto.UserResponse;
import com.gesmio.havlook.user_module.dto.UserUpdateRequest;

public interface UserService {

    UserResponse getMyProfile(String email);

    UserResponse updateMyProfile(String email, UserUpdateRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    void deactivateMyAccount(String email);
}