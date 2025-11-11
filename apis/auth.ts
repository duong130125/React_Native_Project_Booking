import {
  APIResponse,
  RegisterRequest,
  LoginRequest,
  UserResponse,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  OtpResponse,
  UserUpdateRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from "../types/auth";
import axiosInstance from "../utils/axiosInstance";

// Đăng ký người dùng mới
export async function register(
  registerRequest: RegisterRequest
): Promise<UserResponse> {
  const response = await axiosInstance.post<APIResponse<UserResponse>>(
    "auth/register",
    registerRequest
  );
  return response.data.data;
}

// Đăng nhập
export async function login(
  loginRequest: LoginRequest
): Promise<LoginResponse> {
  const response = await axiosInstance.post<APIResponse<LoginResponse>>(
    "auth/login",
    loginRequest
  );
  return response.data.data;
}

// Lấy thông tin người dùng theo ID
export async function getUserById(id: number): Promise<UserResponse> {
  const response = await axiosInstance.get<APIResponse<UserResponse>>(
    `auth/user/${id}`
  );
  return response.data.data;
}

// Lấy thông tin người dùng theo email
export async function getUserByEmail(email: string): Promise<UserResponse> {
  const response = await axiosInstance.get<APIResponse<UserResponse>>(
    `auth/user/email/${email}`
  );
  return response.data.data;
}

// Kiểm tra email đã tồn tại chưa
export async function checkEmailExists(email: string): Promise<boolean> {
  const response = await axiosInstance.get<APIResponse<boolean>>(
    `auth/check-email/${email}`
  );
  return response.data.data;
}

// Cập nhật thông tin profile
export async function updateUserProfile(
  userId: number,
  updateRequest: UserUpdateRequest
): Promise<UserResponse> {
  const response = await axiosInstance.put<APIResponse<UserResponse>>(
    `auth/user/${userId}`,
    updateRequest
  );
  return response.data.data;
}

// Đổi mật khẩu
export async function changePassword(
  userId: number,
  changePasswordRequest: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.put<APIResponse<{ success: boolean; message: string }>>(
    `auth/user/${userId}/change-password`,
    changePasswordRequest
  );
  return response.data.data;
}

// Quên mật khẩu (nếu API được bật)
export async function forgotPassword(
  forgotPasswordRequest: ForgotPasswordRequest
): Promise<OtpResponse> {
  const response = await axiosInstance.post<APIResponse<OtpResponse>>(
    "auth/forgot-password",
    forgotPasswordRequest
  );
  return response.data.data;
}

// Xác thực OTP (nếu API được bật)
export async function verifyOtp(
  verifyOtpRequest: VerifyOtpRequest
): Promise<OtpResponse> {
  const response = await axiosInstance.post<APIResponse<OtpResponse>>(
    "auth/verify-otp",
    verifyOtpRequest
  );
  return response.data.data;
}

// Reset mật khẩu (nếu API được bật)
export async function resetPassword(
  resetPasswordRequest: ResetPasswordRequest
): Promise<OtpResponse> {
  const response = await axiosInstance.post<APIResponse<OtpResponse>>(
    "auth/reset-password",
    resetPasswordRequest
  );
  return response.data.data;
}
