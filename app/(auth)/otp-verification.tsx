import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { forgotPassword, verifyOtp } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { VerifyOtpRequest } from "../../types/auth";

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [contact, setContact] = useState<string>("");
  const [method, setMethod] = useState<"email" | "sms" | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Load contact info from params or AsyncStorage
  useEffect(() => {
    const loadContactInfo = async () => {
      const contactParam = params.contact as string;
      const methodParam = params.method as "email" | "sms";

      if (contactParam && methodParam) {
        setContact(contactParam);
        setMethod(methodParam);
        await AsyncStorage.setItem("forgotPasswordContact", contactParam);
        await AsyncStorage.setItem("forgotPasswordMethod", methodParam);
      } else {
        // Load from AsyncStorage if not in params
        const savedContact = await AsyncStorage.getItem("forgotPasswordContact");
        const savedMethod = await AsyncStorage.getItem("forgotPasswordMethod");
        if (savedContact && savedMethod) {
          setContact(savedContact);
          setMethod(savedMethod as "email" | "sms");
        } else {
          // No contact info, go back
          router.back();
        }
      }
    };

    loadContactInfo();
  }, [params]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 4).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setErrorMessage("Vui lòng nhập đầy đủ 4 chữ số OTP");
      setShowErrorNotification(true);
      return;
    }

    if (!contact) {
      setErrorMessage("Không tìm thấy thông tin liên hệ");
      setShowErrorNotification(true);
      return;
    }

    try {
      setVerifying(true);
      setErrorMessage("");

      const verifyOtpRequest: VerifyOtpRequest = {
        contact: contact,
        otp: otpCode,
      };

      const response = await verifyOtp(verifyOtpRequest);

      if (response.success) {
        // Lưu OTP đã verify vào AsyncStorage
        await AsyncStorage.setItem("verifiedOtp", otpCode);
        
        // Navigate to new password screen
        router.push({
          pathname: "/new-password",
          params: {
            contact: contact,
            otp: otpCode,
          },
        } as any);
      } else {
        setErrorMessage(response.message || "OTP không đúng. Vui lòng thử lại.");
        setShowErrorNotification(true);
        // Clear OTP on error
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let errorMsg = "OTP không đúng. Vui lòng thử lại.";
      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "OTP không đúng hoặc đã hết hạn";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setShowErrorNotification(true);
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!contact) {
      setErrorMessage("Không tìm thấy thông tin liên hệ");
      setShowErrorNotification(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const forgotPasswordRequest = {
        contact: contact,
      };

      const response = await forgotPassword(forgotPasswordRequest);

      if (response.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        setShowSuccessNotification(true);
      } else {
        setErrorMessage(response.message || "Không thể gửi lại OTP. Vui lòng thử lại.");
        setShowErrorNotification(true);
      }
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      let errorMsg = "Không thể gửi lại OTP. Vui lòng thử lại.";
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format contact info for display
  const formatContactInfo = (contact: string, method: "email" | "sms" | null): string => {
    if (!contact) return "";
    if (method === "email") {
      return contact;
    } else if (method === "sms") {
      // Format phone number: (XXX) XXX-XXXX
      const cleaned = contact.replace(/\D/g, "");
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return contact;
    }
    return contact;
  };

  const contactInfo = formatContactInfo(contact, method);

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
            <Text style={styles.title}>Nhập mã OTP</Text>
            <Text style={styles.subtitle}>
              Mã OTP đã được gửi đến {contactInfo || "..."}
            </Text>
          </View>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Ionicons
                name="shield-checkmark-outline"
                size={80}
                color="#4F46E5"
              />
            </View>
          </View>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Gửi lại mã</Text>
            {!canResend ? (
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <Text style={styles.resendLink}>Gửi lại</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.join("").length !== 4 || verifying) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.join("").length !== 4 || verifying}
            activeOpacity={0.8}
          >
            {verifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Xác thực</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message="OTP đã được gửi lại thành công!"
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  otpInputFilled: {
    borderColor: "#4F46E5",
    backgroundColor: "#F5F3FF",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  timerText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  resendLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  verifyButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

