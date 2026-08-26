package com.nextcart.nextcart.auth_module.dto;

public class LoginResponse {

    private String token;
    private String refreshToken;
    private String message;
    private UserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            String refreshToken,
            String message,
            UserResponse user
    ) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.message = message;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public static class UserResponse {

        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;

        public UserResponse() {
        }

        public UserResponse(
                Long id,
                String firstName,
                String lastName,
                String email,
                String phone
        ) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.phone = phone;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }
}