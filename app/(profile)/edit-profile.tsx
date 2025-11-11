import { Ionicons } from "@expo/vector-icons";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserById, updateUserProfile } from "../../apis/auth";
import { UserResponse, UserUpdateRequest } from "../../types/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

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
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!dateOfBirth) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày sinh");
      return;
    }

    try {
      setSaving(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      const updateRequest: UserUpdateRequest = {
        fullName: name.trim(),
        email: email.trim(),
        phoneNumber: mobileNumber.trim() || undefined,
        birthday: dateOfBirth.toISOString().split("T")[0],
        gender: gender,
      };

      const updatedUser = await updateUserProfile(Number(userId), updateRequest);
      
      // Cập nhật AsyncStorage
      await AsyncStorage.setItem("fullName", updatedUser.fullName);
      await AsyncStorage.setItem("email", updatedUser.email);
      if (updatedUser.phoneNumber) {
        await AsyncStorage.setItem("phoneNumber", updatedUser.phoneNumber);
      }

      Alert.alert("Thành công", "Cập nhật thông tin thành công");
      router.back();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
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
            source={require("../../assets/images/anh3.jpg")}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => {
              // Handle image picker
              Alert.alert("Change Photo", "Image picker functionality");
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Name Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Mobile Number Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={(text) => setMobileNumber(formatPhoneNumber(text))}
            placeholder="(000) 000-0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            maxLength={14}
          />
        </View>

        {/* Date of Birth Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateInputText}>{formatDate(dateOfBirth)}</Text>
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
                }
              }}
              maximumDate={new Date()}
            />
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
              ]}
              onPress={() => setGender("MALE")}
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
              ]}
              onPress={() => setGender("FEMALE")}
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
              ]}
              onPress={() => setGender("OTHER")}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {gender === "OTHER" && (
                  <View style={styles.radioButtonInner} />
                )}
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
