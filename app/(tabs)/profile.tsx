import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserById } from "../../apis/auth";
import { UserResponse } from "../../types/auth";
import { clearAllTokens } from "../../utils/clearToken";

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserResponse | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Thử lấy userId từ AsyncStorage
      let userId = await AsyncStorage.getItem("userId");
      console.log("🔍 Profile - userId from AsyncStorage:", userId);

      // Nếu không có userId, thử lấy từ user object
      if (!userId) {
        const userDataStr = await AsyncStorage.getItem("user");
        console.log("🔍 Profile - user object from AsyncStorage:", userDataStr);
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            if (userData.id) {
              userId = userData.id.toString();
              console.log("🔍 Profile - userId from user object:", userId);
              // Lưu lại userId để lần sau dễ truy cập
              if (userId) {
                await AsyncStorage.setItem("userId", userId);
              }
            }
          } catch (e) {
            console.error("❌ Error parsing user data:", e);
          }
        }
      }

      // Nếu vẫn không có userId, thử lấy từ email và dùng getUserByEmail
      if (!userId) {
        const email = await AsyncStorage.getItem("email");
        console.log("🔍 Profile - email from AsyncStorage:", email);
        if (email) {
          try {
            // Thử dùng getUserByEmail
            const { getUserByEmail } = await import("../../apis/auth");
            const user = await getUserByEmail(email);
            if (user && user.id) {
              userId = user.id.toString();
              await AsyncStorage.setItem("userId", userId);
              setUserData(user);
              await AsyncStorage.setItem("fullName", user.fullName);
              await AsyncStorage.setItem("email", user.email);
              if (user.phoneNumber) {
                await AsyncStorage.setItem("phoneNumber", user.phoneNumber);
              }
              return; // Thành công, return sớm
            }
          } catch (emailError: any) {
            console.error("❌ Error getting user by email:", emailError);
          }
        }

        // Nếu vẫn không có userId sau tất cả các cách
        Alert.alert(
          "Lỗi",
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/auth" as any),
            },
          ]
        );
        return;
      }

      console.log("🔍 Profile - Calling getUserById with userId:", userId);
      const user = await getUserById(Number(userId));
      console.log("✅ Profile - User data loaded:", user);

      setUserData(user);

      // Lưu vào AsyncStorage để sử dụng sau
      await AsyncStorage.setItem("userId", userId); // Đảm bảo userId được lưu
      await AsyncStorage.setItem("fullName", user.fullName);
      await AsyncStorage.setItem("email", user.email);
      if (user.phoneNumber) {
        await AsyncStorage.setItem("phoneNumber", user.phoneNumber);
      }
    } catch (error: any) {
      console.error("❌ Error loading user data:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Không thể tải thông tin người dùng";

      if (error.response) {
        // API error
        const status = error.response.status;
        if (status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy thông tin người dùng.";
        } else if (status === 403) {
          errorMessage = "Bạn không có quyền truy cập thông tin này.";
        } else {
          errorMessage =
            error.response.data?.message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      Alert.alert("Lỗi", errorMessage, [
        {
          text: "Thử lại",
          onPress: loadUserData,
        },
        {
          text: "Đăng nhập lại",
          onPress: async () => {
            await clearAllTokens();
            await AsyncStorage.removeItem("userId");
            router.replace("/auth" as any);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "edit",
      title: "Edit Profile",
      icon: "create-outline",
      onPress: () => router.push("/edit-profile" as any),
    },
    {
      id: "password",
      title: "Change Password",
      icon: "key-outline",
      onPress: () => router.push("/change-password" as any),
    },
    {
      id: "payment",
      title: "Payment Method",
      icon: "card-outline",
      onPress: () => router.push("/add-new-card" as any),
    },
    {
      id: "bookings",
      title: "My Bookings",
      icon: "document-text-outline",
      onPress: () => router.push("/(tabs)/orders" as any),
    },
    {
      id: "darkmode",
      title: "Dark Mode",
      icon: "moon-outline",
      onPress: () => {},
      hasToggle: true,
      toggleValue: darkMode,
      onToggleChange: setDarkMode,
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: "checkmark-circle-outline",
      onPress: () => router.push("/privacy-policy" as any),
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      icon: "document-outline",
      onPress: () => router.push("/terms-conditions" as any),
    },
  ];

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Xóa tất cả tokens và user data
            await clearAllTokens();
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("fullName");
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("phoneNumber");
            router.replace("/auth" as any);
          } catch (error) {
            console.error("Error during logout:", error);
            // Vẫn chuyển về auth screen dù có lỗi
            router.replace("/auth" as any);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          </View>
        ) : userData ? (
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              {userData.avatarUrl && userData.avatarUrl.trim() !== "" ? (
                <Image
                  source={{ uri: userData.avatarUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData.fullName}</Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/edit-profile" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>
              {error || "Không tải được thông tin"}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={async () => {
                await clearAllTokens();
                await AsyncStorage.removeItem("userId");
                router.replace("/auth" as any);
              }}
            >
              <Text style={styles.loginButtonText}>Đăng nhập lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={item.hasToggle}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="#111827"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.hasToggle ? (
                <Switch
                  value={item.toggleValue}
                  onValueChange={item.onToggleChange}
                  trackColor={{ false: "#D1D5DB", true: "#4F46E5" }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  profileCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  logoutButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
