import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { login, register } from "../apis/auth";
import { LoginRequest, RegisterRequest } from "../types/auth";

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
  const router = useRouter();

  const handleAuth = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    if (!isLogin && !fullName) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
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

          // Lưu thông tin user
          const userData = {
            id: loginResponse.userId,
            email: loginResponse.email,
            fullName: loginResponse.fullName,
            gender: loginResponse.gender,
            phoneNumber: loginResponse.phoneNumber,
            birthday: loginResponse.birthday,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          Alert.alert(
            "Thành công",
            loginResponse.message || "Đăng nhập thành công!",
            [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/(tabs)/homepage");
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Lỗi",
            loginResponse.message || "Đăng nhập thất bại. Vui lòng thử lại."
          );
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

        Alert.alert(
          "Thành công",
          "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLogin(true);
                // Reset form
                setFullName("");
                setPhoneNumber("");
                setBirthday("");
                setEmail("");
                setPassword("");
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      // Xử lý Network Error đặc biệt
      if (error.isNetworkError || !error.response) {
        const platform = error.platform || "unknown";
        const baseURL = error.baseURL || "unknown";

        let errorMessage = "Không thể kết nối đến server.\n\n";

        if (platform === "android") {
          errorMessage += "Đang chạy trên Android:\n";
          errorMessage +=
            "• Emulator: Đảm bảo backend đang chạy tại http://localhost:8080\n";
          errorMessage += "  App sẽ dùng: http://10.0.2.2:8080\n";
          errorMessage +=
            "• Thiết bị thật: Dùng IP máy tính (ví dụ: http://192.168.1.100:8080)\n";
        } else if (platform === "ios") {
          errorMessage += "Đang chạy trên iOS:\n";
          errorMessage +=
            "• Simulator: Đảm bảo backend đang chạy tại http://localhost:8080\n";
          errorMessage +=
            "• Thiết bị thật: Dùng IP máy tính (ví dụ: http://192.168.1.100:8080)\n";
        }

        errorMessage += `\nURL hiện tại: ${baseURL}\n\n`;
        errorMessage += "Cách sửa:\n";
        errorMessage +=
          "1. Kiểm tra backend đang chạy (mở http://localhost:8080/api/v1/auth/check-email/test@test.com)\n";
        errorMessage += "2. Nếu là thiết bị thật, tìm IP máy tính:\n";
        errorMessage += "   - Windows: ipconfig (tìm IPv4 Address)\n";
        errorMessage += "   - Mac/Linux: ifconfig (tìm IP của WiFi adapter)\n";
        errorMessage += "3. Tạo file .env trong thư mục gốc với:\n";
        errorMessage += "   EXPO_PUBLIC_API_URL=http://YOUR_IP:8080/api/v1/\n";
        errorMessage += "4. Restart app với: npx expo start --clear";

        Alert.alert("Lỗi kết nối", errorMessage);
        setIsLoading(false);
        return;
      }

      // Xử lý error từ APIResponse format
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";

      if (error.response?.data) {
        const apiResponse = error.response.data;

        // Nếu có message từ APIResponse
        if (apiResponse.message) {
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
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = isLogin
          ? "Đăng nhập thất bại. Vui lòng thử lại."
          : "Đăng ký thất bại. Vui lòng thử lại.";
      }

      Alert.alert("Lỗi", errorMessage);
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
            <Text style={styles.logoText}>Clive Green</Text>
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
                  style={styles.input}
                  placeholder="Curtis Weaver"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="curtis.weaver@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Mobile Number Field (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(209) 555-0104"
                  placeholderTextColor="#9CA3AF"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            {/* Date of Birth Field (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, styles.inputWithIconText]}
                    placeholder="August 14, 2023"
                    placeholderTextColor="#9CA3AF"
                    value={birthday}
                    onChangeText={setBirthday}
                  />
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                </View>
              </View>
            )}

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  placeholder="**********"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
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
                    ]}
                    onPress={() => setGenderName("MALE")}
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
                    ]}
                    onPress={() => setGenderName("FEMALE")}
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
                </View>
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
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
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
  },
  genderOption: {
    flex: 1,
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
