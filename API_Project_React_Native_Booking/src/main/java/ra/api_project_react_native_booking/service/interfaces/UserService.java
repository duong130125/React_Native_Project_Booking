package ra.api_project_react_native_booking.service.interfaces;

import ra.api_project_react_native_booking.dto.request.LoginRequest;
import ra.api_project_react_native_booking.dto.request.RegisterRequest;
import ra.api_project_react_native_booking.dto.request.UserUpdateRequest;
import ra.api_project_react_native_booking.dto.response.LoginResponse;
import ra.api_project_react_native_booking.dto.response.UserResponse;

public interface UserService {
    UserResponse updateUserProfile(Long userId, UserUpdateRequest updateRequest);
    UserResponse register(RegisterRequest registerRequest);
    LoginResponse login(LoginRequest loginRequest);
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    boolean existsByEmail(String email);
}