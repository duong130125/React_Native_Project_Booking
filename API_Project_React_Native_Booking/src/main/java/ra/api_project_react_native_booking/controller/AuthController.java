package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.ForgotPasswordRequest;
import ra.api_project_react_native_booking.dto.request.LoginRequest;
import ra.api_project_react_native_booking.dto.request.RegisterRequest;
import ra.api_project_react_native_booking.dto.request.VerifyOtpRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.LoginResponse;
import ra.api_project_react_native_booking.dto.response.OtpResponse;
import ra.api_project_react_native_booking.dto.response.UserResponse;
import ra.api_project_react_native_booking.service.interfaces.UserService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserResponse userResponse = userService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<UserResponse>builder()
                        .success(true)
                        .message("Register successfully!")
                        .data(userResponse)
                        .status(HttpStatus.CREATED)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<APIResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = userService.login(loginRequest);
        HttpStatus status = loginResponse.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;

        return ResponseEntity.status(status).body(
                APIResponse.<LoginResponse>builder()
                        .success(loginResponse.isSuccess())
                        .message(loginResponse.getMessage())
                        .data(loginResponse)
                        .status(status)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<APIResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse userResponse = userService.getUserById(id);
        return ResponseEntity.ok(
                APIResponse.<UserResponse>builder()
                        .success(true)
                        .message("User retrieved successfully")
                        .data(userResponse)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/email/{email}")
    public ResponseEntity<APIResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse userResponse = userService.getUserByEmail(email);
        return ResponseEntity.ok(
                APIResponse.<UserResponse>builder()
                        .success(true)
                        .message("User retrieved successfully")
                        .data(userResponse)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // API kiểm tra email tồn tại
    @GetMapping("/check-email/{email}")
    public ResponseEntity<APIResponse<Boolean>> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(
                APIResponse.<Boolean>builder()
                        .success(true)
                        .message(exists ? "Email already exists" : "Email available")
                        .data(exists)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

//    @PostMapping("/forgot-password")
//    public ResponseEntity<APIResponse<OtpResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
//        OtpResponse otpResponse = userService.forgotPassword(forgotPasswordRequest);
//        return ResponseEntity.ok(
//                APIResponse.<OtpResponse>builder()
//                        .success(otpResponse.isSuccess())
//                        .message(otpResponse.getMessage())
//                        .data(otpResponse)
//                        .status(HttpStatus.OK)
//                        .timestamp(LocalDateTime.now())
//                        .build()
//        );
//    }
//
//    @PostMapping("/verify-otp")
//    public ResponseEntity<APIResponse<OtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest verifyOtpRequest) {
//        OtpResponse otpResponse = userService.verifyOtp(verifyOtpRequest);
//        return ResponseEntity.ok(
//                APIResponse.<OtpResponse>builder()
//                        .success(otpResponse.isSuccess())
//                        .message(otpResponse.getMessage())
//                        .data(otpResponse)
//                        .status(HttpStatus.OK)
//                        .timestamp(LocalDateTime.now())
//                        .build()
//        );
//    }
//
//    @PostMapping("/reset-password")
//    public ResponseEntity<APIResponse<OtpResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
//        OtpResponse otpResponse = userService.resetPassword(resetPasswordRequest);
//        return ResponseEntity.ok(
//                APIResponse.<OtpResponse>builder()
//                        .success(otpResponse.isSuccess())
//                        .message(otpResponse.getMessage())
//                        .data(otpResponse)
//                        .status(HttpStatus.OK)
//                        .timestamp(LocalDateTime.now())
//                        .build()
//        );
//    }
//
//    // API refresh token
//    @PostMapping("/refresh-token")
//    public ResponseEntity<APIResponse<LoginResponse>> refreshToken(@RequestHeader("Authorization") String token) {
//        String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
//        LoginResponse refreshed = userService.refreshToken(jwtToken);
//
//        return ResponseEntity.ok(
//                APIResponse.<LoginResponse>builder()
//                        .success(refreshed.isSuccess())
//                        .message(refreshed.getMessage())
//                        .data(refreshed)
//                        .status(HttpStatus.OK)
//                        .timestamp(LocalDateTime.now())
//                        .build()
//        );
//    }
//
//    // API đăng xuất
//    @PostMapping("/logout")
//    public ResponseEntity<APIResponse<String>> logout(@RequestHeader("Authorization") String token) {
//        String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
//        boolean logoutSuccess = userService.logout(jwtToken);
//
//        if (logoutSuccess) {
//            return ResponseEntity.ok(
//                    APIResponse.<String>builder()
//                            .success(true)
//                            .message("Logout successfully")
//                            .data("User logged out")
//                            .status(HttpStatus.OK)
//                            .timestamp(LocalDateTime.now())
//                            .build()
//            );
//        } else {
//            return ResponseEntity.badRequest().body(
//                    APIResponse.<String>builder()
//                            .success(false)
//                            .message("Logout failed")
//                            .data(null)
//                            .status(HttpStatus.BAD_REQUEST)
//                            .timestamp(LocalDateTime.now())
//                            .build()
//            );
//        }
//    }
}