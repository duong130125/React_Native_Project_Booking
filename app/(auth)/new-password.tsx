import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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
import { resetPassword } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { ResetPasswordRequest } from "../../types/auth";
import { validatePassword } from "../../utils/validation";

export default function NewPasswordScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load contact and OTP from params or AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      const contactParam = params.contact as string;
      const otpParam = params.otp as string;

      if (contactParam && otpParam) {
        setContact(contactParam);
        setOtp(otpParam);
        await AsyncStorage.setItem("forgotPasswordContact", contactParam);
        await AsyncStorage.setItem("verifiedOtp", otpParam);
      } else {
        // Load from AsyncStorage if not in params
        const savedContact = await AsyncStorage.getItem(
          "forgotPasswordContact"
        );
        const savedOtp = await AsyncStorage.getItem("verifiedOtp");
        if (savedContact && savedOtp) {
          setContact(savedContact);
          setOtp(savedOtp);
        } else {
          // No data, go back
          router.back();
        }
      }
    };

    loadData();
  }, [params]);

  // Real-time validation
  useEffect(() => {
    // Validate password on change
    if (password.length > 0) {
      const error = validatePassword(password, false);
      setPasswordError(error);
    } else {
      setPasswordError(null);
    }

    // Validate confirm password on change
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      } else {
        setConfirmPasswordError(null);
      }
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword]);

  const handleSave = async () => {
    // Validate password
    const passwordValidationError = validatePassword(password, false);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      setErrorMessage(passwordValidationError);
      setShowErrorNotification(true);
      return;
    }

    // Validate confirm password
    if (!confirmPassword || confirmPassword.trim() === "") {
      const error = "Xác nhận mật khẩu không được để trống";
      setConfirmPasswordError(error);
      setErrorMessage(error);
      setShowErrorNotification(true);
      return;
    }

    if (password !== confirmPassword) {
      const error = "Mật khẩu xác nhận không khớp";
      setConfirmPasswordError(error);
      setErrorMessage(error);
      setShowErrorNotification(true);
      return;
    }

    if (!contact || !otp) {
      setErrorMessage("Thông tin không hợp lệ. Vui lòng thử lại từ đầu.");
      setShowErrorNotification(true);
      return;
    }

    try {
      setLoading(true);
      setPasswordError(null);
      setConfirmPasswordError(null);
      setErrorMessage("");

      const resetPasswordRequest: ResetPasswordRequest = {
        contact: contact,
        otp: otp,
        newPassword: password,
      };

      const response = await resetPassword(resetPasswordRequest);

      if (response.success) {
        // Clear forgot password data from AsyncStorage
        await AsyncStorage.removeItem("forgotPasswordContact");
        await AsyncStorage.removeItem("forgotPasswordMethod");
        await AsyncStorage.removeItem("verifiedOtp");

        // Navigate to success screen
        router.push("/password-success" as any);
      } else {
        setErrorMessage(
          response.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại."
        );
        setShowErrorNotification(true);
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      let errorMsg = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      if (error.response?.status === 400) {
        errorMsg =
          error.response?.data?.message ||
          "Thông tin không hợp lệ hoặc OTP đã hết hạn";
      } else if (error.response?.status === 404) {
        errorMsg = "Không tìm thấy thông tin. Vui lòng thử lại từ đầu.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    !passwordError &&
    !confirmPasswordError;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nhập mật khẩu mới</Text>
            <Text style={styles.subtitle}>
              Vui lòng nhập mật khẩu mới của bạn
            </Text>
          </View>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Ionicons name="key-outline" size={80} color="#4F46E5" />
            </View>
          </View>

          {/* Password Fields */}
          <View style={styles.form}>
            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  passwordError && styles.inputError,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
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
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>
                    Yêu cầu mật khẩu:
                  </Text>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        password.length >= 8
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={password.length >= 8 ? "#10B981" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        password.length >= 8 && styles.requirementTextMet,
                      ]}
                    >
                      Ít nhất 8 ký tự
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        /[a-z]/.test(password)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={/[a-z]/.test(password) ? "#10B981" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        /[a-z]/.test(password) && styles.requirementTextMet,
                      ]}
                    >
                      Có chữ cái thường
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        /[A-Z]/.test(password)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={/[A-Z]/.test(password) ? "#10B981" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        /[A-Z]/.test(password) && styles.requirementTextMet,
                      ]}
                    >
                      Có chữ cái hoa
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        /[0-9]/.test(password)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={/[0-9]/.test(password) ? "#10B981" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        /[0-9]/.test(password) && styles.requirementTextMet,
                      ]}
                    >
                      Có chữ số
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={14}
                      color={
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                          ? "#10B981"
                          : "#9CA3AF"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                          password
                        ) && styles.requirementTextMet,
                      ]}
                    >
                      Có ký tự đặc biệt
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  confirmPasswordError && styles.inputError,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError && (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isFormValid || loading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message="Đặt lại mật khẩu thành công!"
          onClose={() => setShowSuccessNotification(false)}
          autoHide={true}
          duration={2000}
        />
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <ErrorNotification
          message={errorMessage}
          onClose={() => setShowErrorNotification(false)}
          autoHide={true}
          duration={4000}
        />
      )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    height: 200,
  },
  illustration: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    width: "100%",
    marginBottom: 32,
    gap: 20,
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
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#6B7280",
  },
  requirementTextMet: {
    color: "#10B981",
    fontWeight: "500",
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 14,
  },
  iconButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  saveButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
