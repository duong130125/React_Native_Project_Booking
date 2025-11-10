import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2; // 2 columns with padding

export default function HotelPhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock photos data
  const photos = [
    require("../assets/images/anh6.jpg"),
    require("../assets/images/anh5.jpg"),
    require("../assets/images/anh3.jpg"),
    require("../assets/images/anh4.jpg"),
    require("../assets/images/anh1.jpg"),
    require("../assets/images/anh2.jpg"),
    require("../assets/images/anh5.jpg"),
    require("../assets/images/anh6.jpg"),
    require("../assets/images/anh4.jpg"),
  ];

  const handleImagePress = (index: number) => {
    router.push({
      pathname: "/zoom-image",
      params: {
        imageIndex: index.toString(),
        hotelId: params.hotelId?.toString() || "1",
      },
    } as any);
  };

  // Custom render để tạo layout như trong ảnh
  // Pattern: 2 photos side by side, then 1 wide photo, repeat
  const renderPhotos = () => {
    const rows = [];
    let i = 0;

    while (i < photos.length) {
      // Step 1: 2 photos side by side
      if (i + 1 < photos.length) {
        // Có đủ 2 photos để tạo row
        rows.push(
          <View key={`row-${i}`} style={styles.photoRow}>
            <TouchableOpacity
              style={[
                styles.photoItem,
                { width: PHOTO_SIZE, height: PHOTO_SIZE },
              ]}
              onPress={() => handleImagePress(i)}
              activeOpacity={0.8}
            >
              <Image source={photos[i]} style={styles.photo} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.photoItem,
                { width: PHOTO_SIZE, height: PHOTO_SIZE },
              ]}
              onPress={() => handleImagePress(i + 1)}
              activeOpacity={0.8}
            >
              <Image source={photos[i + 1]} style={styles.photo} />
            </TouchableOpacity>
          </View>
        );
        i += 2;

        // Step 2: 1 wide photo (nếu còn)
        if (i < photos.length) {
          rows.push(
            <TouchableOpacity
              key={`wide-${i}`}
              style={[styles.photoItem, styles.photoItemWide]}
              onPress={() => handleImagePress(i)}
              activeOpacity={0.8}
            >
              <Image source={photos[i]} style={styles.photoWide} />
            </TouchableOpacity>
          );
          i += 1;
        }
      } else if (i < photos.length) {
        // Chỉ còn 1 photo cuối cùng
        rows.push(
          <TouchableOpacity
            key={`single-${i}`}
            style={[
              styles.photoItem,
              { width: PHOTO_SIZE, height: PHOTO_SIZE },
            ]}
            onPress={() => handleImagePress(i)}
            activeOpacity={0.8}
          >
            <Image source={photos[i]} style={styles.photo} />
          </TouchableOpacity>
        );
        i += 1;
      }
    }

    return rows;
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
        <Text style={styles.headerTitle}>Photos</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Photos Grid */}
      <ScrollView
        contentContainerStyle={styles.photosContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderPhotos()}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
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
  photosContainer: {
    padding: 16,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  photoItem: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  photoItemWide: {
    width: "100%",
    height: 220,
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoWide: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
