import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserById, updateUserProfile, uploadAvatar } from "../../apis/auth";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { UserResponse, UserUpdateRequest } from "../../types/auth";
import {
  hasValidationErrors,
  validateBirthday,
  validateEmail,
  validateFullName,
  validateGender,
  validatePhoneNumber,
} from "../../utils/validation";

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    birthday?: string;
    gender?: string;
  }>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        router.back();
        return;
      }

      const user = await getUserById(Number(userId));
      setUserData(user);
      setName(user.fullName);
      setEmail(user.email);
      setMobileNumber(user.phoneNumber || "");
      if (user.birthday) {
        setDateOfBirth(new Date(user.birthday));
      }
      if (user.genderName) {
        setGender(user.genderName);
      }
      if (user.avatarUrl) {
        setAvatarUri(user.avatarUrl);
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

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

  // Get cleaned phone number (remove formatting)
  const getCleanedPhoneNumber = (formatted: string): string => {
    return formatted.replace(/\D/g, "");
  };

  // Request permissions for image picker
  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn avatar"
      );
      return false;
    }
    return true;
  };

  // Handle image picker
  const handleImagePicker = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    Alert.alert("Chọn ảnh đại diện", "Bạn muốn chọn ảnh từ đâu?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Thư viện ảnh",
        onPress: async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              const selectedImage = result.assets[0];
              setAvatarUri(selectedImage.uri);
              await handleUploadAvatar(selectedImage.uri);
            }
          } catch (error: any) {
            console.error("Error picking image:", error);
            setErrorMessage("Không thể chọn ảnh");
            setShowErrorNotification(true);
          }
        },
      },
      {
        text: "Camera",
        onPress: async () => {
          try {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert(
                "Quyền truy cập",
                "Cần quyền truy cập camera để chụp ảnh"
              );
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              const selectedImage = result.assets[0];
              setAvatarUri(selectedImage.uri);
              await handleUploadAvatar(selectedImage.uri);
            }
          } catch (error: any) {
            console.error("Error taking photo:", error);
            setErrorMessage("Không thể chụp ảnh");
            setShowErrorNotification(true);
          }
        },
      },
    ]);
  };

  // Handle upload avatar
  const handleUploadAvatar = async (imageUri: string) => {
    try {
      setUploadingAvatar(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setErrorMessage("Không tìm thấy thông tin người dùng");
        setShowErrorNotification(true);
        return;
      }

      const updatedUser = await uploadAvatar(Number(userId), imageUri);

      // Cập nhật avatar URL
      setAvatarUri(updatedUser.avatarUrl || null);
      setUserData(updatedUser);

      setSuccessMessage("Cập nhật avatar thành công!");
      setShowSuccessNotification(true);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);

      let errorMsg = "Không thể upload avatar";
      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "File không hợp lệ";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setShowErrorNotification(true);

      // Revert to old avatar if upload fails
      if (userData?.avatarUrl) {
        setAvatarUri(userData.avatarUrl);
      } else {
        setAvatarUri(null);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Chọn ngày sinh";
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleUpdate = async () => {
    // Validate all fields
    const cleanedPhone = getCleanedPhoneNumber(mobileNumber);
    const birthdayString = dateOfBirth
      ? dateOfBirth.toISOString().split("T")[0]
      : "";

    const errors: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      birthday?: string;
      gender?: string;
    } = {};

    const fullNameError = validateFullName(name);
    if (fullNameError) errors.fullName = fullNameError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    // Phone number is optional, but if provided, must be valid
    if (cleanedPhone && cleanedPhone.trim() !== "") {
      const phoneError = validatePhoneNumber(cleanedPhone);
      if (phoneError) errors.phoneNumber = phoneError;
    }

    const birthdayError = validateBirthday(birthdayString);
    if (birthdayError) errors.birthday = birthdayError;

    const genderError = validateGender(gender);
    if (genderError) errors.gender = genderError;

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

      const updateRequest: UserUpdateRequest = {
        fullName: name.trim(),
        email: email.trim(),
        phoneNumber:
          cleanedPhone && cleanedPhone.trim() !== "" ? cleanedPhone : undefined,
        birthday: birthdayString,
        genderName: gender,
      };

      const updatedUser = await updateUserProfile(
        Number(userId),
        updateRequest
      );

      // Cập nhật AsyncStorage
      await AsyncStorage.setItem("fullName", updatedUser.fullName);
      await AsyncStorage.setItem("email", updatedUser.email);
      if (updatedUser.phoneNumber) {
        await AsyncStorage.setItem("phoneNumber", updatedUser.phoneNumber);
      }

      setSuccessMessage("Cập nhật thông tin thành công!");
      setShowSuccessNotification(true);

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Handle specific error messages
      let errorMsg = "Không thể cập nhật thông tin";
      if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "Thông tin không hợp lệ";
      } else if (error.response?.status === 404) {
        errorMsg = "Không tìm thấy người dùng";
      } else if (error.response?.status === 409) {
        errorMsg = "Email đã được sử dụng bởi tài khoản khác";
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("../../assets/images/anh3.jpg")
            }
            style={styles.profileImage}
            defaultSource={require("../../assets/images/anh3.jpg")}
          />
          {uploadingAvatar && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.cameraButton,
              uploadingAvatar && styles.cameraButtonDisabled,
            ]}
            onPress={handleImagePicker}
            activeOpacity={0.8}
            disabled={uploadingAvatar || loading}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Name Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.fullName && styles.inputError,
            ]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (validationErrors.fullName) {
                setValidationErrors({
                  ...validationErrors,
                  fullName: undefined,
                });
              }
            }}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
          {validationErrors.fullName && (
            <Text style={styles.errorText}>{validationErrors.fullName}</Text>
          )}
        </View>

        {/* Email Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.input, validationErrors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: undefined });
              }
            }}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {validationErrors.email && (
            <Text style={styles.errorText}>{validationErrors.email}</Text>
          )}
        </View>

        {/* Mobile Number Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mobile Number (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.phoneNumber && styles.inputError,
            ]}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(formatPhoneNumber(text));
              if (validationErrors.phoneNumber) {
                setValidationErrors({
                  ...validationErrors,
                  phoneNumber: undefined,
                });
              }
            }}
            placeholder="(000) 000-0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            maxLength={14}
          />
          {validationErrors.phoneNumber && (
            <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>
          )}
        </View>

        {/* Date of Birth Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              validationErrors.birthday && styles.inputError,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dateInputText,
                !dateOfBirth && styles.placeholderText,
              ]}
            >
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                  if (validationErrors.birthday) {
                    setValidationErrors({
                      ...validationErrors,
                      birthday: undefined,
                    });
                  }
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
          {validationErrors.birthday && (
            <Text style={styles.errorText}>{validationErrors.birthday}</Text>
          )}
        </View>

        {/* Gender Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === "MALE" && styles.genderOptionActive,
                validationErrors.gender && styles.genderOptionError,
              ]}
              onPress={() => {
                setGender("MALE");
                if (validationErrors.gender) {
                  setValidationErrors({
                    ...validationErrors,
                    gender: undefined,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {gender === "MALE" && <View style={styles.radioButtonInner} />}
              </View>
              <Text
                style={[
                  styles.genderText,
                  gender === "MALE" && styles.genderTextActive,
                ]}
              >
                Nam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === "FEMALE" && styles.genderOptionActive,
                validationErrors.gender && styles.genderOptionError,
              ]}
              onPress={() => {
                setGender("FEMALE");
                if (validationErrors.gender) {
                  setValidationErrors({
                    ...validationErrors,
                    gender: undefined,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {gender === "FEMALE" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.genderText,
                  gender === "FEMALE" && styles.genderTextActive,
                ]}
              >
                Nữ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === "OTHER" && styles.genderOptionActive,
                validationErrors.gender && styles.genderOptionError,
              ]}
              onPress={() => {
                setGender("OTHER");
                if (validationErrors.gender) {
                  setValidationErrors({
                    ...validationErrors,
                    gender: undefined,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {gender === "OTHER" && <View style={styles.radioButtonInner} />}
              </View>
              <Text
                style={[
                  styles.genderText,
                  gender === "OTHER" && styles.genderTextActive,
                ]}
              >
                Khác
              </Text>
            </TouchableOpacity>
          </View>
          {validationErrors.gender && (
            <Text style={styles.errorText}>{validationErrors.gender}</Text>
          )}
        </View>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật</Text>
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
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#E5E7EB",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cameraButtonDisabled: {
    opacity: 0.5,
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
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 4,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    fontSize: 16,
    color: "#111827",
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
  genderContainer: {
    flexDirection: "row",
    gap: 16,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  genderOptionActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  genderOptionError: {
    borderColor: "#DC2626",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
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
  },
  genderTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
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
