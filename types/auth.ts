// API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
  timestamp: string;
}

// Register Request (matching backend)
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  birthday?: string;
  genderName?: "MALE" | "FEMALE" | "OTHER";
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// User Response (matching backend)
export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  birthday?: string;
  genderName?: "MALE" | "FEMALE" | "OTHER";
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Login Response (matching backend)
export interface LoginResponse {
  success: boolean;
  token: string;
  email: string;
  fullName: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  message: string;
  userId?: number;
  phoneNumber?: string;
  birthday?: string;
  authorities?: any[];
}

// OTP Response
export interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string;
}

// Forgot Password Request (matching backend)
export interface ForgotPasswordRequest {
  contact: string; // email hoặc phone number
}

// Verify OTP Request (matching backend)
export interface VerifyOtpRequest {
  contact: string; // email hoặc phone number
  otp: string;
}

// User Update Request (matching backend UserUpdateRequest)
export interface UserUpdateRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  birthday: string; // ISO date string
  genderName: "MALE" | "FEMALE" | "OTHER";
}

// Change Password Request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Reset Password Request (matching backend ResetPasswordRequest)
export interface ResetPasswordRequest {
  contact: string;
  otp: string;
  newPassword: string;
}
