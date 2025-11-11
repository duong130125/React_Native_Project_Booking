import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHotelById } from "../../apis/hotel";
import { Colors } from "../../constants/colors";
import { HotelImage, HotelResponse } from "../../types/hotel";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2; // 2 columns with padding

export default function HotelPhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.hotelId) {
      loadHotelData();
    }
  }, [params.hotelId]);

  const loadHotelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelId = Number(params.hotelId);
      const hotelData = await getHotelById(hotelId);
      console.log("Hotel data loaded:", {
        id: hotelData.id,
        name: hotelData.name,
        imagesCount: hotelData.images?.length || 0,
        images: hotelData.images,
      });
      setHotel(hotelData);
    } catch (err: any) {
      console.error("Error loading hotel data:", err);
      setError(err.message || "Không thể tải hình ảnh khách sạn");
      Alert.alert("Lỗi", err.message || "Không thể tải hình ảnh khách sạn");
    } finally {
      setLoading(false);
    }
  };

  // Get photos from hotel.images from database (hotel_images table)
  // Ưu tiên hotel.images từ database, sau đó fallback
  const photos: (
    | HotelImage
    | { imageUrl: any; id?: number; isPrimary?: boolean }
  )[] = React.useMemo(() => {
    if (hotel?.images && hotel.images.length > 0) {
      const validImages = hotel.images.filter(
        (img) => img && img.imageUrl && img.imageUrl.trim() !== ""
      );
      console.log(
        "Hotel photos from database:",
        validImages.length,
        validImages
      );
      return validImages;
    }

    if (hotel?.imageUrl && hotel.imageUrl.trim() !== "") {
      console.log("Using hotel.imageUrl as fallback");
      return [{ imageUrl: hotel.imageUrl, isPrimary: true, id: 0 }];
    }

    console.log("Using default mock images");
    return [
      { imageUrl: require("../../assets/images/anh6.jpg"), id: 0 },
      { imageUrl: require("../../assets/images/anh5.jpg"), id: 1 },
      { imageUrl: require("../../assets/images/anh3.jpg"), id: 2 },
      { imageUrl: require("../../assets/images/anh4.jpg"), id: 3 },
      { imageUrl: require("../../assets/images/anh1.jpg"), id: 4 },
      { imageUrl: require("../../assets/images/anh2.jpg"), id: 5 },
    ];
  }, [hotel?.images, hotel?.imageUrl]);

  const handleImagePress = (index: number) => {
    if (index < 0 || index >= photos.length) {
      console.warn("Invalid image index:", index);
      return;
    }

    const image = photos[index];
    if (!image || !image.imageUrl) {
      console.warn("Invalid image at index:", index);
      return;
    }

    const imageUrl = typeof image.imageUrl === "string" ? image.imageUrl : null;

    router.push({
      pathname: "/zoom-image",
      params: {
        imageIndex: index.toString(),
        hotelId: params.hotelId?.toString() || "1",
        imageUrl: imageUrl || "",
      },
    } as any);
  };

  const getImageSource = (
    photo:
      | HotelImage
      | { imageUrl: any; id?: number; isPrimary?: boolean }
      | undefined
  ) => {
    if (!photo || !photo.imageUrl) {
      return require("../../assets/images/anh1.jpg");
    }

    if (typeof photo.imageUrl === "string") {
      return { uri: photo.imageUrl };
    }
    return photo.imageUrl;
  };

  // Custom render để tạo layout như trong ảnh
  // Pattern: 2 photos side by side, then 1 wide photo, repeat
  const renderPhotos = () => {
    if (!photos || photos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Chưa có hình ảnh</Text>
        </View>
      );
    }

    const rows = [];
    let i = 0;

    while (i < photos.length) {
      // Step 1: 2 photos side by side
      if (i + 1 < photos.length && photos[i] && photos[i + 1]) {
        // Capture current index values to avoid closure issues
        const index1 = i;
        const index2 = i + 1;

        // Có đủ 2 photos để tạo row
        rows.push(
          <View key={`row-${i}`} style={styles.photoRow}>
            <TouchableOpacity
              style={[
                styles.photoItem,
                { width: PHOTO_SIZE, height: PHOTO_SIZE },
              ]}
              onPress={() => handleImagePress(index1)}
              activeOpacity={0.8}
            >
              <Image
                source={getImageSource(photos[index1])}
                style={styles.photo}
                onError={(error) => {
                  const errorMessage =
                    error?.nativeEvent?.error || "Unknown error";
                  console.warn("Hotel image load error:", errorMessage);
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.photoItem,
                { width: PHOTO_SIZE, height: PHOTO_SIZE },
              ]}
              onPress={() => handleImagePress(index2)}
              activeOpacity={0.8}
            >
              <Image
                source={getImageSource(photos[index2])}
                style={styles.photo}
                onError={(error) => {
                  const errorMessage =
                    error?.nativeEvent?.error || "Unknown error";
                  console.warn("Hotel image load error:", errorMessage);
                }}
              />
            </TouchableOpacity>
          </View>
        );
        i += 2;

        // Step 2: 1 wide photo (nếu còn)
        if (i < photos.length && photos[i]) {
          // Capture current index to avoid closure issues
          const wideIndex = i;
          rows.push(
            <TouchableOpacity
              key={`wide-${i}`}
              style={[styles.photoItem, styles.photoItemWide]}
              onPress={() => handleImagePress(wideIndex)}
              activeOpacity={0.8}
            >
              <Image
                source={getImageSource(photos[wideIndex])}
                style={styles.photoWide}
                onError={(error) => {
                  const errorMessage =
                    error?.nativeEvent?.error || "Unknown error";
                  console.warn("Hotel image load error:", errorMessage);
                }}
              />
            </TouchableOpacity>
          );
          i += 1;
        }
      } else if (i < photos.length && photos[i]) {
        // Capture current index to avoid closure issues
        const singleIndex = i;
        // Chỉ còn 1 photo cuối cùng
        rows.push(
          <TouchableOpacity
            key={`single-${i}`}
            style={[
              styles.photoItem,
              { width: PHOTO_SIZE, height: PHOTO_SIZE },
            ]}
            onPress={() => handleImagePress(singleIndex)}
            activeOpacity={0.8}
          >
            <Image
              source={getImageSource(photos[singleIndex])}
              style={styles.photo}
              onError={(error) => {
                const errorMessage =
                  error?.nativeEvent?.error || "Unknown error";
                console.warn("Hotel image load error:", errorMessage);
              }}
            />
          </TouchableOpacity>
        );
        i += 1;
      } else {
        // Skip invalid entries and break to avoid infinite loop
        break;
      }
    }

    return rows;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHotelData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
