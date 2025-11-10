import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Get user data from AsyncStorage
  const [userData, setUserData] = useState({
    fullName: "Curtis Weaver",
    email: "curtis.weaver@example.com",
    avatar: require("../../assets/images/anh1.jpg"),
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const fullName = await AsyncStorage.getItem("fullName");
        const email = await AsyncStorage.getItem("email");
        if (fullName) setUserData((prev) => ({ ...prev, fullName }));
        if (email) setUserData((prev) => ({ ...prev, email }));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

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
      onPress: () => router.push("/forgot-password" as any),
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/auth" as any);
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
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image source={userData.avatar} style={styles.profileImage} />
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
});
