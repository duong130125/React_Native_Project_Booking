import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  type: "message" | "bookmark" | "promotion" | "password" | "booking";
  title: string;
  description: string;
  date: string;
  image?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const [todayNotifications, setTodayNotifications] = useState<Notification[]>(
    []
  );
  const [yesterdayNotifications, setYesterdayNotifications] = useState<
    Notification[]
  >([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Load from AsyncStorage
      const notifications = await AsyncStorage.getItem("notifications");
      const notificationList: Notification[] = notifications
        ? JSON.parse(notifications)
        : [];

      // Default notifications if empty
      if (notificationList.length === 0) {
        const defaultNotifications: Notification[] = [
          {
            id: "1",
            type: "message",
            title: "You have 4 new message",
            description: "Jayant agent shared a message",
            date: "Today",
            icon: "chatbubble-outline",
            iconColor: "#FFFFFF",
            iconBgColor: "#4F46E5",
          },
          {
            id: "2",
            type: "bookmark",
            title: 'You Saved "Malon Greens"',
            description: "Your just bookmarked",
            date: "Today",
            image: require("../../assets/images/anh1.jpg"),
          },
          {
            id: "3",
            type: "promotion",
            title: "Get 30% Off on first booking",
            description: "Special promotion only valid today",
            date: "Yesterday",
            icon: "pricetag-outline",
            iconColor: "#FFFFFF",
            iconBgColor: "#4F46E5",
          },
          {
            id: "4",
            type: "password",
            title: "Password Update Successful",
            description: "Your password update successfully",
            date: "Yesterday",
            icon: "lock-closed-outline",
            iconColor: "#FFFFFF",
            iconBgColor: "#4F46E5",
          },
          {
            id: "5",
            type: "bookmark",
            title: 'You Saved "Peradise Mint"',
            description: "Your just bookmarked",
            date: "Yesterday",
            image: require("../../assets/images/anh3.jpg"),
          },
        ];
        await AsyncStorage.setItem(
          "notifications",
          JSON.stringify(defaultNotifications)
        );
        notificationList.push(...defaultNotifications);
      }

      // Separate by date
      const today = notificationList.filter((n) => n.date === "Today");
      const yesterday = notificationList.filter((n) => n.date === "Yesterday");

      setTodayNotifications(today);
      setYesterdayNotifications(yesterday);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.type === "bookmark") {
      // Navigate to hotel detail if needed
      // For now, just show notification
      console.log("Bookmark notification clicked");
    } else if (notification.type === "message") {
      // Navigate to messages screen
      console.log("Navigate to messages");
    } else if (notification.type === "promotion") {
      router.push("/(tabs)/discounts" as any);
    } else if (notification.type === "booking") {
      router.push("/(tabs)/orders" as any);
    }
  };

  const renderNotificationCard = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={styles.notificationCard}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        {notification.image ? (
          <Image source={notification.image} style={styles.notificationImage} />
        ) : (
          <View
            style={[
              styles.notificationIconContainer,
              { backgroundColor: notification.iconBgColor || "#4F46E5" },
            ]}
          >
            <Ionicons
              name={notification.icon || "notifications-outline"}
              size={24}
              color={notification.iconColor || "#FFFFFF"}
            />
          </View>
        )}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationDescription}>
          {notification.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayNotifications.map((notification) =>
              renderNotificationCard(notification)
            )}
          </View>
        )}

        {/* Yesterday Section */}
        {yesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            {yesterdayNotifications.map((notification) =>
              renderNotificationCard(notification)
            )}
          </View>
        )}

        {/* Empty State */}
        {todayNotifications.length === 0 &&
          yesterdayNotifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>No notifications</Text>
            </View>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationLeft: {
    marginRight: 16,
  },
  notificationImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  notificationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
});
