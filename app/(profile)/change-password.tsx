import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changePassword } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import {
  hasValidationErrors,
  validateChangePassword,
} from "../../utils/validation";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChangePassword = async () => {
    // Validate all fields
    const errors = validateChangePassword(
      oldPassword,
      newPassword,
      confirmPassword
    );
    setValidationErrors(errors);

    // If there are validation errors, don't proceed
    if (hasValidationErrors(errors)) {
      setErrorMessage("Vui lòng kiểm tra lại thông tin đã nhập");
      setShowErrorNotification(true);
      return;
    }

    try {
      setSaving(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setErrorMessage("Không tìm thấy thông tin người dùng");
        setShowErrorNotification(true);
        return;
      }

      const result = await changePassword(Number(userId), {
        oldPassword,
        newPassword,
      });

      setSuccessMessage("Đổi mật khẩu thành công!");
      setShowSuccessNotification(true);

      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setValidationErrors({});

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error changing password:", error);

      // Handle specific error messages
      let errorMsg = "Không thể đổi mật khẩu";
      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "Thông tin không hợp lệ";
      } else if (error.response?.status === 401) {
        errorMsg = "Mật khẩu cũ không đúng";
      } else if (error.response?.status === 404) {
        errorMsg = "Không tìm thấy người dùng";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setShowErrorNotification(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Old Password Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
          <View
            style={[
              styles.passwordContainer,
              validationErrors.oldPassword && styles.passwordContainerError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
                if (validationErrors.oldPassword) {
                  setValidationErrors({
                    ...validationErrors,
                    oldPassword: undefined,
                  });
                }
              }}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showOldPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowOldPassword(!showOldPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {validationErrors.oldPassword && (
            <Text style={styles.errorText}>{validationErrors.oldPassword}</Text>
          )}
        </View>

        {/* New Password Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mật khẩu mới</Text>
          <View
            style={[
              styles.passwordContainer,
              validationErrors.newPassword && styles.passwordContainerError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (validationErrors.newPassword) {
                  setValidationErrors({
                    ...validationErrors,
                    newPassword: undefined,
                  });
                }
                // Clear confirm password error if passwords match
                if (
                  validationErrors.confirmPassword &&
                  text === confirmPassword
                ) {
                  setValidationErrors({
                    ...validationErrors,
                    confirmPassword: undefined,
                  });
                }
              }}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {validationErrors.newPassword && (
            <Text style={styles.errorText}>{validationErrors.newPassword}</Text>
          )}
        </View>

        {/* Confirm Password Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
          <View
            style={[
              styles.passwordContainer,
              validationErrors.confirmPassword && styles.passwordContainerError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (validationErrors.confirmPassword) {
                  setValidationErrors({
                    ...validationErrors,
                    confirmPassword: undefined,
                  });
                }
              }}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {validationErrors.confirmPassword && (
            <Text style={styles.errorText}>
              {validationErrors.confirmPassword}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          onPress={handleChangePassword}
          activeOpacity={0.8}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message={successMessage}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  passwordContainerError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 4,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#111827",
  },
  eyeButton: {
    padding: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
});
