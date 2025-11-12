import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  APIResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  OtpResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
  UserUpdateRequest,
  VerifyOtpRequest,
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
  const response = await axiosInstance.put<
    APIResponse<{ success: boolean; message: string }>
  >(`auth/user/${userId}/change-password`, changePasswordRequest);
  return response.data.data;
}

// Quên mật khẩu - gửi OTP
export async function forgotPassword(
  forgotPasswordRequest: ForgotPasswordRequest
): Promise<OtpResponse> {
  try {
    const response = await axiosInstance.post<APIResponse<OtpResponse>>(
      "auth/forgot-password",
      forgotPasswordRequest
    );
    return response.data.data;
  } catch (error: any) {
    // Nếu API chưa được bật (404), trả về mock response để test UI
    if (error.response?.status === 404) {
      console.warn("Forgot password API not available, returning mock response");
      return {
        success: true,
        message: "OTP đã được gửi thành công (mock)",
        otp: "1234",
      };
    }
    throw error;
  }
}

// Xác thực OTP
export async function verifyOtp(
  verifyOtpRequest: VerifyOtpRequest
): Promise<OtpResponse> {
  try {
    const response = await axiosInstance.post<APIResponse<OtpResponse>>(
      "auth/verify-otp",
      verifyOtpRequest
    );
    return response.data.data;
  } catch (error: any) {
    // Nếu API chưa được bật (404), trả về mock response để test UI
    if (error.response?.status === 404) {
      console.warn("Verify OTP API not available, returning mock response");
      // Mock: accept any 4-digit OTP
      if (verifyOtpRequest.otp.length === 4) {
        return {
          success: true,
          message: "OTP xác thực thành công (mock)",
        };
      } else {
        return {
          success: false,
          message: "OTP không đúng",
        };
      }
    }
    throw error;
  }
}

// Reset mật khẩu
export async function resetPassword(
  resetPasswordRequest: ResetPasswordRequest
): Promise<OtpResponse> {
  try {
    const response = await axiosInstance.post<APIResponse<OtpResponse>>(
      "auth/reset-password",
      resetPasswordRequest
    );
    return response.data.data;
  } catch (error: any) {
    // Nếu API chưa được bật (404), trả về mock response để test UI
    if (error.response?.status === 404) {
      console.warn("Reset password API not available, returning mock response");
      return {
        success: true,
        message: "Đặt lại mật khẩu thành công (mock)",
      };
    }
    throw error;
  }
}

export async function uploadAvatar(
  userId: number,
  imageUri: string
): Promise<UserResponse> {
  const formData = new FormData();

  const filename = imageUri.split("/").pop() || `avatar_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : "image/jpeg";

  // iOS: giữ nguyên file://, Android: giữ nguyên path
  const file = {
    uri: imageUri, // giữ nguyên, không replace
    name: filename,
    type,
  } as any;

  formData.append("file", file);

  console.log("📤 Uploading avatar:", {
    userId,
    filename,
    type,
    isFormData: formData instanceof FormData,
    formDataConstructor: formData.constructor.name,
  });

  // Sử dụng fetch API thay vì axios vì fetch xử lý FormData tốt hơn trong React Native
  const baseURL =
    axiosInstance.defaults.baseURL || "http://10.210.32.40:8080/api/v1/";
  const token = await AsyncStorage.getItem("accessToken");

  const url = `${baseURL}auth/user/${userId}/avatar`;

  const headers: HeadersInit = {
    Accept: "application/json",
    // KHÔNG set Content-Type - fetch sẽ tự động set với boundary cho FormData
  };

  // Thêm Authorization header nếu có token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("📤 Uploading with fetch:", { url, hasToken: !!token });

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Upload failed with status ${response.status}`
    );
  }

  const result: APIResponse<UserResponse> = await response.json();
  return result.data;
}
