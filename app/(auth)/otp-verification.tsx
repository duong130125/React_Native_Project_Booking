import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
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

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      router.push("/new-password" as any);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}s`;
  };

  const contactInfo =
    params.method === "sms" ? "(406) 555-0120" : "curtis.weaver@example.com";

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
            <Text style={styles.title}>Enter OTP Code</Text>
            <Text style={styles.subtitle}>
              OTP code has been sent to {contactInfo}
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
            <Text style={styles.resendText}>Resend code</Text>
            {!canResend ? (
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              otp.join("").length !== 4 && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.join("").length !== 4}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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

