package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ra.api_project_react_native_booking.dto.request.LoginRequest;
import ra.api_project_react_native_booking.dto.request.RegisterRequest;
import ra.api_project_react_native_booking.dto.request.UserUpdateRequest;
import ra.api_project_react_native_booking.dto.response.LoginResponse;
import ra.api_project_react_native_booking.dto.response.UserResponse;
import ra.api_project_react_native_booking.model.User;
import ra.api_project_react_native_booking.model.constants.GenderName;
import ra.api_project_react_native_booking.repository.UserRepository;
import ra.api_project_react_native_booking.security.jwt.JWTProvider;
import ra.api_project_react_native_booking.service.interfaces.UserService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTProvider jwtProvider;

    @Override
    public UserResponse updateUserProfile(Long userId, UserUpdateRequest updateRequest) {
        return null;
    }

    @Override
    public UserResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (registerRequest.getPhoneNumber() != null &&
                userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .phoneNumber(registerRequest.getPhoneNumber())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .birthday(registerRequest.getBirthday())
                .gender(registerRequest.getGenderName() != null ? registerRequest.getGenderName() : GenderName.OTHER)
                .build();

        User savedUser = userRepository.save(user);

        return convertToUserResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = generateToken(user);

        return LoginResponse.builder()
                .success(true)
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .birthday(user.getBirthday())
                .gender(user.getGender())
                .authorities(null) // User model không có authorities, có thể thêm sau
                .message("Login successful")
                .build();
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .birthday(user.getBirthday())
                .genderName(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private String generateToken(User user) {
        // Sử dụng JWTProvider để generate JWT token thực sự với claims
        // Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        // Subject là userId, có thêm claims: role, status
        // Tạm thời role và status là default, có thể mở rộng sau khi thêm vào User
        // model
        return jwtProvider.generateTokenWithClaims(
                user.getId(),
                user.getEmail(),
                "USER", // Default role, có thể lấy từ User model sau
                "ACTIVE", // Default status, có thể lấy từ User model sau
                null // deviceId - có thể lấy từ request sau
        );
    }
}