// Validation utilities matching backend Jakarta Validation constraints

export interface ValidationError {
  field: string;
  message: string;
}

// Email validation - matches backend @Email regex
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === "") {
    return "Email không được để trống";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email.trim())) {
    return "Định dạng email không hợp lệ";
  }

  return null;
};

// Password validation for register - matches backend @NotBlank and @Size(min = 6)
export const validatePassword = (
  password: string,
  isLogin: boolean = false
): string | null => {
  if (!password || password.trim() === "") {
    return "Mật khẩu không được để trống";
  }

  // Only check minimum length for register, not for login
  if (!isLogin && password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return null;
};

// FullName validation - matches backend @NotBlank
export const validateFullName = (fullName: string): string | null => {
  if (!fullName || fullName.trim() === "") {
    return "Họ và tên không được để trống";
  }

  return null;
};

// PhoneNumber validation - matches backend @NotBlank and @Pattern
export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return "Số điện thoại không được để trống";
  }

  // Vietnamese phone number pattern: 03|05|07|08|09|01[2|6|8|9] followed by 8 digits
  const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])[0-9]{8}$/;
  const cleanedPhone = phoneNumber.trim().replace(/\s+/g, ""); // Remove spaces

  if (!phoneRegex.test(cleanedPhone)) {
    return "Số điện thoại không đúng định dạng";
  }

  return null;
};

// Birthday validation - matches backend @NotNull and @Past
export const validateBirthday = (birthday: string): string | null => {
  if (!birthday || birthday.trim() === "") {
    return "Ngày sinh không thể là trống";
  }

  // Try to parse the date
  const date = new Date(birthday);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Ngày sinh không hợp lệ";
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date >= today) {
    return "Ngày sinh phải là ngày trong quá khứ";
  }

  return null;
};

// Gender validation - matches backend @NotNull
export const validateGender = (
  gender: string | null | undefined
): string | null => {
  if (!gender || gender.trim() === "") {
    return "Giới tính không được để trống";
  }

  const validGenders = ["MALE", "FEMALE", "OTHER"];
  if (!validGenders.includes(gender)) {
    return "Giới tính không hợp lệ";
  }

  return null;
};

// Login validation
export interface LoginValidationErrors {
  email?: string;
  password?: string;
}

export const validateLogin = (
  email: string,
  password: string
): LoginValidationErrors => {
  const errors: LoginValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  // For login, password only needs to be not blank (no minimum length requirement)
  const passwordError = validatePassword(password, true);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};

// Register validation
export interface RegisterValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  birthday?: string;
  genderName?: string;
}

export const validateRegister = (
  fullName: string,
  email: string,
  password: string,
  phoneNumber: string,
  birthday: string,
  genderName: string | null | undefined
): RegisterValidationErrors => {
  const errors: RegisterValidationErrors = {};

  const fullNameError = validateFullName(fullName);
  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  // For register, password needs to be at least 6 characters
  const passwordError = validatePassword(password, false);
  if (passwordError) {
    errors.password = passwordError;
  }

  const phoneNumberError = validatePhoneNumber(phoneNumber);
  if (phoneNumberError) {
    errors.phoneNumber = phoneNumberError;
  }

  const birthdayError = validateBirthday(birthday);
  if (birthdayError) {
    errors.birthday = birthdayError;
  }

  // Gender validation - only validate if explicitly null/undefined
  // Since gender has default value "MALE", we only check for null/undefined
  if (genderName === null || genderName === undefined) {
    errors.genderName = "Giới tính không được để trống";
  } else {
    const validGenders = ["MALE", "FEMALE", "OTHER"];
    if (!validGenders.includes(genderName)) {
      errors.genderName = "Giới tính không hợp lệ";
    }
  }

  return errors;
};

// Helper to check if validation errors object is empty
export const hasValidationErrors = (
  errors:
    | LoginValidationErrors
    | RegisterValidationErrors
    | Record<string, string | undefined>
): boolean => {
  return Object.values(errors).some(
    (error) => error !== undefined && error !== null
  );
};
