import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { forgotPassword, getUserByEmail } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { ForgotPasswordRequest } from "../../types/auth";
import { validateEmail, validatePhoneNumber } from "../../utils/validation";

type ContactMethod = "sms" | "email" | null;

export default function ForgotPasswordScreen() {
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod>(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10
    )}`;
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      setErrorMessage("Vui lòng chọn phương thức nhận OTP");
      setShowErrorNotification(true);
      return;
    }

    let contact = "";
    let validationError: string | null = null;

    if (selectedMethod === "email") {
      validationError = validateEmail(email);
      if (validationError) {
        setErrorMessage(validationError);
        setShowErrorNotification(true);
        return;
      }
      contact = email.trim();
    } else if (selectedMethod === "sms") {
      // Remove formatting from phone number
      const cleanedPhone = phoneNumber.replace(/\D/g, "");
      validationError = validatePhoneNumber(cleanedPhone);
      if (validationError) {
        setErrorMessage(validationError);
        setShowErrorNotification(true);
        return;
      }
      contact = cleanedPhone;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API forgot password
      const forgotPasswordRequest: ForgotPasswordRequest = {
        contact: contact,
      };

      const response = await forgotPassword(forgotPasswordRequest);

      if (response.success) {
        // Lưu contact vào AsyncStorage để dùng ở các screen sau
        await AsyncStorage.setItem("forgotPasswordContact", contact);
        await AsyncStorage.setItem("forgotPasswordMethod", selectedMethod);

        // Navigate to OTP verification
        router.push({
          pathname: "/otp-verification",
          params: {
            method: selectedMethod,
            contact: contact,
          },
        } as any);
      } else {
        setErrorMessage(
          response.message || "Không thể gửi OTP. Vui lòng thử lại."
        );
        setShowErrorNotification(true);
      }
    } catch (error: any) {
      console.error("Error sending forgot password request:", error);
      let errorMsg = "Không thể gửi OTP. Vui lòng thử lại.";
      if (error.response?.status === 404) {
        errorMsg = "Email hoặc số điện thoại không tồn tại trong hệ thống";
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "Thông tin không hợp lệ";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  // Load user info when method is selected
  React.useEffect(() => {
    const loadUserInfo = async () => {
      if (selectedMethod === "email" && email.trim()) {
        const emailError = validateEmail(email);
        if (!emailError) {
          try {
            const user = await getUserByEmail(email.trim());
            // User exists, can proceed
          } catch (error) {
            // User not found, but we'll let the API handle it
          }
        }
      }
    };

    // Debounce
    const timeoutId = setTimeout(loadUserInfo, 500);
    return () => clearTimeout(timeoutId);
  }, [email, selectedMethod]);

  return (
    <RNSafeAreaView style={styles.container}>
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
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
              Chọn phương thức nhận mã OTP để đặt lại mật khẩu
            </Text>
          </View>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Ionicons name="lock-closed-outline" size={80} color="#4F46E5" />
            </View>
          </View>

          {/* Contact Method Options */}
          <View style={styles.optionsContainer}>
            {/* Email Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "email" && styles.optionCardSelected,
              ]}
              onPress={() => {
                setSelectedMethod("email");
                setPhoneNumber("");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedMethod === "email"
                      ? styles.iconContainerActive
                      : styles.iconContainerInactive,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={selectedMethod === "email" ? "#FFFFFF" : "#6B7280"}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Gửi OTP qua Email</Text>
                  {selectedMethod === "email" ? (
                    <TextInput
                      style={[
                        styles.optionInput,
                        error && styles.optionInputError,
                      ]}
                      placeholder="Nhập email của bạn"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <Text style={styles.optionValueInactive}>
                      Nhập email để nhận mã OTP
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === "email" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "email" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>

            {/* SMS Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === "sms" && styles.optionCardSelected,
              ]}
              onPress={() => {
                setSelectedMethod("sms");
                setEmail("");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedMethod === "sms"
                      ? styles.iconContainerActive
                      : styles.iconContainerInactive,
                  ]}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={selectedMethod === "sms" ? "#FFFFFF" : "#6B7280"}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Gửi OTP qua SMS</Text>
                  {selectedMethod === "sms" ? (
                    <TextInput
                      style={[
                        styles.optionInput,
                        error && styles.optionInputError,
                      ]}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(formatPhoneNumber(text));
                        setError(null);
                      }}
                      keyboardType="phone-pad"
                      maxLength={14}
                    />
                  ) : (
                    <Text style={styles.optionValueInactive}>
                      Nhập số điện thoại để nhận mã OTP
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === "sms" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "sms" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedMethod ||
                loading ||
                (selectedMethod === "email" && !email.trim()) ||
                (selectedMethod === "sms" && !phoneNumber.trim())) &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={
              !selectedMethod ||
              loading ||
              (selectedMethod === "email" && !email.trim()) ||
              (selectedMethod === "sms" && !phoneNumber.trim())
            }
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message="OTP đã được gửi thành công!"
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
    </RNSafeAreaView>
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
  optionsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
  },
  optionCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#F5F3FF",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerActive: {
    backgroundColor: "#4F46E5",
  },
  iconContainerInactive: {
    backgroundColor: "#F3F4F6",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 14,
  },
  optionValueActive: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  optionValueInactive: {
    color: "#6B7280",
  },
  optionInput: {
    fontSize: 14,
    color: "#111827",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionInputError: {
    borderBottomColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#4F46E5",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
  },
  continueButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  continueButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
