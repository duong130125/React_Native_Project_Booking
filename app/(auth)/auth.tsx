import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login, register } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { LoginRequest, RegisterRequest } from "../../types/auth";
import {
  hasValidationErrors,
  LoginValidationErrors,
  RegisterValidationErrors,
  validateLogin,
  validateRegister,
} from "../../utils/validation";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [genderName, setGenderName] = useState<"MALE" | "FEMALE" | "OTHER">(
    "MALE"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<LoginValidationErrors>({});
  const [registerErrors, setRegisterErrors] =
    useState<RegisterValidationErrors>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));
  const router = useRouter();

  const handleAuth = async () => {
    // Validate inputs with strict validation
    if (isLogin) {
      const errors = validateLogin(email, password);
      setLoginErrors(errors);

      if (hasValidationErrors(errors)) {
        // Errors are already displayed under each input field
        return;
      }
    } else {
      const errors = validateRegister(
        fullName,
        email,
        password,
        phoneNumber,
        birthday,
        genderName
      );
      setRegisterErrors(errors);

      if (hasValidationErrors(errors)) {
        // Errors are already displayed under each input field
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Xử lý đăng nhập
        const loginRequest: LoginRequest = {
          email: email.trim(),
          password: password,
        };

        const loginResponse = await login(loginRequest);

        // Kiểm tra success và token
        if (loginResponse.success && loginResponse.token) {
          // Lưu token vào AsyncStorage
          await AsyncStorage.setItem("accessToken", loginResponse.token);

          // Lưu userId riêng để dễ truy cập
          if (loginResponse.userId) {
            await AsyncStorage.setItem(
              "userId",
              loginResponse.userId.toString()
            );
          }

          // Lưu thông tin user
          await AsyncStorage.setItem("fullName", loginResponse.fullName);
          await AsyncStorage.setItem("email", loginResponse.email);
          if (loginResponse.phoneNumber) {
            await AsyncStorage.setItem(
              "phoneNumber",
              loginResponse.phoneNumber
            );
          }
          if (loginResponse.birthday) {
            await AsyncStorage.setItem("birthday", loginResponse.birthday);
          }

          // Lưu user data object để tương thích với code cũ
          const userData = {
            id: loginResponse.userId,
            email: loginResponse.email,
            fullName: loginResponse.fullName,
            gender: loginResponse.gender,
            phoneNumber: loginResponse.phoneNumber,
            birthday: loginResponse.birthday,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          // Show success notification
          setSuccessMessage(loginResponse.message || "Đăng nhập thành công!");
          setShowSuccessNotification(true);

          // Navigate after a short delay to show the notification
          setTimeout(() => {
            router.replace("/(tabs)/homepage");
          }, 1500);
        } else {
          // Show error notification
          setErrorMessage(
            loginResponse.message || "Đăng nhập thất bại. Vui lòng thử lại."
          );
          setShowErrorNotification(true);
        }
      } else {
        // Xử lý đăng ký
        const registerRequest: RegisterRequest = {
          fullName: fullName.trim(),
          email: email.trim(),
          password: password,
          phoneNumber: phoneNumber.trim() || undefined,
          birthday: birthday.trim() || undefined,
          genderName: genderName || undefined,
        };

        const userResponse = await register(registerRequest);

        // Show success notification
        setSuccessMessage(
          "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục."
        );
        setShowSuccessNotification(true);

        // Switch to login mode and reset form after showing notification
        setTimeout(() => {
          setIsLogin(true);
          // Reset form
          setFullName("");
          setPhoneNumber("");
          setBirthday("");
          setEmail("");
          setPassword("");
          setGenderName("MALE");
          // Clear errors
          setLoginErrors({});
          setRegisterErrors({});
        }, 2000);
      }
    } catch (error: any) {
      // Chỉ log error nếu không phải là validation error hoặc expected error
      if (error.response?.status !== 401 && error.response?.status !== 400) {
        console.error("Auth error:", error);
      }

      // Xử lý Network Error đặc biệt
      if (error.isNetworkError || !error.response) {
        // Sử dụng error message từ axios interceptor (đã có hướng dẫn chi tiết)
        const errorMessage =
          error.message ||
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.";

        // Show error notification
        setErrorMessage(errorMessage);
        setShowErrorNotification(true);
        setIsLoading(false);
        return;
      }

      // Xử lý error từ APIResponse format
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";

      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        errorMessage = "Email hoặc mật khẩu không đúng. Vui lòng thử lại.";
      } else if (error.response?.status === 404) {
        errorMessage = isLogin
          ? "Không tìm thấy endpoint đăng nhập. Vui lòng kiểm tra kết nối server."
          : "Không tìm thấy endpoint đăng ký. Vui lòng kiểm tra kết nối server.";
      } else if (error.response?.status === 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau.";
      }

      if (error.response?.data) {
        const apiResponse = error.response.data;

        // Nếu có message từ APIResponse, ưu tiên dùng message này
        if (apiResponse.message && apiResponse.message.trim() !== "") {
          errorMessage = apiResponse.message;
        }

        // Nếu có errors object (validation errors)
        if (apiResponse.errors && typeof apiResponse.errors === "object") {
          const errorKeys = Object.keys(apiResponse.errors);
          if (errorKeys.length > 0) {
            const firstError = apiResponse.errors[errorKeys[0]];
            if (typeof firstError === "string") {
              errorMessage = firstError;
            } else if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
        }
      } else if (
        error.message &&
        !error.message.includes("Request failed with status code")
      ) {
        // Chỉ dùng error.message nếu không phải generic status code error
        errorMessage = error.message;
      }

      // Fallback message based on action
      if (errorMessage === "Đã xảy ra lỗi. Vui lòng thử lại.") {
        errorMessage = isLogin
          ? "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
          : "Đăng ký thất bại. Vui lòng thử lại.";
      }

      // Show error notification
      setErrorMessage(errorMessage);
      setShowErrorNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {showSuccessNotification && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccessNotification(false)}
          autoHide={true}
          duration={2000}
        />
      )}
      {showErrorNotification && (
        <ErrorNotification
          message={errorMessage}
          onClose={() => setShowErrorNotification(false)}
          autoHide={true}
          duration={4000}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.logoText}>live Green</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? "Let's get you Login!" : "Register Now!"}
            </Text>
            <Text style={styles.subtitle}>Enter your information below</Text>
          </View>

          {/* Social Login Buttons (only for Login) */}
          {isLogin && (
            <>
              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin("google")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.socialButtonText}>G Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin("facebook")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.socialButtonText}>f Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or login with</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Name Field (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    registerErrors.fullName && styles.inputError,
                  ]}
                  placeholder="Curtis Weaver"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    // Clear error when user starts typing
                    if (registerErrors.fullName) {
                      setRegisterErrors({
                        ...registerErrors,
                        fullName: undefined,
                      });
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    const errors = validateRegister(
                      fullName,
                      email,
                      password,
                      phoneNumber,
                      birthday,
                      genderName
                    );
                    setRegisterErrors({
                      ...registerErrors,
                      fullName: errors.fullName,
                    });
                  }}
                  autoCapitalize="words"
                />
                {registerErrors.fullName && (
                  <Text style={styles.errorText}>
                    {registerErrors.fullName}
                  </Text>
                )}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  (isLogin ? loginErrors.email : registerErrors.email) &&
                    styles.inputError,
                ]}
                placeholder="curtis.weaver@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Clear error when user starts typing
                  if (isLogin) {
                    if (loginErrors.email) {
                      setLoginErrors({ ...loginErrors, email: undefined });
                    }
                  } else {
                    if (registerErrors.email) {
                      setRegisterErrors({
                        ...registerErrors,
                        email: undefined,
                      });
                    }
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (isLogin) {
                    const errors = validateLogin(email, password);
                    setLoginErrors({ ...loginErrors, email: errors.email });
                  } else {
                    const errors = validateRegister(
                      fullName,
                      email,
                      password,
                      phoneNumber,
                      birthday,
                      genderName
                    );
                    setRegisterErrors({
                      ...registerErrors,
                      email: errors.email,
                    });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {(isLogin ? loginErrors.email : registerErrors.email) && (
                <Text style={styles.errorText}>
                  {isLogin ? loginErrors.email : registerErrors.email}
                </Text>
              )}
            </View>

            {/* Mobile Number Field (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    registerErrors.phoneNumber && styles.inputError,
                  ]}
                  placeholder="0912345678"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    // Clear error when user starts typing
                    if (registerErrors.phoneNumber) {
                      setRegisterErrors({
                        ...registerErrors,
                        phoneNumber: undefined,
                      });
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    const errors = validateRegister(
                      fullName,
                      email,
                      password,
                      phoneNumber,
                      birthday,
                      genderName
                    );
                    setRegisterErrors({
                      ...registerErrors,
                      phoneNumber: errors.phoneNumber,
                    });
                  }}
                  keyboardType="phone-pad"
                />
                {registerErrors.phoneNumber && (
                  <Text style={styles.errorText}>
                    {registerErrors.phoneNumber}
                  </Text>
                )}
              </View>
            )}

            {/* Date of Birth Field (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={[
                    styles.inputWithIcon,
                    registerErrors.birthday && styles.inputError,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.input,
                      styles.inputWithIconText,
                      !birthday && styles.placeholderText,
                    ]}
                  >
                    {birthday || "Chọn ngày sinh (YYYY-MM-DD)"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (date) {
                        setSelectedDate(date);
                        // Format date as YYYY-MM-DD
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const formattedDate = `${year}-${month}-${day}`;
                        setBirthday(formattedDate);
                        // Clear error when date is selected
                        if (registerErrors.birthday) {
                          setRegisterErrors({
                            ...registerErrors,
                            birthday: undefined,
                          });
                        }
                        // Validate immediately
                        const errors = validateRegister(
                          fullName,
                          email,
                          password,
                          phoneNumber,
                          formattedDate,
                          genderName
                        );
                        setRegisterErrors({
                          ...registerErrors,
                          birthday: errors.birthday,
                        });
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
                {Platform.OS === "ios" && showDatePicker && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerButtonText}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {registerErrors.birthday && (
                  <Text style={styles.errorText}>
                    {registerErrors.birthday}
                  </Text>
                )}
              </View>
            )}

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  (isLogin ? loginErrors.password : registerErrors.password) &&
                    styles.inputError,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  placeholder="**********"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear error when user starts typing
                    if (isLogin) {
                      if (loginErrors.password) {
                        setLoginErrors({ ...loginErrors, password: undefined });
                      }
                    } else {
                      if (registerErrors.password) {
                        setRegisterErrors({
                          ...registerErrors,
                          password: undefined,
                        });
                      }
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    if (isLogin) {
                      const errors = validateLogin(email, password);
                      setLoginErrors({
                        ...loginErrors,
                        password: errors.password,
                      });
                    } else {
                      const errors = validateRegister(
                        fullName,
                        email,
                        password,
                        phoneNumber,
                        birthday,
                        genderName
                      );
                      setRegisterErrors({
                        ...registerErrors,
                        password: errors.password,
                      });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {(isLogin ? loginErrors.password : registerErrors.password) && (
                <Text style={styles.errorText}>
                  {isLogin ? loginErrors.password : registerErrors.password}
                </Text>
              )}
            </View>

            {/* Gender Selection (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      genderName === "MALE" && styles.genderOptionActive,
                      registerErrors.genderName && styles.genderOptionError,
                    ]}
                    onPress={() => {
                      setGenderName("MALE");
                      // Clear error when user selects
                      if (registerErrors.genderName) {
                        setRegisterErrors({
                          ...registerErrors,
                          genderName: undefined,
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        genderName === "MALE" && styles.radioButtonActive,
                      ]}
                    >
                      {genderName === "MALE" && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.genderText,
                        genderName === "MALE" && styles.genderTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      genderName === "FEMALE" && styles.genderOptionActive,
                      registerErrors.genderName && styles.genderOptionError,
                    ]}
                    onPress={() => {
                      setGenderName("FEMALE");
                      // Clear error when user selects
                      if (registerErrors.genderName) {
                        setRegisterErrors({
                          ...registerErrors,
                          genderName: undefined,
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        genderName === "FEMALE" && styles.radioButtonActive,
                      ]}
                    >
                      {genderName === "FEMALE" && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.genderText,
                        genderName === "FEMALE" && styles.genderTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      genderName === "OTHER" && styles.genderOptionActive,
                      registerErrors.genderName && styles.genderOptionError,
                    ]}
                    onPress={() => {
                      setGenderName("OTHER");
                      // Clear error when user selects
                      if (registerErrors.genderName) {
                        setRegisterErrors({
                          ...registerErrors,
                          genderName: undefined,
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        genderName === "OTHER" && styles.radioButtonActive,
                      ]}
                    >
                      {genderName === "OTHER" && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.genderText,
                        genderName === "OTHER" && styles.genderTextActive,
                      ]}
                    >
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
                {registerErrors.genderName && (
                  <Text style={styles.errorText}>
                    {registerErrors.genderName}
                  </Text>
                )}
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/forgot-password" as any)}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Auth Button */}
            <TouchableOpacity
              style={[
                styles.authButton,
                isLoading && styles.authButtonDisabled,
              ]}
              onPress={handleAuth}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Login" : "Register"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Auth Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already a member? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  // Clear errors when switching modes
                  setLoginErrors({});
                  setRegisterErrors({});
                }}
              >
                <Text style={styles.switchLink}>
                  {isLogin ? "Register Now" : "Login"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircleInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 6,
    borderColor: "#4F46E5",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4F46E5",
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "left",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
    paddingHorizontal: 16,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 14,
  },
  inputIcon: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  datePickerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  genderOption: {
    flex: 1,
    minWidth: "30%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  genderOptionActive: {
    borderColor: "#4F46E5",
    borderWidth: 2,
  },
  genderOptionError: {
    borderColor: "#DC2626",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonActive: {
    borderColor: "#4F46E5",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
  },
  genderText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  authButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  switchText: {
    fontSize: 14,
    color: "#6B7280",
  },
  switchLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
});
