import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getReviewsByHotel } from "../../apis/review";
import { getRoomsByHotel } from "../../apis/room";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { HotelResponse, ReviewResponse, RoomResponse } from "../../types/hotel";
import { convertHotelResponseToHotel } from "../../utils/hotelUtils";

const { width } = Dimensions.get("window");

export default function HotelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.hotelId) {
      loadHotelData();
      loadFavoriteStatus();
    }
  }, [params.hotelId]);

  const loadHotelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelId = Number(params.hotelId);

      // Load hotel, rooms, và reviews song song
      const [hotelData, roomsData, reviewsData] = await Promise.all([
        getHotelById(hotelId),
        getRoomsByHotel(hotelId, 0, 10),
        getReviewsByHotel(hotelId, 0, 10),
      ]);

      setHotel(hotelData);
      setRooms(roomsData.content);
      setReviews(reviewsData.content);
    } catch (err: any) {
      console.error("Error loading hotel data:", err);
      setError(err.message || "Không thể tải thông tin khách sạn");
      Alert.alert("Lỗi", err.message || "Không thể tải thông tin khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favoriteList = JSON.parse(favorites);
        setIsFavorite(favoriteList.includes(Number(params.hotelId)));
      }
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const hotelId = Number(params.hotelId);
      const favorites = await AsyncStorage.getItem("favorites");
      const favoriteList = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favoriteList.filter(
          (id: number) => id !== hotelId
        );
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites)
        );

        // Remove from bookmarks
        const bookmarks = await AsyncStorage.getItem("bookmarks");
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          const updatedBookmarks = bookmarkList.filter(
            (b: any) => b.hotelId !== hotelId.toString()
          );
          await AsyncStorage.setItem(
            "bookmarks",
            JSON.stringify(updatedBookmarks)
          );
        }
        setIsFavorite(false);
      } else {
        // Add to favorites
        const updatedFavorites = [...favoriteList, hotelId];
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites)
        );

        // Add to bookmarks
        if (hotel) {
          const bookmark = {
            id: Date.now().toString(),
            hotelId: hotelId.toString(),
            hotelName: hotel.name,
            location: hotel.city || hotel.address || "",
            rating: hotel.averageRating || 0,
            reviews: hotel.reviewCount || 0,
            price: rooms.length > 0 ? Number(rooms[0].price) : 0,
            image: require("../../assets/images/image-booking.png"),
            savedAt: "Today",
          };

          const bookmarks = await AsyncStorage.getItem("bookmarks");
          const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
          bookmarkList.unshift(bookmark);
          await AsyncStorage.setItem("bookmarks", JSON.stringify(bookmarkList));

          // Create notification
          const notification = {
            id: Date.now().toString(),
            type: "bookmark",
            title: `You Saved "${hotel.name}"`,
            description: "Your just bookmarked",
            date: "Today",
            image: require("../../assets/images/image-booking.png"),
            createdAt: new Date().toISOString(),
          };

          const notifications = await AsyncStorage.getItem("notifications");
          const notificationList = notifications
            ? JSON.parse(notifications)
            : [];
          notificationList.unshift(notification);
          await AsyncStorage.setItem(
            "notifications",
            JSON.stringify(notificationList)
          );
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Convert hotel data for display
  const hotelDisplay = hotel
    ? convertHotelResponseToHotel(
        hotel,
        require("../../assets/images/image-booking.png")
      )
    : null;

  // Get hotel photos - ưu tiên hotel.images từ database, sau đó hotel.imageUrl, cuối cùng từ room images
  const hotelPhotos = (() => {
    const photos: any[] = [];

    // Thêm hotel.images từ database (ưu tiên cao nhất)
    if (hotel && hotel.images && hotel.images.length > 0) {
      hotel.images.forEach((img) => {
        if (img && img.imageUrl && img.imageUrl.trim() !== "") {
          photos.push({ uri: img.imageUrl });
        }
      });
    }

    // Thêm hotel imageUrl nếu có và chưa có trong photos
    if (hotel && hotel.imageUrl && hotel.imageUrl.trim() !== "") {
      if (!photos.some((p) => p.uri === hotel.imageUrl)) {
        photos.push({ uri: hotel.imageUrl });
      }
    }

    // Thêm room images nếu hotel images chưa đủ
    if (photos.length === 0 && rooms && rooms.length > 0) {
      rooms.forEach((room) => {
        if (room && room.images && room.images.length > 0) {
          room.images.forEach((img) => {
            if (
              img &&
              img.imageUrl &&
              !photos.some((p) => p.uri === img.imageUrl)
            ) {
              photos.push({ uri: img.imageUrl });
            }
          });
        }
      });
    }

    // Nếu không có ảnh nào, dùng default
    return photos.length > 0
      ? photos
      : [require("../../assets/images/image-booking.png")];
  })();

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? "star" : "star-outline"}
          size={16}
          color="#FFB800"
        />
      );
    }
    return stars;
  };

  const handleViewPhotos = () => {
    if (hotel) {
      router.push({
        pathname: "/hotel-photos",
        params: { hotelId: hotel.id.toString() },
      } as any);
    }
  };

  const handleImagePress = (index: number) => {
    if (hotel && hotelPhotos && hotelPhotos[index]) {
      const photo = hotelPhotos[index];
      const imageUrl = photo.uri || (typeof photo === "string" ? photo : null);

      router.push({
        pathname: "/zoom-image",
        params: {
          imageUrl: imageUrl || "",
          imageIndex: index.toString(),
          hotelId: hotel.id.toString(),
        },
      } as any);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !hotel || !hotelDisplay) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Không tìm thấy thông tin khách sạn"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHotelData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(0)}
          >
            <Image
              source={
                hotelPhotos && hotelPhotos[0]
                  ? hotelPhotos[0]
                  : hotel && hotel.imageUrl && hotel.imageUrl.trim() !== ""
                  ? { uri: hotel.imageUrl }
                  : hotelDisplay?.image ||
                    require("../../assets/images/image-booking.png")
              }
              style={styles.mainImage}
              defaultSource={require("../../assets/images/image-booking.png")}
              onError={(error) => {
                console.warn("Image load error:", error);
              }}
            />
          </TouchableOpacity>

          {/* Header Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <View style={styles.iconBackground}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleFavorite}
              >
                <View style={styles.iconBackground}>
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite ? "#EF4444" : "#FFFFFF"}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.iconBackground}>
                  <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Rating and Title */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(hotelDisplay.rating)}
            </View>
            <Text style={styles.ratingText}>
              {hotelDisplay.rating.toFixed(1)} ({hotelDisplay.reviews} Reviews)
            </Text>
          </View>

          <Text style={styles.hotelName}>{hotelDisplay.name}</Text>
          <Text style={styles.location}>{hotelDisplay.location}</Text>

          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>
              {hotel.description || hotelDisplay.overview || "Không có mô tả"}
            </Text>
          </View>

          {/* Reviews Link */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => {
              router.push({
                pathname: "/reviews",
                params: { hotelId: hotel.id.toString() },
              } as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(hotelDisplay.rating)}
              </View>
              <Text style={styles.ratingText}>
                {hotelDisplay.rating.toFixed(1)} ({hotelDisplay.reviews}{" "}
                Reviews)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Photos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity onPress={handleViewPhotos}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {hotelPhotos.slice(0, 3).map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImagePress(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={
                      typeof photo === "object" && "uri" in photo
                        ? { uri: photo.uri }
                        : photo
                    }
                    style={styles.photoThumbnail}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rooms Section */}
          {rooms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Phòng có sẵn</Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/rooms-list",
                      params: { hotelId: hotel.id.toString() },
                    } as any);
                  }}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roomsScroll}
              >
                {rooms.slice(0, 3).map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={styles.roomCard}
                    onPress={() => {
                      router.push({
                        pathname: "/room-detail",
                        params: {
                          hotelId: hotel.id.toString(),
                          roomId: room.id.toString(),
                        },
                      } as any);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={
                        room.images &&
                        room.images.length > 0 &&
                        room.images[0]?.imageUrl
                          ? { uri: room.images[0].imageUrl }
                          : require("../../assets/images/anh1.jpg")
                      }
                      style={styles.roomImage}
                      defaultSource={require("../../assets/images/anh1.jpg")}
                      onError={(error) => {
                        console.warn("Room image load error:", error);
                      }}
                    />
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>
                        {room.roomType?.name || "Phòng tiêu chuẩn"}
                      </Text>
                      <View style={styles.roomDetails}>
                        <Ionicons
                          name="people-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.roomDetailText}>
                          {String(room.capacity || 2)} người
                        </Text>
                        <Ionicons
                          name="square-outline"
                          size={14}
                          color="#6B7280"
                          style={styles.roomDetailIcon}
                        />
                        <Text style={styles.roomDetailText}>
                          {String(room.roomSize || 25)}m²
                        </Text>
                      </View>
                      <Text style={styles.roomPrice}>
                        ${Number(room.price).toLocaleString()}/đêm
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Features */}
          <View style={styles.section}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="sparkles-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Enhanced Clean</Text>
                <Text style={styles.featureDescription}>
                  This host committed to Airbnb's clone 5-step enhanced cleaning
                  process.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="location-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Great Location</Text>
                <Text style={styles.featureDescription}>
                  95% of recent guests give the location a 5-star rating.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="thumbs-up-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Great check-in experience
                </Text>
                <Text style={styles.featureDescription}>
                  90% of recent guests gave the check-in process a 5-star
                  rating.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Free cancellation</Text>
                <Text style={styles.featureDescription}>
                  Free cancellation until 2:00 PM on 8 May.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar - Removed price and select date */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  iconButton: {
    marginHorizontal: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcons: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    padding: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  photosScroll: {
    gap: 12,
    paddingRight: 20,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  hostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hostInfo: {
    flex: 1,
    marginRight: 12,
  },
  hostText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  hostDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  roomsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  roomCard: {
    width: width * 0.7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  roomInfo: {
    padding: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  roomDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  roomDetailIcon: {
    marginLeft: 8,
  },
  roomDetailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.md,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
  },
});
