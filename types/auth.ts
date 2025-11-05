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

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string;
}

// Verify OTP Request
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
