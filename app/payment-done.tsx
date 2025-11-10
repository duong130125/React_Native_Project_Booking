import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentDoneScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.replace("/(tabs)/homepage" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color="#4F46E5" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payment Received Successfully</Text>
        <Text style={styles.subtitle}>
          Congratulations 🎉 Your booking has been confirmed
        </Text>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleBackToHome}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

