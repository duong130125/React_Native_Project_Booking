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
import { getRoomById } from "../../apis/room";
import { Colors } from "../../constants/colors";
import { HotelResponse, RoomResponse } from "../../types/hotel";

const { width } = Dimensions.get("window");

export default function RoomDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.roomId) {
      loadRoomData();
    }
  }, [params.roomId]);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomId = Number(params.roomId);

      const roomData = await getRoomById(roomId);
      console.log("Room data loaded:", {
        id: roomData.id,
        roomNumber: roomData.roomNumber,
        imagesCount: roomData.images?.length || 0,
        images: roomData.images?.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          isValid:
            img.imageUrl &&
            !img.imageUrl.includes("example.com") &&
            img.imageUrl.trim() !== "",
        })),
        validImagesCount:
          roomData.images?.filter(
            (img) =>
              img &&
              img.imageUrl &&
              !img.imageUrl.includes("example.com") &&
              img.imageUrl.trim() !== ""
          ).length || 0,
      });
      setRoom(roomData);

      // Nếu có hotelId từ params, load hotel info
      if (params.hotelId) {
        const hotelId = Number(params.hotelId);
        const hotelData = await getHotelById(hotelId);
        setHotel(hotelData);
      } else if (roomData.hotel?.id) {
        // Nếu không có hotelId từ params nhưng room có hotel info
        const hotelData = await getHotelById(roomData.hotel.id);
        setHotel(hotelData);
      }
    } catch (err: any) {
      console.error("Error loading room data:", err);
      setError(err.message || "Không thể tải thông tin phòng");
      Alert.alert("Lỗi", err.message || "Không thể tải thông tin phòng");
    } finally {
      setLoading(false);
    }
  };

  // Get images from room.images from database (room_images table)
  // Ưu tiên room.images từ database, sau đó fallback
  // MUST be called before early returns (Rules of Hooks)
  const images = React.useMemo(() => {
    // Ưu tiên room.images từ database
    if (room?.images && room.images.length > 0) {
      // Filter out any invalid images (null, empty, or example.com URLs)
      const validImages = room.images.filter(
        (img) =>
          img &&
          img.imageUrl &&
          img.imageUrl.trim() !== "" &&
          !img.imageUrl.includes("example.com") // Filter out example.com URLs
      );
      if (validImages.length > 0) {
        console.log(
          "Room images from database:",
          validImages.length,
          validImages.map((img) => img.imageUrl)
        );
        return validImages;
      } else {
        console.log(
          "Room images filtered out (all invalid or example.com URLs)"
        );
      }
    }

    // Fallback to hotel image if available
    if (hotel?.imageUrl || room?.hotel?.imageUrl) {
      const hotelImageUrl = hotel?.imageUrl || room?.hotel?.imageUrl;
      console.log("Using hotel image as fallback");
      return [
        {
          id: 0,
          imageUrl: hotelImageUrl,
          isPrimary: true,
        },
      ];
    }

    // Final fallback to default image
    console.log("Using default image");
    return [
      {
        id: 0,
        imageUrl: require("../../assets/images/anh1.jpg"),
        isPrimary: true,
      },
    ];
  }, [room?.images, hotel?.imageUrl, room?.hotel?.imageUrl]);

  // Mapping từ tên icon trong database sang tên icon hợp lệ của Ionicons
  const getValidIconName = (iconName: string | undefined | null): string => {
    if (!iconName || iconName.trim() === "") {
      return "checkmark-circle";
    }

    // Mapping các tên icon phổ biến
    const iconMapping: Record<string, string> = {
      // Air conditioning
      ac: "snow-outline",
      "air-conditioning": "snow-outline",
      "air conditioning": "snow-outline",
      // Pool
      pool: "water-outline",
      swimming: "water-outline",
      "swimming-pool": "water-outline",
      // Breakfast
      breakfast: "restaurant",
      "restaurant-outline": "restaurant",
      // WiFi
      wifi: "wifi-outline",
      "free-wifi": "wifi-outline",
      // TV
      tv: "tv-outline",
      television: "tv-outline",
      // Parking
      parking: "car-outline",
      "free-parking": "car-outline",
      // Gym
      gym: "fitness-outline",
      fitness: "fitness-outline",
      // Spa
      spa: "flower-outline",
      // Restaurant
      restaurant: "restaurant-outline",
      // Bar
      bar: "wine-outline",
      // Laundry
      laundry: "shirt-outline",
      "laundry-service": "shirt-outline",
      // Room service
      "room-service": "call-outline",
      "room service": "call-outline",
      // Pet friendly
      "pet-friendly": "paw-outline",
      "pet friendly": "paw-outline",
      pets: "paw-outline",
      // Elevator
      elevator: "arrow-up-outline",
      lift: "arrow-up-outline",
      // Business center
      "business-center": "briefcase-outline",
      "business center": "briefcase-outline",
      // Conference room
      "conference-room": "people-outline",
      "conference room": "people-outline",
      // Airport shuttle
      "airport-shuttle": "airplane-outline",
      "airport shuttle": "airplane-outline",
      // Beach access
      "beach-access": "beach-outline",
      "beach access": "beach-outline",
      // Hot tub
      "hot-tub": "water-outline",
      "hot tub": "water-outline",
      jacuzzi: "water-outline",
      // Balcony
      balcony: "home-outline",
      // Kitchen
      kitchen: "restaurant-outline",
      "full-kitchen": "restaurant-outline",
      // Safe
      safe: "lock-closed-outline",
      "in-room-safe": "lock-closed-outline",
      // Minibar
      minibar: "wine-outline",
      "mini-bar": "wine-outline",
      // Smoking
      smoking: "flame-outline",
      "non-smoking": "ban-outline",
      "non smoking": "ban-outline",
    };

    // Chuyển về lowercase và trim để so sánh
    const normalizedIcon = iconName.toLowerCase().trim();

    // Kiểm tra trong mapping trước
    if (iconMapping[normalizedIcon]) {
      return iconMapping[normalizedIcon];
    }

    // Nếu icon name đã có suffix "-outline", "-sharp", hoặc "-filled",
    // giả định là tên icon hợp lệ và dùng trực tiếp
    if (
      normalizedIcon.endsWith("-outline") ||
      normalizedIcon.endsWith("-sharp") ||
      normalizedIcon.endsWith("-filled")
    ) {
      return normalizedIcon;
    }

    // Nếu không có trong mapping và không có suffix hợp lệ, fallback về checkmark-circle
    return "checkmark-circle";
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FBBF24" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FBBF24" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#D1D5DB"
        />
      );
    }
    return stars;
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

  if (error || !room) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
          <Text style={styles.errorText}>
            {error || "Không tìm thấy thông tin phòng"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRoomData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hotelId = params.hotelId
    ? Number(params.hotelId)
    : room.hotel?.id || hotel?.id;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {String(room.roomType?.name || "Phòng tiêu chuẩn")}
          </Text>
          {hotel && hotel.name && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {String(hotel.name)}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        {images.length > 0 && images[currentImageIndex] ? (
          <View style={styles.imageContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                const currentImage = images[currentImageIndex];
                if (currentImage && currentImage.imageUrl) {
                  const imageUrl =
                    typeof currentImage.imageUrl === "string"
                      ? currentImage.imageUrl
                      : null;

                  if (imageUrl) {
                    router.push({
                      pathname: "/zoom-image",
                      params: {
                        imageUrl: imageUrl,
                        imageIndex: currentImageIndex.toString(),
                        roomId: room?.id?.toString() || "",
                      },
                    } as any);
                  }
                }
              }}
            >
              <Image
                source={
                  typeof images[currentImageIndex]?.imageUrl === "string"
                    ? { uri: images[currentImageIndex].imageUrl }
                    : images[currentImageIndex]?.imageUrl ||
                      require("../../assets/images/anh1.jpg")
                }
                style={styles.mainImage}
                defaultSource={require("../../assets/images/anh1.jpg")}
                onError={(error) => {
                  console.warn("Image load error:", error);
                }}
              />
            </TouchableOpacity>
            {images.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavButtonLeft]}
                  onPress={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + images.length) % images.length
                    )
                  }
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavButtonRight]}
                  onPress={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                  }
                >
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.imageIndicator}>
                  <Text style={styles.imageIndicatorText}>
                    {currentImageIndex + 1} / {images.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        ) : null}

        {/* Room Info */}
        <View style={styles.content}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.roomTitle}>
                {String(room.roomType?.name || "Phòng tiêu chuẩn")}
              </Text>
              {room.averageRating && (
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(room.averageRating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {room.averageRating.toFixed(1)}
                  </Text>
                  {room.reviewCount && room.reviewCount > 0 && (
                    <Text style={styles.reviewCountText}>
                      ({String(room.reviewCount)} đánh giá)
                    </Text>
                  )}
                </View>
              )}
            </View>
            {room.roomNumber && (
              <Text style={styles.roomNumber}>
                Phòng số: {String(room.roomNumber)}
              </Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            {room.discountPrice &&
            room.price &&
            Number(room.discountPrice) < Number(room.price) ? (
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>
                  {`$${Number(room.price || 0).toLocaleString()}`}
                </Text>
                <Text style={styles.discountPrice}>
                  {`$${Number(room.discountPrice || 0).toLocaleString()}`}
                </Text>
                <Text style={styles.priceUnit}>/đêm</Text>
              </View>
            ) : (
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  {`$${Number(room.price || 0).toLocaleString()}`}
                </Text>
                <Text style={styles.priceUnit}>/đêm</Text>
              </View>
            )}
          </View>

          {/* Room Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons
                name="people-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.detailLabel}>Sức chứa:</Text>
              <Text style={styles.detailValue}>
                {String(room.capacity || 2)} người
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="square-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.detailLabel}>Diện tích:</Text>
              <Text style={styles.detailValue}>
                {String(room.roomSize || 25)}m²
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name={room.isAvailable ? "checkmark-circle" : "close-circle"}
                size={20}
                color={room.isAvailable ? "#10B981" : "#DC2626"}
              />
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: room.isAvailable ? "#10B981" : "#DC2626" },
                ]}
              >
                {room.isAvailable ? "Có sẵn" : "Đã đặt"}
              </Text>
            </View>
          </View>

          {/* Description */}
          {room.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.descriptionText}>
                {String(room.description || "")}
              </Text>
            </View>
          )}

          {/* Room Type Info */}
          {room.roomType && (
            <View style={styles.roomTypeSection}>
              <Text style={styles.sectionTitle}>Loại phòng</Text>
              {room.roomType.name && (
                <Text style={styles.roomTypeName}>
                  {String(room.roomType.name)}
                </Text>
              )}
              {room.roomType.description && (
                <Text style={styles.roomTypeDescription}>
                  {String(room.roomType.description)}
                </Text>
              )}
            </View>
          )}

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Tiện ích</Text>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map((amenity, index) => {
                  // Lấy icon từ database và validate, fallback về "checkmark-circle" nếu không hợp lệ
                  const iconName = getValidIconName(amenity?.icon);
                  return (
                    <View
                      key={amenity?.id || `amenity-${index}`}
                      style={styles.amenityItem}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={20}
                        color="#10B981"
                      />
                      <Text style={styles.amenityText}>
                        {amenity?.name || "Tiện ích"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Hotel Info (if available) */}
          {hotel && (
            <View style={styles.hotelSection}>
              <Text style={styles.sectionTitle}>Khách sạn</Text>
              <TouchableOpacity
                style={styles.hotelCard}
                onPress={() => {
                  router.push({
                    pathname: "/hotel-detail",
                    params: { hotelId: hotel?.id?.toString() || "" },
                  } as any);
                }}
              >
                {hotel.name && (
                  <Text style={styles.hotelName}>{String(hotel.name)}</Text>
                )}
                {hotel.address && (
                  <Text style={styles.hotelAddress}>
                    {String(hotel.address)}
                  </Text>
                )}
                {hotel.city && (
                  <Text style={styles.hotelCity}>
                    {typeof hotel.city === "string"
                      ? hotel.city
                      : String(hotel.city || "")}
                  </Text>
                )}
                {hotel.averageRating && (
                  <View style={styles.hotelRating}>
                    <View style={styles.starsContainer}>
                      {renderStars(hotel.averageRating)}
                    </View>
                    <Text style={styles.hotelRatingText}>
                      {hotel.averageRating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Giá mỗi đêm</Text>
          <Text style={styles.bottomPrice}>
            {`$${Number(
              room.discountPrice &&
                room.price &&
                Number(room.discountPrice) < Number(room.price)
                ? room.discountPrice
                : room.price || 0
            ).toLocaleString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            !room.isAvailable && styles.bookButtonDisabled,
          ]}
          onPress={() => {
            if (!room.isAvailable) {
              Alert.alert("Thông báo", "Phòng này hiện không có sẵn");
              return;
            }
            if (!hotelId) {
              Alert.alert("Lỗi", "Không tìm thấy thông tin khách sạn");
              return;
            }
            const finalHotelId = hotelId ? hotelId.toString() : "";
            const finalRoomId = room?.id ? room.id.toString() : "";
            router.push({
              pathname: "/select-date",
              params: {
                hotelId: finalHotelId,
                roomId: finalRoomId,
              },
            } as any);
          }}
          disabled={!room.isAvailable}
        >
          <Text style={styles.bookButtonText}>
            {room.isAvailable ? "Đặt phòng" : "Không có sẵn"}
          </Text>
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
    padding: 16,
    backgroundColor: Colors.primary,
  },
  backButton: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  imageNavButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageNavButtonLeft: {
    left: 16,
  },
  imageNavButtonRight: {
    right: 16,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  roomNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 20,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  discountPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 16,
    color: "#6B7280",
  },
  detailsSection: {
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    minWidth: 100,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  roomTypeSection: {
    marginBottom: 24,
  },
  roomTypeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  roomTypeDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  amenitiesGrid: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amenityText: {
    fontSize: 16,
    color: "#374151",
  },
  hotelSection: {
    marginBottom: 24,
  },
  hotelCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  hotelAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  hotelCity: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  hotelRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hotelRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
  },
  bookButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
